import React, { useContext, useRef, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';
import { RxCross2 } from 'react-icons/rx';
import GetStarRating from '../../UI/GetStarRating';

const ReviewForm = ({productData, setIsOpen, refreshProduct}) => {
    const { addReview } = useContext(AppContext);
    const toast = useToast();

    const [rating, setRating] = useState(0);
    const [reviewData, setReviewData] = useState({
        title: "",
        comment: ""
    })
    const [previews, setPreviews] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const ImgRef = useRef()
    
    const handleRating = (value) => {
        setRating(value)
    };

    const handleImage = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setImageFiles(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };


    const handleChange = (e) => {
        setReviewData({
            ...reviewData,
            [e.target.name] : e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", reviewData.title);
            formData.append("comment", reviewData.comment);
            formData.append("rating", rating);
            
            imageFiles.forEach(file => {
                formData.append("media", file);
            });

            const res = await addReview(productData._id, formData);
            
            if (res.success) {
                toast.success("Review submitted successfully");
                setReviewData({
                    title: "",
                    comment: "",
                })
                setRating(0);
                setPreviews([]);
                setImageFiles([])

                if (refreshProduct) refreshProduct();
                setTimeout(()=>{
                    setIsOpen(false)
                },1000)
            } else {
                toast.error(res.message || "Failed to submit review");
            }

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }  

    return (
        <>
            <div className="fixed inset-0 z-[110] bg-black/50 flex justify-center items-start sm:items-center px-4 overflow-y-auto py-10">
                <div className="bg-white w-full sm:w-4/5 md:w-3/4 lg:w-[60%] px-6 sm:px-12 md:px-16 lg:px-20 py-6 sm:py-8 md:py-10 relative rounded-lg shadow-2xl my-auto">
                    <RxCross2 className="absolute right-3 sm:right-4 top-3 sm:top-4 text-xl sm:text-[25px] cursor-pointer hover:text-gray-600" onClick={()=> setIsOpen(false)} />
                    <div className="flex items-center gap-3 sm:gap-4 border-b pb-3 sm:pb-4">
                        <div className="border h-16 w-16 sm:h-20 sm:w-20 border-gray-300 rounded-[5px] overflow-hidden flex-shrink-0">
                            <img src={productData?.mainImages?.[0]?.url || ""} className='w-full h-full object-contain' alt="" />
                        </div>
                        <div className="">
                            <p className='text-base sm:text-lg md:text-[20px] font-medium'>How was the item?</p>
                            <p className='text-[#787878] font-medium text-sm sm:text-base md:text-[17px] line-clamp-2'>{productData?.name}</p>
                        </div>
                    </div>
                    <form className='flex flex-col items-end mt-4' onSubmit={handleSubmit}>

                        <div className="flex flex-col gap-3 w-full">
                            <GetStarRating onChange={handleRating} value={rating} />

                             <label className='text-xs sm:text-sm md:text-[14px] font-medium mt-3 sm:mt-4'>
                                Share a video or photo
                            </label>

                            <div className="flex gap-3 flex-wrap">
                                {previews.map((img, index) => (
                                    <div key={index} className="relative w-20 h-20 border border-gray-400 rounded-[10px] group overflow-hidden" >
                                        <img src={img} className="w-full h-full object-cover" alt=""/>
                                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <div className="w-20 h-20 border border-dashed border-gray-400 rounded-[10px] flex items-center justify-center cursor-pointer text-gray-400 hover:border-gray-400 hover:text-gray-400 transition-all" onClick={() => ImgRef.current.click()}>
                                    <span className="text-2xl font-medium">+</span>
                                    <input type="file" hidden ref={ImgRef} accept="image/*" multiple onChange={handleImage} />
                                </div>
                            </div>

                            <label className='text-xs sm:text-sm md:text-[14px] font-medium mt-3 sm:mt-4'>Title your review (required)</label>
                            <input type="text" placeholder='What is most important to know?' onChange={handleChange} value={reviewData.title} name="title" required className='border outline-0 rounded-[7px] h-9 sm:h-10 px-3 text-sm sm:text-base border-gray-400 focus:border-gray-400' />

                            <label className='mt-6 sm:mt-8 text-xs sm:text-sm md:text-[14px] font-medium'>Write a review</label>
                            <textarea className='w-full min-h-20 sm:min-h-25 border outline-0 p-3 rounded-[10px] text-sm sm:text-base border-gray-400 focus:border-gray-400' value={reviewData.comment} name="comment" onChange={handleChange} placeholder='What should other customers know?' required></textarea>
                        </div>

                        <button type='submit' className='px-8 sm:px-10 py-2 sm:py-3 text-xs sm:text-sm md:text-[14px] rounded-full mt-6 sm:mt-8 bg-[#FF8F9C] hover:opacity-90 text-white font-bold shadow-md transform active:scale-95 transition-all'>
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ReviewForm