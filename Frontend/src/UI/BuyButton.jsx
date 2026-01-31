import React from 'react'

const BuyButton = ({image, onClick}) => {
    return (
        <div className='pt-6 h-20 w-fit overflow-hidden'>
            <button 
                type="button"
                onClick={onClick}
                className='px-8 h-13.75 flex items-center justify-center gap-2.5 text-white uppercase cursor-pointer font-semibold text-[17px] bg-[#353434] rounded-lg relative transition-all ease duration-500 group active:scale-95'
                style={{ textShadow: '2px 2px rgba(116,116,116,1)' }}
            >
                {image && (
                    <img 
                        src={image} 
                        alt="" 
                        className='group-hover:scale-[2.8] group-hover:translate-y-[50%] group-hover:translate-x-[92%] transition-all duration-500 z-10 w-14 pointer-events-none' 
                    />
                )}

                <span className='absolute left-3 -translate-x-[150%] transition-all duration-500 z-10 group-hover:translate-x-2.5 group-hover:delay-300 pointer-events-none'>Now</span>
                <span className='transition-all duration-500 ease delay-300 group-hover:translate-x-[300%] group-hover:transition-all group-hover:duration-50 pointer-events-none'>Buy</span>
            </button>
        </div>
    )
}

export default BuyButton