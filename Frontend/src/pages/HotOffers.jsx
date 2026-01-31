import React, { useContext, useEffect, useRef, useState } from 'react'
import { SlFire } from 'react-icons/sl'
import Products from '../components/Products';
import { AppContext } from '../context/AppContext';

const HotOffers = () => {

    const { activeMegaDeal } = useContext(AppContext);

    const [timerDays, setTimerDays] = useState('00');
        const [timerHours, setTimerHours] = useState('00');
        const [timerMinutes, setTimerMinutes] = useState('00');
        const [timerSeconds, setTimerSeconds] = useState('00');
        const [filteredData, setFilteredData] = useState("All")
    
        let interval = useRef();
    
        const startTimer = () => {
            if (!activeMegaDeal?.endDate) return;
            
            const countdownDate = new Date(activeMegaDeal.endDate).getTime();
    
            interval = setInterval(()=>{
                let nowTime = new Date().getTime();
                let distance = countdownDate - nowTime;
    
                const days = Math.floor(distance/(24*60*60*1000)),
                hours = Math.floor((distance % (24*60*60*1000))/(60*60*1000)),
                minutes = Math.floor((distance % (60*60*1000))/(60*1000)),
                seconds = Math.floor((distance % (60*1000)) / (1000));
    
                if(distance < 0){
                    clearInterval(interval.current);
                }else{
                    setTimerDays(days);
                    setTimerHours(hours);
                    setTimerMinutes(minutes);
                    setTimerSeconds(seconds);
                }
            },1000)
        };
    
    
        useEffect(()=>{
            startTimer();
            return()=>{
                // eslint-disable-next-line react-hooks/exhaustive-deps
                clearInterval(interval.current)
            };
        }, [activeMegaDeal]);

    // Extract unique categories dynamically (excluding genderType)
    const megaDealProducts = activeMegaDeal?.products || [];
    const uniqueCategories = React.useMemo(() => {
        const categories = new Set();
        
        megaDealProducts.forEach(product => {
            // Only add category (not genderType)
            if (product.category) {
                categories.add(product.category);
            }
        });
        
        return Array.from(categories).sort();
    }, [megaDealProducts]);

    // If no active mega deal, show message
    if (!activeMegaDeal) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-400 mb-2">No Mega Deals Active</h2>
                    <p className="text-gray-500">Check back soon for amazing offers!</p>
                </div>
            </div>
        );
    }

    const productsOnSale = megaDealProducts.length;
    const maxDiscount = activeMegaDeal.discountPercentage || 70;

    return (
        <>
            <section className='relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6'>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-7xl">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF8F9C]/10  border border-[#FF8F9C]/30 rounded-full mb-4 sm:mb-6 w-fit text-[#FF8F9C]">
                            <SlFire className="text-sm sm:text-base" />
                            <span className='text-xs sm:text-sm font-medium text-[#f86879]'>Limited Time Offer</span>
                        </div>

                        <h1 className='font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4'>
                            <span className='text-[#262626]'>Hot </span>
                            <span className='text-gradient-pink'>Deals</span>
                        </h1>

                        <p className='text-base sm:text-lg md:text-xl text-[#737373] max-w-2xl mb-6 sm:mb-8'>
                            {activeMegaDeal.description || `Discover incredible savings on luxury jewelry, fashion, shoes & more. Up to ${activeMegaDeal.discountPercentage}% OFF on premium brands.`}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                            <button className='inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-[#ffffff] transition-all duration-300 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled::pointer-event-none disabled::opacity-50 [&_svg]:pointer-event-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-pink text-[#ffffff] font-semibold shadow-pink hover:shadow-lg hover:scale-105 active:scale-100 h-12 sm:h-14 rounded-lg px-6 sm:px-10 text-sm sm:text-base group'>
                                Shop Now
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </button>
                            <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-[#ffffff] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border-2 border-[#ff8f98] text-[#ff8f98] hover:bg-[#ff8f98] hover:text-[#ffffff] font-semibold h-12 sm:h-14 rounded-lg px-6 sm:px-10 text-sm sm:text-base">View All Deals</button>
                        </div>
                    </div>


                    <div className="w-full">
                        <div className="flex justify-center mb-6 sm:mb-8 lg:mb-10">
                            <div className="bg-white/80 backdrop-blur-sm border border-[#e6e6e6] h-fit rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-card w-full max-w-md">
                                <p className='text-sm text-[#737373] text-center uppercase tracking-widest mb-4'>Sale Ends In</p>

                                <div class="flex items-center gap-3 md:gap-4">
                                    <div class="flex flex-col items-center">
                                        <div class="relative">
                                            <div class="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#e6e6e6] rounded-xl flex items-center justify-center shadow-card">
                                                <span class="text-2xl md:text-3xl font-bold text-gradient-pink font-playfair">{timerDays}</span>
                                            </div>
                                            <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8F9C] rounded-full animate-pulse"></div>
                                        </div>
                                        <span class="mt-2 text-xs md:text-sm text-[#737373] uppercase tracking-widest">Days</span>
                                    </div>
                                    <span class="text-2xl text-[#ff8f98] font-bold -mt-6">:</span>
                                    <div class="flex flex-col items-center">
                                        <div class="relative">
                                            <div class="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#e6e6e6] rounded-xl flex items-center justify-center shadow-card">
                                                <span class="text-2xl md:text-3xl font-bold text-gradient-pink font-playfair">{timerHours}</span>
                                            </div>
                                            <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8F9C] rounded-full animate-pulse"></div>
                                        </div>
                                        <span class="mt-2 text-xs md:text-sm text-[#737373] uppercase tracking-widest">Hours</span>
                                    </div>
                                    <span class="text-2xl text-[#ff8f98] font-bold -mt-6">:</span>
                                    <div class="flex flex-col items-center">
                                        <div class="relative">
                                            <div class="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#e6e6e6] rounded-xl flex items-center justify-center shadow-card">
                                                <span class="text-2xl md:text-3xl font-bold text-gradient-pink font-playfair">{timerMinutes}</span>
                                            </div>
                                            <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8F9C] rounded-full animate-pulse"></div>
                                        </div>
                                        <span class="mt-2 text-xs md:text-sm text-[#737373] uppercase tracking-widest">Min</span>
                                    </div>
                                    <span class="text-2xl text-[#ff8f98] font-bold -mt-6">:</span>
                                    <div class="flex flex-col items-center">
                                        <div class="relative">
                                            <div class="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#e6e6e6] rounded-xl flex items-center justify-center shadow-card">
                                                <span class="text-2xl md:text-3xl font-bold text-gradient-pink font-playfair">{timerSeconds}</span>
                                            </div>
                                            <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8F9C] rounded-full animate-pulse"></div>
                                        </div>
                                        <span class="mt-2 text-xs md:text-sm text-[#737373] uppercase tracking-widest">Sec</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 mt-8 sm:mt-10 lg:mt-12 animate-fade-in px-4 sm:px-8 lg:px-20">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gradient-pink mb-2 sm:mb-3">{productsOnSale}+</div>
                                <p class="text-xs sm:text-sm text-[#737373]">Products on Sale</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gradient-pink mb-2 sm:mb-3">{maxDiscount}%</div>
                                <p class="text-xs sm:text-sm text-[#737373]">Max Discount</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gradient-pink mb-2 sm:mb-3">24/7</div>
                                <p class="text-xs sm:text-sm text-[#737373]">Customer Support</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </section>

            <section className="py-16 md:py-20">
            <div className="px-4 ">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8F9C]/10  border border-[#FF8F9C]/30 rounded-full mb-6 w-fit text-[#FF8F9C]">
                        <SlFire />
                        <span className='text-sm font-medium text-[#f86879]'>Hot Offers</span>
                    </div>
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-4 text-[#262626]">
                        <span>Today's </span>
                        <span className='text-gradient-pink'>Best Deals</span>
                    </h2>
                    <p className="text-[#737373] max-w-2xl mx-auto">
                        Handpicked items with the biggest discounts. Don't miss out on these limited-time offers.
                    </p>
                </div>
                <div className="mb-12">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        <button 
                            className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "All" ? "category-pill-active" : "category-pill-inactive"}`} 
                            onClick={() => setFilteredData("All")}
                        >
                            All
                        </button>
                        
                        {/* Hardcoded Gender Filters */}
                        <button 
                            className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "male" ? "category-pill-active" : "category-pill-inactive"}`} 
                            onClick={() => setFilteredData("male")}
                        >
                            MEN
                        </button>
                        <button 
                            className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === "female" ? "category-pill-active" : "category-pill-inactive"}`} 
                            onClick={() => setFilteredData("female")}
                        >
                            WOMEN
                        </button>
                        
                        {/* Dynamic Category Filters */}
                        {uniqueCategories.map((category) => (
                            <button 
                                key={category}
                                className={`rounded-full border border-[#FF8F9C] category-pill ${filteredData === category ? "category-pill-active" : "category-pill-inactive"}`} 
                                onClick={() => setFilteredData(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                    {megaDealProducts
                        .filter((p) => {
                            if (filteredData === "All") return true;
                            
                            // Check category match
                            if (p.category === filteredData) return true;
                            
                            // Check gender match (case-insensitive)
                            if (filteredData === "male" && p.gender?.toLowerCase() === "male") return true;
                            if (filteredData === "female" && p.gender?.toLowerCase() === "female") return true;
                            
                            return false;
                        })
                        .map((product) => {
                        return(
                            <Products key={product._id} product={product} />
                        )
                    })}
                </div>
            </div>
        </section>
        </>
    )
}

export default HotOffers