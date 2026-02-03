/* eslint-disable react-hooks/purity */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { IoIosCheckmarkCircleOutline, IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../Api/Api";

import StarRating from "../UI/StarRating";
import { AppContext } from "../context/AppContext";
import Products from "../components/Products";
import CartButton from "../UI/CartButton";
import BuyButton from "../UI/BuyButton";
import ProductsInfo from "../components/ProductDetails/ProductsInfo";
import ProductReview from "../components/ProductDetails/ProductReview";
import RecentlyViewed from "../components/ProductDetails/RecentlyViewed";
import { useToast } from "../components/common/Toast";


const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { currency, convertPrice, getSingleProduct, addToCart, products, trackActivity, wishlist, addToWishlist, removeFromWishlist, user, setOpen } = useContext(AppContext);
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState("");

  const handleNotify = async () => {
    try {
      const email = user ? user.email : notifyEmail;
      if (!email) {
        toast.error("Please enter your email");
        return;
      }
      
      const res = await API.post("/product/notify-restock", {
        productId: product._id,
        email
      });
      
      if (res.data.success) {
        toast.success(res.data.message);
        setNotifyEmail("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const res = await getSingleProduct(id);
    if (res?.success) {
      setProduct(res.product);
      setIndex(0); // Reset image index
      // Don't auto-select variant - show main product images by default
      setSelectedVariant(null);

      // Track browsing history
      trackActivity({
        product: res.product._id,
        category: res.product.category,
        action: "view",
        device: navigator.userAgent
      });
    }
    setLoading(false);
  };


  const isInWishlist = wishlist?.items?.some(item => 
    (item.product?._id === product?._id) || (item.product === product?._id)
  );

  const toggleWishlist = async () => {
    if (!user) {
      setOpen(true);
      return;
    }
    if (isInWishlist) {
      const wishItem = wishlist.items.find(item => 
        (item.product?._id === product?._id) || (item.product === product?._id)
      );
      if (wishItem) {
        await removeFromWishlist(wishItem._id);
      }
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      setOpen(true);
      return;
    }

    try {
      const res = await addToCart(product._id, 1, selectedVariant);
      if (res?.success) {
        toast.success("Redirecting to cart...");
        navigate("/cart");
      } else {
        toast.error(res?.message || "Login required to purchase");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Buy Now Error:", error);
    }
  };

  // Dynamic values based on selection
  const currentImages = useMemo(() => {
    if (!product) return [];
    // Only show variant images when a variant is explicitly selected
    if (selectedVariant?.images?.length > 0) return selectedVariant.images.map(img => img.url);
    // Default: show main product images
    return product.mainImages?.map(img => img.url) || [];
  }, [product, selectedVariant]);

  // Track activity to LocalStorage (LIFO)
  useEffect(() => {
    if (product) {
      const history = JSON.parse(localStorage.getItem("browsingHistory") || "[]");
      const newHistory = [product._id, ...history.filter(id => id !== product._id)].slice(0, 15);
      localStorage.setItem("browsingHistory", JSON.stringify(newHistory));
    }
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    
    const targetGender = product.gender?.toLowerCase();
    const targetSubCategory = product.subCategory?.toLowerCase(); // Strict check
    
    return products
      .filter((p) => {
        const isSameCategory = p.category === product.category;
        const isDifferentProduct = p._id !== product._id;
        
        // Strict Gender Check
        const isSameGender = !targetGender || p.gender?.toLowerCase() === targetGender;

        // Strict SubCategory Check (if available)
        const isSameSubCategory = !targetSubCategory || p.subCategory?.toLowerCase() === targetSubCategory;
        
        return isSameCategory && isDifferentProduct && isSameGender && isSameSubCategory;
      })
      .slice(0, 5);
  }, [product, products]);

  const isExistInfo = product?.specifications?.length > 0;

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8F9C]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="py-10 sm:py-12 md:py-15 px-3 sm:px-0">
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm md:text-[14px] text-[#454545] font-medium">
            Home / {product.category}
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 my-6 sm:my-8 md:my-10">
          {/* Images - Mobile: Column layout, Desktop: Row layout */}
          <div className="flex md:grid md:grid-cols-5 flex-col-reverse md:flex-row gap-3 sm:gap-4 md:gap-5">
            {/* Thumbnail images - below on mobile, left side on desktop */}
            <div className="flex md:flex-col gap-2 sm:gap-3 overflow-x-auto md:overflow-visible md:p-3 pb-2 md:pb-0 no-scrollbar">
              {currentImages.map((item, i) => (
                <div
                  key={i}
                  className={`border rounded-[5px] min-w-[60px] w-16 h-16 sm:min-w-[70px] sm:w-18 sm:h-18 md:min-w-0 md:w-full md:h-23 p-0.5 cursor-pointer flex-shrink-0 ${
                    index === i ? "border-[#FF8F9C] shadow-md" : "border-gray-300"
                  }`}
                  onClick={() => setIndex(i)}
                >
                  <img src={item} className="object-cover w-full h-full rounded" alt="" />
                </div>
              ))}
            </div>

            {/* Main image */}
            <div className="border md:col-span-4 border-gray-300 rounded-[10px] aspect-square overflow-hidden relative">
              <img src={currentImages[index]} className="object-contain w-full h-full" alt="" />
              <div className="absolute top-3 sm:top-5 right-3 sm:right-5 bg-white/80 p-1.5 sm:p-2 rounded-full" onClick={toggleWishlist}>
                {isInWishlist ? <IoMdHeart className="text-xl sm:text-[25px] text-red-500 cursor-pointer transition-colors"  /> : <IoMdHeartEmpty className="text-xl sm:text-[25px] text-[#454545] cursor-pointer hover:text-red-500 transition-colors"  />}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 sm:gap-3 justify-around h-full">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                {product.brand && <p className="text-sm sm:text-base text-gray-500 font-medium">{product.brand}</p>}
                {product.seller?.shopName && (
                  <p className="text-xs sm:text-sm text-gray-400">
                    Sold by: <span className="text-purple-600 font-semibold hover:underline cursor-pointer">{product.seller.shopName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Price + Rating on same line */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-2xl sm:text-3xl font-bold text-[#FF8F9C]">
                {currency === "USD" ? "$" : "₹"}
                {convertPrice(selectedVariant?.price || product.discountPrice || product.price)}
              </span>
              {(product.discountPrice || selectedVariant?.price < product.price) && (
                <del className="text-gray-400 text-base sm:text-lg">
                  {currency === "USD" ? "$" : "₹"}
                  {convertPrice(product.price)}
                </del>
              )}
              <div className="flex items-center gap-1.5 ml-2 border-l border-gray-300 pl-3">
                <StarRating rating={product.ratings || 0} textSize={"16px"} />
                <p className="text-xs text-gray-500">({product.numOfReviews || 0})</p>
              </div>
            </div>

            {/* SELECTION AREA */}
            <div className="space-y-2 sm:space-y-3 py-2 sm:py-3 border-y border-gray-100">
              {/* Variant Selection */}
              {product.variants?.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Variant: <span className="font-normal">{selectedVariant?.color || 'Main Product'}</span>
                  </p>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {/* Main Product Option */}
                    <button
                      onClick={() => {
                        setSelectedVariant(null);
                        setIndex(0);
                      }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all overflow-hidden ${
                        selectedVariant === null 
                          ? "border-[#FF8F9C] scale-110 ring-2 ring-[#FF8F9C]/30" 
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      title="Main Product"
                    >
                      <img 
                        src={product.mainImages?.[0]?.url} 
                        alt="Main" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {/* Variant Options */}
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedVariant(v);
                          setIndex(0);
                        }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all overflow-hidden ${
                          selectedVariant?.color === v.color 
                            ? "border-[#FF8F9C] scale-110 ring-2 ring-[#FF8F9C]/30" 
                            : "border-gray-200 hover:border-gray-400"
                        } ${v.stock === 0 ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
                        title={v.color}
                        disabled={v.stock === 0}
                      >
                        {v.images?.[0]?.url ? (
                          <img 
                            src={v.images[0].url} 
                            alt={v.color} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span 
                            className="block w-full h-full rounded-full" 
                            style={{ backgroundColor: v.colorCode || '#ccc' }}
                          ></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status with Progress Bar */}
              {(() => {
                const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
                const soldCount = selectedVariant ? 0 : (product.sold || 0); // Variants don't track sold separately
                const totalStock = currentStock + soldCount;
                const soldPercent = totalStock > 0 ? (soldCount / totalStock) * 100 : 0;

                return (
                  <div className="space-y-2 max-w-md">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      <span>Already Sold: <span className="text-gray-800 font-bold">{soldCount}</span></span>
                      <span>Available: <span className={`font-bold ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>{currentStock}</span></span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#FF8F9C] to-[#ff7b8b] rounded-full transition-all duration-500"
                        style={{ width: `${soldPercent}%` }}
                      ></div>
                    </div>
                    {currentStock === 0 && (
                      <p className="text-red-500 font-medium text-sm flex items-center gap-1">
                        <IoIosCheckmarkCircleOutline className="text-lg" /> Out of Stock
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Description</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.shortDescription || "No description available for this product."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {(selectedVariant?.stock ?? product.stock) === 0 ? (
                 <div className="w-full max-w-md bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Notify me when available:</p>
                    <div className="flex gap-2">
                       {!user && (
                         <input 
                           type="email" 
                           placeholder="Enter your email" 
                           className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF8F9C]"
                           value={notifyEmail}
                           onChange={(e) => setNotifyEmail(e.target.value)}
                         />
                       )}
                       <button 
                         onClick={handleNotify}
                         className="bg-[#FF8F9C] hover:bg-[#ff7b8b] text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap"
                       >
                         Notify Me 🔔
                       </button>
                    </div>
                 </div>
              ) : (
                <>
                  <div>
                    <CartButton 
                      productId={product._id} 
                      variant={selectedVariant} 
                    />
                  </div>
                  
                  <div>
                    <BuyButton 
                      image={currentImages[0] || ""} 
                      onClick={handleBuyNow}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      <ProductsInfo product={product} />

      {/* RELATED PRODUCTS */}
      <div className="px-3 sm:px-0">
        <h1 className="text-lg sm:text-xl md:text-[22px] font-semibold border-b w-fit pr-3 sm:pr-5 py-2 my-10 sm:my-12 md:my-15 text-[#323232] border-gray-300">
          Related Products
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 ">
          {relatedProducts.map((item) => (
            <Products key={item._id} product={item} />
          ))}
        </div>
      </div>


      <ProductReview productData={product} refreshProduct={fetchProduct} initialOpen={location.state?.openReview} />

      {/* DESCRIPTION BLOCKS */}
      {product.descriptionBlocks?.length > 0 && (
        <div className="px-3 sm:px-0 my-10 sm:my-12 md:my-16">
          <h1 className="text-lg sm:text-xl md:text-[22px] font-semibold border-b w-fit pr-3 sm:pr-5 py-2 mb-8 text-[#323232] border-gray-300">
            Product Details
          </h1>
          
          <div className="space-y-8 sm:space-y-10">
            {product.descriptionBlocks
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((block, idx) => (
                <div key={idx} className="description-block">
                  {/* TEXT BLOCK */}
                  {block.type === "text" && (
                    <div className="prose max-w-none">
                      {block.title && (
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{block.title}</h3>
                      )}
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {block.content}
                      </p>
                    </div>
                  )}

                  {/* IMAGE BLOCK */}
                  {block.type === "image" && (
                    <div className="space-y-2">
                      {block.title && (
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">{block.title}</h3>
                      )}
                      <img 
                        src={typeof block.content === 'object' ? block.content.url : block.content} 
                        alt={block.title || "Product detail"} 
                        className="w-full max-w-3xl rounded-xl shadow-sm border border-gray-100"
                      />
                    </div>
                  )}

                  {/* BANNER BLOCK */}
                  {block.type === "banner" && (
                    <div 
                      className="relative rounded-xl overflow-hidden w-full h-40 sm:h-52 md:h-64 bg-center bg-contain bg-no-repeat"
                      style={{ 
                        backgroundImage: `url(${typeof block.content === 'object' ? block.content.url : block.content})` 
                      }}
                    >
                      {block.title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold p-4 sm:p-6">{block.title}</h3>
                        </div>
                      )}
                    </div>
                  )}

                  {/* LIST BLOCK */}
                  {block.type === "list" && (
                    <div>
                      {block.title && (
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">{block.title}</h3>
                      )}
                      <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-600">
                        {Array.isArray(block.content) 
                          ? block.content.map((item, i) => (
                              <li key={i} className="leading-relaxed">{item}</li>
                            ))
                          : <li>{block.content}</li>
                        }
                      </ul>
                    </div>
                  )}

                  {/* VIDEO BLOCK */}
                  {block.type === "video" && (
                    <div className="space-y-2">
                      {block.title && (
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">{block.title}</h3>
                      )}
                      <video 
                        src={typeof block.content === 'object' ? block.content.url : block.content} 
                        controls 
                        className="w-full max-w-3xl rounded-xl shadow-sm"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <RecentlyViewed currentProductId={product._id} />
    </>
  );
};

export default ProductDetails;
