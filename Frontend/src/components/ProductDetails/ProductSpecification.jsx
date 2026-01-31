import React, { useState } from 'react'

const ProductSpecification = ({ specifications }) => {
    if (!specifications || specifications.length === 0) return null;

    return (
        <>
            <div className="my-8 sm:my-10 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 px-3 sm:px-0">
                <h1 className="text-lg sm:text-xl md:text-[22px] font-semibold text-[#333232] border-b pb-2 border-gray-200 w-fit pr-3 sm:pr-5">Product specifications</h1>

                <div className="mt-4 sm:mt-5">
                    <ul className="">
                        {specifications.map((item, index)=>(
                            <li key={index} className='border-b py-2 border-gray-200 grid grid-cols-2 justify-between text-xs sm:text-[13px]'>
                                <p className='font-semibold text-gray-700'>{item.key}:</p>
                                <p className='text-gray-600'>{item.value || item.detail}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default ProductSpecification