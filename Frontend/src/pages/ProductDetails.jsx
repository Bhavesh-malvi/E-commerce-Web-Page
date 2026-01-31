/* eslint-disable react-hooks/purity */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { IoIosCheckmarkCircleOutline, IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useParams } from "react-router-dom";

import StarRating from "../UI/StarRating";
import { AppContext } from "../context/AppContext";
import Products from "../components/Products";
import CartButton from "../UI/CartButton";
import BuyButton from "../UI/BuyButton";
import ProductsInfo from "../components/ProductDetails/ProductsInfo";
import ProductReview from "../components/ProductDetails/ProductReview";
import RecentlyViewed from "../components/ProductDetails/RecentlyViewed";


const ProductDetails = () => {
  const { id } = useParams();

  const { currency, convertPrice, getSingleProduct, addToCart, products, trackActivity, wishlist, addToWishlist, removeFromWishlist } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

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
      // If product has variants, select first one by default if it has color info
      if (res.product.variants?.length > 0) {
        setSelectedVariant(res.product.variants[0]);
      } else {
        setSelectedVariant(null);
      }

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

  // Dynamic values based on selection
  const currentImages = useMemo(() => {
    if (!product) return [];
    if (selectedVariant?.images?.length > 0) return selectedVariant.images.map(img => img.url);
    return product.mainImages?.map(img => img.url) || [];
  }, [product, selectedVariant]);

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    
    const targetGender = product.gender?.toLowerCase();
    
    return products
      .filter((p) => {
        const isSameCategory = p.category === product.category;
        const isDifferentProduct = p._id !== product._id;
        
        // If gender exists on both, match case-insensitively
        // If one is missing, we might still want to show it if category matches, 
        // but here the user specifically wants gender separation.
        const isSameGender = !targetGender || p.gender?.toLowerCase() === targetGender;
        
        return isSameCategory && isDifferentProduct && isSameGender;
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
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{product.name}</h1>
              {product.brand && <p className="text-sm sm:text-base text-gray-500">{product.brand}</p>}
            </div>

            <div className="flex gap-2 sm:gap-3 items-center">
              <StarRating rating={product.ratings || 0} textSize={"18px"} />
              <p className="text-xs sm:text-[13px] text-gray-500">({product.numOfReviews || 0} reviews)</p>
            </div>

            <div className="flex items-baseline gap-3 sm:gap-4">
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
            </div>

            {/* SELECTION AREA */}
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 border-y border-gray-100">
              {/* Color Selection */}
              {product.variants?.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Color: <span className="font-normal">{selectedVariant?.color}</span></p>
                  <div className="flex gap-2 sm:gap-3">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedVariant(v);
                          setIndex(0); // Reset image index
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all p-0.5 ${
                          selectedVariant?.color === v.color 
                            ? "border-[#FF8F9C] scale-110" 
                            : "border-transparent hover:border-gray-300"
                        } ${v.stock === 0 ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
                        title={v.color}
                        disabled={v.stock === 0}
                      >
                        <span 
                          className="block w-full h-full rounded-full shadow-inner" 
                          style={{ backgroundColor: v.colorCode || '#ccc' }}
                        ></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <p className={`flex items-center gap-1 font-medium text-sm sm:text-base ${
                (selectedVariant?.stock || product.stock) > 0 ? "text-green-600" : "text-red-500"
              }`}>
                <IoIosCheckmarkCircleOutline className="text-lg sm:text-[20px]" />
                {(selectedVariant?.stock || product.stock) > 0 ? "In Stock" : "Out of Stock"}
              </p>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Description</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>

            <div className="flex sm:flex-row  items-stretch sm:items-center gap-3">
              <div 
                className={`${(selectedVariant?.stock || product.stock) === 0 ? "opacity-30 pointer-events-none" : ""}`}
              >
                <CartButton 
                  productId={product._id} 
                  variant={selectedVariant} 
                  isDisabled={(selectedVariant?.stock || product.stock) === 0} 
                />
              </div>
              
              <div
                className={`${(selectedVariant?.stock || product.stock) === 0 ? "opacity-30 pointer-events-none" : ""}`}
              >
                <BuyButton 
                  image={product?.mainImages?.[0]?.url || ""} 
                  onClick={() => {/* Buy logic later */}}
                />
              </div>
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


      <ProductReview productData={product} refreshProduct={fetchProduct} />
      <RecentlyViewed currentProductId={product._id} />
    </>
  );
};

export default ProductDetails;
