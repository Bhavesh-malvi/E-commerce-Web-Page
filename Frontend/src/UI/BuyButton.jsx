import React from 'react'

const BuyButton = ({image, onClick}) => {
    return (
        <div className='pt-6 h-20 w-fit overflow-hidden active:scale-90 active:transition-all active:duration-200 active:ease-in transition-all duration-300'>
            <button 
                onClick={onClick}
                className=' px-8 flex items-center justify-center gap-2.5 text-white text-shadow-[2px_2px_rgba(116, 116, 116, 1)] uppercase cursor-pointer font-semibold text-[17px] bg-[#353434] rounded-lg relative transition-all ease duration-500 group'
            >
                <img src={image} alt="" className='group-hover:scale-280 group-hover:translate-y-[50%] group-hover:translate-x-[90%]  transition-all duration-500 z-2 w-14' />

                <span className='absolute left-3 -translate-x-[150%] transition-all duration-500 z-2 group-hover:translate-x-2.5 group-hover:delay-300'>Now</span>
                <span className='transition-all duration-500 ease delay-300 group-hover:translate-x-[300%] group-hover:transition-all group-hover:duration-50'>Buy</span>
            </button>
        </div>
    )
}

export default BuyButton