import React, { useContext} from 'react'
import LeftSidebar from './LeftSidebar'
import { AppContext } from '../../context/AppContext'
import DealOfTheDaySlider from './DealOfTheDaySlider ';
import Products from '../Products';
import { useNavigate } from 'react-router-dom';
import RecommendedProducts from './RecommendedProducts';

const CategoryProduct = () => {
const { trendTypeData, truncateText, newProducts, currency, convertPrice } = useContext(AppContext);

const navigate = useNavigate()



const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};




    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 md:mt-16 max-w-8xl mx-auto px-4 sm:px-0">

        {/* LEFT SIDEBAR - Hidden on mobile/tablet, visible on lg+ */}
            <div className="hidden lg:block lg:col-span-1">
                <LeftSidebar />
            </div>

            {/* RIGHT CONTENT - Full width on mobile, 3/4 on desktop */}
            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {trendTypeData.map((item, index) => {
                const productChunks = chunkArray(item.data, 5);

                return (
                    <div key={index} >
                    <h1 className="text-base sm:text-lg md:text-[18px] font-semibold border-b border-gray-200 py-2 sm:py-3">
                        {item.title}
                    </h1>

                    {/* HORIZONTAL SCROLL */}
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto mt-2 sm:mt-3 pb-3 snap-x snap-mandatory scroll-smooth">
                        {productChunks.map((chunk, chunkIndex) => (

                        <div key={chunkIndex} className="min-w-72 sm:min-w-76 flex flex-col gap-2 sm:gap-3 snap-center shrink-0 pr-1">
                            {chunk.map((data, i) => (

                            <div key={i} className="border border-gray-200 flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-[10px] cursor-pointer hover:shadow-md transition-shadow" onClick={()=> {navigate(`/productDetails/${data._id}/${data.category}`); scrollTo(0,0)}}>
                                <img src={data.mainImages?.[0]?.url || ""} className="h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 object-contain" alt="" />

                                <div className="flex flex-col gap-0.5 sm:gap-1">
                                <p className="font-semibold text-sm sm:text-base">
                                    {truncateText(data.name, 18)}
                                </p>
                                <p className="text-xs sm:text-[14px] text-[#787878]">
                                    {data.category}
                                </p>
                                <p className="font-semibold text-[#FF8F9C] text-base sm:text-[18px]">
                                    {currency === "USD" ? "$" : "₹"}{convertPrice(data.discountPrice || data.price)}{' '}
                                    { (data.discountPrice && data.discountPrice < data.price) && (
                                        <del className="text-xs sm:text-[13px] font-normal text-[#787878]">
                                            {currency === "USD" ? "$" : "₹"}{convertPrice(data.price)}
                                        </del>
                                    )}
                                </p>
                                </div>
                            </div>
                            ))}
                        </div>
                        ))}

                    </div>
                    </div>
                );
                })}


                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <DealOfTheDaySlider />
                </div>


                <div className="py-4 sm:py-5 col-span-1 md:col-span-2 lg:col-span-3 mt-3 sm:mt-5">
                    <h1 className="text-lg sm:text-xl md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200">New Products</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4 sm:mt-5 gap-4 sm:gap-6 md:gap-8">
                        {newProducts.map((product)=>{
                            return(
                                <Products key={product._id} product={product} />
                            )
                        })}
                    </div>
                    
                </div>

                <div className="py-4 sm:py-5 col-span-1 md:col-span-2 lg:col-span-3 mt-3 sm:mt-5">
                   <RecommendedProducts />
                </div>

            </div>
        </div>
    );
};

export default CategoryProduct;

