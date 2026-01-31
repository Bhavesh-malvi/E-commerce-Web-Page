import React, { useContext, useEffect, useState } from "react";
import StarRating from "../../UI/StarRating";
import OfferTimer from "../../UI/OfferTimer";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import CartButton from "../../UI/CartButton";

const DealOfTheDaySlider = () => {
  const { currency, convertPrice, activeDeals } = useContext(AppContext);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // Create a flattened list of products with their associated deal's metadata
  const productsWithDeals = activeDeals ? activeDeals.flatMap(deal => 
    (deal.products || []).map(product => {
      // Calculate discount price based on deal's percentage IF product doesn't already have a lower discountPrice
      const dealDiscountedPrice = product.price * (1 - (deal.discountPercentage || 0) / 100);
      return {
        ...product,
        dealEndDate: deal.endDate,
        dealTitle: deal.title,
        effectiveDiscountPrice: product.discountPrice && product.discountPrice < dealDiscountedPrice 
                                ? product.discountPrice 
                                : dealDiscountedPrice
      };
    })
  ) : [];

  console.log("Active Deals in Slider:", activeDeals);
  console.log("Flattened Products:", productsWithDeals);

  useEffect(() => {
    if (productsWithDeals.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev >= productsWithDeals.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [productsWithDeals.length]);

  if (productsWithDeals.length === 0) {
    return null; // Or show a message that no deals are active
  }

  return (
    <div className="col-span-3 overflow-hidden">
      <h1 className="text-lg sm:text-xl md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200">
        Deal of the day
      </h1>

      <div className="relative overflow-hidden mt-4 sm:mt-5 md:mt-6">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {productsWithDeals.map((item, i) => (
            <div key={i} className="min-w-full flex justify-center cursor-pointer" onClick={()=> {navigate(`/productDetails/${item._id}/${item.category}`); scrollTo(0,0)}}>
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 border items-center rounded-[10px] sm:rounded-[15px]
                border-gray-200 p-4 sm:p-5 w-full"
              >
                <div className="flex justify-center items-center h-48 sm:h-64 md:h-[300px]">
                  <img src={item.mainImages?.[0]?.url || ""} alt={item.name} className="max-h-full object-contain" />
                </div>

                <div className="flex flex-col gap-2 sm:gap-3">
                  <StarRating rating={item.ratings || item.rating} />

                  <h1 className="uppercase font-bold tracking-wide text-[#343434] text-base sm:text-lg md:text-xl">
                    {item.name}
                  </h1>

                  <p className="text-[#787878] text-xs sm:text-sm md:text-[14px] line-clamp-2">
                    {item.dealTitle || item.description}
                  </p>

                  <p className="font-bold text-xl sm:text-2xl md:text-[25px] text-[#FF8F9C]">
                    {currency === "USD" ? "$" : "₹"}{convertPrice(item.effectiveDiscountPrice || item.price)}{' '}
                    { (item.effectiveDiscountPrice < item.price) && (
                      <del className="text-xs sm:text-sm md:text-[13px] font-normal text-[#787878]">
                        {currency === "USD" ? "$" : "₹"}{convertPrice(item.price)}
                      </del>
                    )}
                  </p>

                  <div className=""  onClick={(e)=> e.stopPropagation()}>
                    <CartButton productId={item._id} />
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm md:text-[13.5px] ">
                    <p>
                      ALREADY SOLD: <span className="font-semibold">{item.sold || 0}</span>
                    </p>
                    <p>
                      AVAILABLE: <span className="font-semibold">{item.stock}</span>
                    </p>
                  </div>
                  <div className="h-2 rounded-2xl bg-[#EDEDED] px-0.5 py-0.5">
                    <div 
                      className="h-1 rounded-2xl bg-[#FF8F9C]" 
                      style={{ width: `${Math.min(((item.sold || 0) / (item.sold + item.stock || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                    <OfferTimer endDate={item.dealEndDate}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealOfTheDaySlider;
