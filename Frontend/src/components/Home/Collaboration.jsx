import React from 'react'
import { Blog } from '../../assets/assets'

const Collaboration = () => {

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7 mt-6 sm:mt-8 md:mt-10 px-3">
                {Blog.map((item, index)=>{
                    return(
                        <div key={index} className="cursor-pointer group">
                            <div className="rounded-lg sm:rounded-xl overflow-hidden">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300 group-hover:scale-110" 
                                />
                            </div>
                            <p className='text-[#FF8F9C] mt-3 sm:mt-4 md:mt-5 text-sm sm:text-[15px]'>{item.category}</p>
                            <p className='font-semibold text-base sm:text-lg md:text-[18px] text-[#323232] hover:text-[#FF8F9C] transition-all duration-300 line-clamp-2'>{item.name}</p>
                            <p className='text-[#757575] mt-1 text-sm sm:text-base'>{item.author}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default Collaboration