import React, { useContext, useState } from 'react'
import { subCategory } from '../../assets/assets'
import { GoPlus } from 'react-icons/go'
import { LuMinus } from 'react-icons/lu';
import StarRating from '../../UI/StarRating';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const LeftSidebar = () => {

    const { currency, convertPrice, bestSeller } = useContext(AppContext);
    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(null);

    const handleToggle = (index) =>{
        setIsOpen(isOpen === index ? null : index)
    }


    return (
            <div className='sticky top-2'>
                <div className='border border-gray-200 rounded-[10px] p-5'>
                    <h1 className='uppercase text-[18px] font-semibold text-[#454545] mb-3'>Category</h1>

                    {
                        subCategory.map((item, i)=>{
                            return(
                                <div key={i} className={`overflow-y-hidden transition-h duration-300`}>
                                    <div className="flex justify-between py-2.5">
                                        <div className="flex gap-2">
                                            <img src={item.icon} width="20px" alt="" />
                                            <p className='font-medium text-[#454545] text-[15px]'>{item.name}</p>
                                        </div>
                                        <div className="cursor-pointer" onClick={()=> handleToggle(i)}> {isOpen === i ? <LuMinus /> : <GoPlus />} </div>
                                    </div>
                                    <div className={`grid transition-all duration-300 ease-in-out
                                        ${isOpen === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden pl-7 pb-2">
                                            {
                                                item.subData.map((item, idx)=>{
                                                    return(
                                                        <div key={idx} className="flex justify-between py-1 text-[#666666] hover:text-[#454545] cursor-pointer" onClick={()=> {navigate(`/categoryPage/${item.title}`); scrollTo(0,650)}}>
                                                            <p>{item.title}</p>
                                                            <p>{item.stock}</p>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                <div className="mt-7">
                    <h1 className='uppercase text-[18px] font-semibold text-[#454545]'>Best Seller</h1>
                    {
                        bestSeller && bestSeller.slice(0, 4).map((item)=>{
                            return(
                                <div key={item._id} className="flex gap-3.5 mt-3 items-center cursor-pointer" onClick={()=> {navigate(`/productDetails/${item._id}/${item.category}`); scrollTo(0,0)}}>
                                    <img src={item.mainImages?.[0]?.url || ""} width="70px" className='rounded-lg bg-[#F7F7F7]' alt="" />
                                    <div className="">
                                        <p className='text-[14px] text-[#454545]'>{item.name}</p>
                                        <StarRating rating={item.ratings || item.rating} />
                                        <p className='text-[#787878] font-semibold'>
                                            { (item.discountPrice && item.discountPrice < item.price) && (
                                                <del className='text-[12px] font-medium'>
                                                    {currency === "USD" ? "$" : "₹"}{convertPrice(item.price)}
                                                </del>
                                            )}
                                            {' '}
                                            {currency === "USD" ? "$" : "₹"}{convertPrice(item.discountPrice || item.price)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
    )
}

export default LeftSidebar