import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { RxCross2 } from 'react-icons/rx'
import { AppContext } from '../context/AppContext'

const Popup = () => {

    const {setIsShow} = useContext(AppContext)

    return (
        <div className='w-full h-screen fixed bg-black/40 top-0 left-0 z-100 flex justify-center items-center px-4'>
            <div className="w-full sm:w-[85%] md:w-[70%] lg:w-[60%] xl:w-[49%] grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden relative bg-white">
                <div className="absolute right-2 sm:right-3 top-2 sm:top-3 px-1.5 py-1.5 rounded-[5px] bg-[#FF8F9C] text-white cursor-pointer hover:bg-[#ff7b8b] z-10" onClick={()=> setIsShow(false)}>
                    <RxCross2 className="text-lg sm:text-xl" />
                </div>
                
                {/* Image - Hidden on mobile, visible on md+ */}
                <img src={assets.newsletter} alt="" className="hidden md:block object-cover w-full h-full" />
                
                <div className="bg-white flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-11 py-8 sm:py-10 md:py-12 gap-3 sm:gap-4">
                    <h1 className='text-lg sm:text-xl md:text-[20px] font-semibold text-[#545454]'>Subscribe Newsletter.</h1>
                    <p className='text-sm sm:text-base text-[#787878]'>Subscribe the <span className='font-bold'>Anon</span> to get latest products and discount update.</p>

                    <input 
                        type="text" 
                        placeholder='Email Address' 
                        className='border border-gray-200 h-10 sm:h-11 md:h-12 rounded-[5px] px-3 text-sm sm:text-base outline-none focus:border-[#FF8F9C] transition-colors' 
                    />
                    <button className='border rounded-[5px] w-full sm:w-fit sm:mx-auto uppercase font-semibold text-sm sm:text-base bg-[#101010] text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors active:scale-95'>
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Popup