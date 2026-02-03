import React, { useState, useMemo, useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext';
import StarRating from '../../UI/StarRating'
import ReviewForm from "./ReviewForm";
import { FaUserCircle, FaThumbsUp, FaCheckCircle } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

const ProductReview = ({productData, refreshProduct, initialOpen}) => {
    const { user, setOpen } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        if (initialOpen) {
            const element = document.getElementById("review-section");
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
            if (user) {
                setIsOpen(true);
            } else {
                setOpen(true);
            }
        }
    }, [initialOpen, user, setOpen]);
    
    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [currentMedia, setCurrentMedia] = useState([]);

    const openLightbox = (media, index) => {
        setCurrentMedia(media);
        setActiveMediaIndex(index);
        setLightboxOpen(true);
    };

    const navigateMedia = (direction) => {
        if (direction === 'next') {
            setActiveMediaIndex((prev) => (prev + 1) % currentMedia.length);
        } else {
            setActiveMediaIndex((prev) => (prev - 1 + currentMedia.length) % currentMedia.length);
        }
    };

    // Calculate rating percentages dynamically
    const stats = useMemo(() => {
        const reviews = (productData?.reviews || []).filter(r => !r.isSpam);
        const total = reviews.length;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            counts[r.rating] = (counts[r.rating] || 0) + 1;
        });

        return {
            total,
            percentages: {
                5: total ? Math.round((counts[5] / total) * 100) : 0,
                4: total ? Math.round((counts[4] / total) * 100) : 0,
                3: total ? Math.round((counts[3] / total) * 100) : 0,
                2: total ? Math.round((counts[2] / total) * 100) : 0,
                1: total ? Math.round((counts[1] / total) * 100) : 0,
            },
            sortedReviews: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        };
    }, [productData?.reviews]);

    return (
        <>
            <div id="review-section" className="flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-16 my-10 sm:my-12 md:my-15 border-t pt-6 sm:pt-8 md:pt-10 px-3 sm:px-0">
                {/* LEFT SIDE: STATS & SUMMARY */}
                <div className="w-full md:w-1/3">
                    <h1 className="text-base sm:text-lg md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200 w-fit pr-3 sm:pr-5">Customer reviews</h1>
                    <div className="my-4 sm:my-5">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <StarRating rating={productData?.ratings || 0} textSize={"20px"} /> 
                            <span className="font-semibold text-sm sm:text-base md:text-lg">{productData?.ratings || 0} out of 5</span>
                        </div>
                        <p className='text-xs sm:text-[13px] text-gray-500 py-2'>{productData?.numOfReviews || 0} global ratings</p>

                        <div className="flex flex-col gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="grid grid-cols-6 gap-1.5 sm:gap-2 items-center text-xs sm:text-sm text-gray-700">
                                    <p className="whitespace-nowrap text-xs sm:text-sm">{star} star</p>
                                    <div className="col-span-4 border h-3 sm:h-4 rounded-[4px] border-gray-300 overflow-hidden bg-gray-100">
                                        <div 
                                            className="h-full bg-[#FFCE12] transition-all duration-700" 
                                            style={{ width: `${stats.percentages[star]}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-gray-500 text-xs sm:text-sm">{stats.percentages[star]}%</p>
                                </div>
                            ))}
                        </div>

                        <div className="my-6 sm:my-8 md:my-10 border-t pt-4 sm:pt-6 border-gray-100">
                            <h2 className="text-base sm:text-lg md:text-[18px] font-semibold text-[#333232]">Review this product</h2>
                            <p className='text-xs sm:text-[13px] text-gray-600 my-2'>Share your thoughts with other customers</p>
                            <button 
                                className='w-full py-1.5 sm:py-2 text-xs sm:text-sm md:text-[14px] font-medium border border-gray-300 rounded-full mt-2 hover:bg-gray-50 transition-colors shadow-sm' 
                                onClick={() => {
                                    if (user) {
                                        setIsOpen(true);
                                    } else {
                                        setOpen(true);
                                    }
                                }}
                            >
                                Write a customer review
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: REVIEWS LIST */}
                <div className="w-full md:w-2/3">
                    <h1 className="text-base sm:text-lg md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200">Top reviews from India</h1>
                    
                    <div className="mt-4 sm:mt-6 flex flex-col gap-6 sm:gap-8 md:gap-10">
                        {stats.sortedReviews.length > 0 ? (
                            stats.sortedReviews.map((review, index) => (
                                <div key={review._id || index} className="flex flex-col gap-2 sm:gap-3">
                                    {/* User Info */}
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {(review.user?.avatar?.url || (typeof review.user?.avatar === 'string' && review.user?.avatar)) ? (
                                            <img src={review.user.avatar?.url || review.user.avatar} alt={review.user.name} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover" />
                                        ) : (
                                            <FaUserCircle className="text-2xl sm:text-3xl text-gray-300" />
                                        )}
                                        <span className="text-xs sm:text-[13px] font-medium text-gray-800">{review.user?.name || "Anonymous User"}</span>
                                    </div>

                                    {/* Rating & Title */}
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <StarRating rating={review.rating} textSize={"14px"} />
                                        <h3 className="text-xs sm:text-sm md:text-[14px] font-bold text-gray-800">{review.title}</h3>
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs sm:text-[13px] text-gray-500">
                                            Reviewed in India on {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[#CC6600] text-[10px] sm:text-[12px] font-bold">Verified Purchase</span>
                                            <FaCheckCircle className="text-[#CC6600] text-[8px] sm:text-[10px]" />
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <p className="text-xs sm:text-sm md:text-[14px] text-gray-800 leading-relaxed whitespace-pre-line">
                                        {review.comment}
                                    </p>

                                    {/* Media */}
                                    {review.media?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                                            {review.media.map((item, idx) => (
                                                item.type === 'image' ? (
                                                    <img 
                                                        key={idx} 
                                                        src={item.url} 
                                                        alt="Review" 
                                                        onClick={() => openLightbox(review.media, idx)}
                                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-90 hover:border-gray-400 transition-all" 
                                                    />
                                                ) : (
                                                    <div 
                                                        key={idx} 
                                                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md border border-gray-200 cursor-pointer overflow-hidden group"
                                                        onClick={() => openLightbox(review.media, idx)}
                                                    >
                                                        <video src={item.url} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-all">
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black/50 rounded-full flex items-center justify-center pl-1">
                                                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}

                                    {/* Helpful */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                        {review.helpful > 0 && (
                                            <p className="text-xs sm:text-[13px] text-gray-500">{review.helpful} people found this helpful</p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <button className="text-[10px] sm:text-[12px] px-4 sm:px-6 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">Helpful</button>
                                            <span className="text-[10px] sm:text-[12px] text-gray-400 border-l pl-2 sm:pl-3 cursor-pointer hover:text-gray-600">Report</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>No reviews yet. Be the first to share your experience!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isOpen && <ReviewForm productData={productData} setIsOpen={setIsOpen} refreshProduct={refreshProduct} />}
            
            {/* LIGHTBOX MODAL */}
            {lightboxOpen && currentMedia.length > 0 && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4">
                    <button 
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-[130]"
                    >
                        <RxCross2 className="text-3xl sm:text-4xl" />
                    </button>

                    <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                        {/* PREV BUTTON */}
                        {currentMedia.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigateMedia('prev'); }}
                                className="absolute left-2 sm:left-4 z-[125] text-white/70 hover:text-white p-2 sm:p-3 rounded-full hover:bg-white/10 transition-all"
                            >
                                <IoIosArrowBack className="text-3xl sm:text-5xl" />
                            </button>
                        )}

                        {/* MEDIA CONTENT */}
                        <div className="max-h-[85vh] max-w-full flex items-center justify-center overflow-hidden">
                            {currentMedia[activeMediaIndex].type === 'video' ? (
                                <video 
                                    src={currentMedia[activeMediaIndex].url} 
                                    controls 
                                    autoPlay 
                                    className="max-h-[85vh] max-w-full object-contain rounded-md"
                                />
                            ) : (
                                <img 
                                    src={currentMedia[activeMediaIndex].url} 
                                    alt="Review Fullscreen" 
                                    className="max-h-[85vh] max-w-full object-contain rounded-md select-none"
                                />
                            )}
                        </div>

                        {/* NEXT BUTTON */}
                        {currentMedia.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigateMedia('next'); }}
                                className="absolute right-2 sm:right-4 z-[125] text-white/70 hover:text-white p-2 sm:p-3 rounded-full hover:bg-white/10 transition-all"
                            >
                                <IoIosArrowForward className="text-3xl sm:text-5xl" />
                            </button>
                        )}
                        
                        {/* COUNTER */}
                        {currentMedia.length > 1 && (
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full text-white text-sm font-medium">
                                {activeMediaIndex + 1} / {currentMedia.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default ProductReview
