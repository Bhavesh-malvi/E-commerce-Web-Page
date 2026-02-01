import React from 'react'

const ProductsInfo = ({ product }) => {
    if (!product) return null;

    return (
        <>
            <div className="mt-16 sm:mt-20 md:mt-30 px-3 sm:px-0">
                <h1 className="text-base sm:text-lg md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200 w-fit pr-3 sm:pr-5">Product description</h1>
                <h1 className='text-xs sm:text-sm text-gray-600 py-3 sm:py-4 leading-relaxed font-semibold'>{product.metaTitle || "No detailed description available."}</h1>
                <p className='text-xs sm:text-sm text-gray-600 pb-3 sm:pb-4 leading-relaxed'>{product.metaDescription || "No detailed description available."}</p>
            </div>

            {product.specifications?.length > 0 && (
                <div className="my-8 sm:my-10 mb-16 sm:mb-20 px-3 sm:px-0">
                    <h1 className="text-base sm:text-lg md:text-[20px] font-semibold text-[#333232] border-b pb-2 border-gray-200 w-fit pr-3 sm:pr-5">Product Specifications</h1>
                
                    <ul className="mt-4 sm:mt-5 pl-2 sm:pl-4 space-y-2">
                        {product.specifications.map((item, index)=>{
                            if (!item.key || !item.value) return null;
                            return(
                                <li key={index} className='border-b py-2 border-gray-200 grid grid-cols-2 justify-between text-xs sm:text-[13px] w-full sm:w-3/4 md:w-1/2 lg:w-[35%]'>
                                    <p className='font-semibold text-gray-800'>{item.key}:</p>
                                    <p className='text-gray-600'>{item.value || item.detail}</p>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

        </>
    )
}

export default ProductsInfo