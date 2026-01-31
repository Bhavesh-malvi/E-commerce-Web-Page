import React from 'react'
import { dummyCategory } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const HomeCategory = () => {

    const navigate = useNavigate()

    return (
        <>
            <div className="mt-6 sm:mt-8 md:mt-10 flex gap-3 sm:gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1">
                {dummyCategory.map((items, index)=>(
                    <div key={index} className="flex justify-between p-3 sm:p-4 border border-gray-200 rounded-[10px] min-w-[45%] sm:min-w-[30%] md:min-w-[23.35%] shrink-0 snap-center cursor-pointer hover:shadow-lg transition-shadow" onClick={()=> {navigate(`categoryPage/${items.name}`); scrollTo(0,650)}}>
                        <div className="flex gap-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-12.5 md:h-12.5 flex justify-center items-center bg-[#EDEDED] rounded-[5px]">
                                <img src={items.image} width="50%" alt="" />
                            </div>
                            <div className="flex flex-col justify-between">
                                <p className='uppercase text-xs sm:text-sm md:text-[14px] font-semibold tracking-wide text-[#212121]'>{items.name}</p>
                                <p className='text-[11px] sm:text-xs md:text-[13px] tracking-wide text-[#FF8F9C]'>Show All</p>
                            </div>
                        </div>
                        <div className="text-[11px] sm:text-xs md:text-[12px] font-semibold text-[#787878]">
                            ({items.quantity})
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default HomeCategory