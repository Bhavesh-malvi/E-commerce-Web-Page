import React, { useContext, useEffect, useState } from 'react'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { AppContext } from '../../context/AppContext';

const HomeBanner = () => {

    const {currency, convertPrice, activeBanners} = useContext(AppContext);

    const [index, setIndex] = useState(0);
    const [isHover, setIsHover] = useState(false)

    const totalSlides = activeBanners.length > 0 ? activeBanners.length : 3;

    const next = () => {
        setIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    };

    const prev = () => {
        setIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    };

    useEffect(() => {
        if(isHover || totalSlides <= 1) return;

        const interval = setInterval(() => {
            next();
        }, 5000);

        return () => clearInterval(interval);
    }, [isHover, totalSlides]);

    // Fallback hardcoded banners if none are active
    const fallbackBanners = [
        {
            image: "https://codewithsadee.github.io/anon-ecommerce-website/assets/images/banner-1.jpg",
            subtitle: "Trending item",
            title: "Women's latest fashion sale",
            price: 1900
        },
        {
            image: "https://codewithsadee.github.io/anon-ecommerce-website/assets/images/banner-2.jpg",
            subtitle: "Trending accessories",
            title: "Modern sunglasses",
            price: 1400
        },
        {
            image: "https://codewithsadee.github.io/anon-ecommerce-website/assets/images/banner-3.jpg",
            subtitle: "Sale Offer",
            title: "New fashion summer sale",
            price: 2700
        }
    ];

    const displayBanners = activeBanners.length > 0 ? activeBanners : fallbackBanners;

    return (
        <div className='relative overflow-hidden' 
            onMouseEnter={()=> setIsHover(true)} 
            onMouseLeave={()=> setIsHover(false)}
        >
            <div className={`absolute z-10 flex w-full justify-between top-1/2 text-2xl sm:text-3xl md:text-[35px] text-[#FF8F9C] px-2 sm:px-4  ${isHover && totalSlides > 1 ? "block" : "hidden"}`}>
                <FaCaretLeft onClick={prev} className={`cursor-pointer ${index > 0 ? "visible" : "invisible"}`} />
                <FaCaretRight onClick={next} className={`cursor-pointer ${index < totalSlides - 1 ? "visible" : "invisible"}`} />
            </div>
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                {displayBanners.map((banner, i) => (
                    <div key={i} className="h-60 sm:h-80 md:h-96 lg:h-115 w-full shrink-0 rounded-lg bg-cover bg-center px-4 sm:px-8 md:px-16 lg:px-35 flex items-center" style={{ backgroundImage: `url(${banner.image})` }}>
                        <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3">
                            <h2 className='text-base sm:text-xl md:text-[1.5rem] lg:text-[1.9rem] text-[#FF8F9C] font-medium tracking-wide'>{banner.subtitle}</h2>
                            <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-[3rem] w-full sm:w-80 md:w-100 lg:w-110 font-bold leading-tight sm:leading-10 md:leading-12 uppercase text-[#212121]'>{banner.title}</h1>
                            <p className='text-sm sm:text-lg md:text-xl lg:text-[25px] text-[#787878] font-semibold'>starting at {currency === "USD" ? "$" : "₹"} <span className='font-bold text-lg sm:text-2xl md:text-3xl lg:text-[35px]'>{Math.round(convertPrice(banner.price))}</span>.00</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeBanner;