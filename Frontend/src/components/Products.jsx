import React, { useContext, useState } from 'react'
import StarRating from '../UI/StarRating'
import { AppContext } from '../context/AppContext'
import { CiHeart } from 'react-icons/ci'
import { IoBagAddOutline, IoEyeOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { IoIosHeart, IoIosHeartEmpty } from 'react-icons/io'
import { useToast } from './common/Toast'

const Products = ({product}) => {

  const {truncateText, currency, convertPrice, wishlist, addToWishlist, removeFromWishlist, addToCart} = useContext(AppContext)
  const navigate = useNavigate()
  const toast = useToast()

  
  const isInWishlist = wishlist?.items?.some(item => 
    (item.product?._id === product._id) || (item.product === product._id)
  );

  const toggleWishlist = async () => {
    if (isInWishlist) {
      const wishItem = wishlist.items.find(item => 
        (item.product?._id === product._id) || (item.product === product._id)
      );
      if (wishItem) {
        await removeFromWishlist(wishItem._id);
      }
    } else {
      await addToWishlist(product._id);
    }
  };

  const [isHover, setIsHover] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)


  return (
    <>
      {/* Card with hover & touch effects */}
      <div 
        className="max-h-90 border border-gray-200 rounded-[10px] sm:rounded-[15px] py-2 relative overflow-hidden hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] active:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group" 
        onMouseEnter={()=> setIsHover(true)} 
        onMouseLeave={()=> setIsHover(false)}
        onTouchStart={()=> setIsHover(true)}
        onTouchEnd={()=> setTimeout(() => setIsHover(false), 300)}
      >
          {(() => {
            // Determine if on sale
            const price = Number(product.price || 0);
            // Priority: activeDeal discount > regular discountPrice
            const discountPrice = product.activeDeal?.dealDiscount  
              ? Number(product.activeDeal.dealDiscount)
              : Number(product.discountPrice || product.offerPrice || 0);
            const isSale = discountPrice > 0 && discountPrice < price;
            
            // Determine badge logic - STRICT EXACT match for "new" or "sale" only
            const productBadges = Array.isArray(product.badges) ? product.badges : [];
            let badgeToShow = "";
            let badgeColor = "";

            // Check for EXACT match of "new" or "sale" in the list
            const hasSaleBadge = productBadges.some(b => b?.toString().toLowerCase() === "sale");
            const hasNewBadge = productBadges.some(b => b?.toString().toLowerCase() === "new");

            if (hasSaleBadge) {
                badgeToShow = "Sale";
                badgeColor = "bg-[#212121]";
            } else if (hasNewBadge) {
                badgeToShow = "New";
                badgeColor = "bg-[#FF8F9C]";
            }

            // Fallback to ONLY the single badge field IF it's exactly "new" or "sale"
            if (!badgeToShow && product.badge) {
                const lower = product.badge.toString().toLowerCase();
                if (lower === "new") {
                    badgeToShow = "New";
                    badgeColor = "bg-[#FF8F9C]";
                } else if (lower === "sale") {
                    badgeToShow = "Sale";
                    badgeColor = "bg-[#212121]";
                }
            }

            if (!badgeToShow) return null;

            return (
                <div className={`absolute px-6 sm:px-8 -rotate-45 top-2 sm:top-3 -left-6 sm:-left-7 text-[10px] sm:text-[12px] py-0.5 z-10 uppercase text-white ${badgeColor}`}>
                    {badgeToShow}
                </div>
            );
          })()}

          
          {/* Action Icons - Always visible on mobile/tablet, hover on large desktop */}
          <ul className='absolute right-1 sm:right-1.5 top-1.5 sm:top-2 flex flex-col gap-0.5 sm:gap-1 translate-x-0 lg:translate-x-10 lg:group-hover:translate-x-0 transition-all duration-300 z-20'>
            <li className={`border border-gray-300 p-0.5 sm:p-1 rounded-[5px] bg-white cursor-pointer transition-colors shadow-sm ${isInWishlist ? 'text-red-500 bg-red-50 border-red-200' : ''}`} onClick={toggleWishlist}>
              {isInWishlist ? (
                <IoIosHeart className="text-base sm:text-[20px] text-red-500" />
              ) : (
                <IoIosHeartEmpty className="text-base sm:text-[20px]" />
              )}
            </li>
            <li className='border border-gray-300 p-0.5 sm:p-1 rounded-[5px] bg-white cursor-pointer shadow-sm' onClick={() => {navigate(`/productDetails/${product._id}/${product.category}`); scrollTo(0,0)}}><IoEyeOutline  className='text-base sm:text-[20px]'/></li>
            <li 
              className={`border border-gray-300 p-0.5 sm:p-1 rounded-[5px] bg-white cursor-pointer shadow-sm ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={async () => {
                if (isAddingToCart) return;
                setIsAddingToCart(true);
                const res = await addToCart(product._id, 1);
                if (res?.success) {
                  toast.success('Added to cart!');
                } else {
                  toast.error(res?.message || 'Failed to add to cart');
                }
                setIsAddingToCart(false);
              }}
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-gray-600"></div>
              ) : (
                <IoBagAddOutline className='text-base sm:text-[20px]'/>
              )}
            </li>
          </ul>

          <div className="h-45 flex justify-center items-center rounded-t-[15px] overflow-hidden">
            {(() => {
              // 🖼️ IMAGE LOGIC: Handle both Real (mainImages) and Dummy (image)
              let displayImg = "";
              
              if (product.mainImages && product.mainImages.length > 0) {
                // Real data format: [{url: '...'}]
                const idx = isHover && product.mainImages.length > 1 ? 1 : 0;
                displayImg = product.mainImages[idx]?.url;
              } else if (product.image && product.image.length > 0) {
                // Dummy/Seeded data format: [img1, img2, ...] or string
                const idx = isHover && product.image.length > 1 ? 1 : 0;
                displayImg = product.image[idx];
              } else if (typeof product.image === 'string') {
                displayImg = product.image;
              }

              return (
                <img 
                  src={displayImg || ""} 
                  alt={product.name} 
                  className='w-full h-full object-contain transition-all duration-300 group-hover:scale-110 group-active:scale-110' 
                />
              );
            })()}
          </div>
          <div className="py-2 sm:py-3 px-2 sm:px-3 flex flex-col gap-1.5 sm:gap-2">
            <p className='capitalize text-xs sm:text-[14px] text-[#FF8F9C]'>{product.subCategory}</p>
            <p className='text-[#343434] font-medium tracking-wide text-sm sm:text-base'>{truncateText(product.name)}</p>
            <StarRating rating={product.ratings || product.rating} textSize={"18px"} />
            {(() => {
              const basePrice = Number(product.price || 0);
              // Priority: activeDeal discount > regular discountPrice
              const salePrice = product.activeDeal?.dealDiscount  
                ? Number(product.activeDeal.dealDiscount)
                : Number(product.discountPrice || product.offerPrice || 0);
              const hasDiscount = salePrice > 0 && salePrice < basePrice;
              const finalPrice = hasDiscount ? salePrice : basePrice;

              return (
                <p className='font-semibold mt-0.5 sm:mt-1 text-sm sm:text-base'>
                  {currency === "USD" ? "$" : "₹"}{convertPrice(finalPrice)}
                  {hasDiscount && (
                    <del className='font-normal text-[#787878] ml-1.5 sm:ml-2 text-xs sm:text-sm'>
                      {currency === "USD" ? "$" : "₹"}{convertPrice(basePrice)}
                    </del>
                  )}
                </p>
              );
            })()}
          </div>
      </div>
    </>
  )
}

export default Products