import React from 'react'
import { assets } from '../../assets/assets'
import { RiShipLine } from 'react-icons/ri'
import { LiaShipSolid } from 'react-icons/lia'
import { IoArrowUndoOutline, IoCallOutline, IoRocketOutline, IoTicketOutline } from 'react-icons/io5'

const OurService = () => {
  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-6 sm:my-8 md:my-10 gap-4 sm:gap-6 md:gap-7.5 px-3">
            {/* Testimonial Section */}
            <div className="mb-3 sm:mb-3.75">
                <h1 className="text-base sm:text-lg md:text-[19px] font-semibold text-[#333232] border-b pb-2 border-gray-200">Testimonial</h1>

                <div className="border border-gray-200 rounded-[10px] mt-4 sm:mt-6 md:mt-7 py-5 sm:py-6 md:py-7 flex flex-col items-center gap-2 sm:gap-3">
                    <img src={assets.testimonial_1} className='w-16 sm:w-18 md:w-20 rounded-full' alt="" />
                    <p className='uppercase font-bold text-[#767676] text-base sm:text-lg md:text-[18px] mt-1 sm:mt-2'>Alan Doe</p>
                    <p className='text-sm sm:text-base'>CEO & Founder Invision</p>
                    <img src={assets.quotes} className='w-5 sm:w-6 md:w-6.25' alt="" />
                    <p className='w-full sm:w-4/5 md:w-47.5 px-4 sm:px-0 text-center text-sm sm:text-base text-[#787878]'>Lorem ipsum dolor sit amet consectetur Lorem ipsum dolor dolor sit amet.</p>
                </div>
            </div>


            {/* CTA Banner - Full width on mobile, 2 cols on md, 2 cols on lg */}
            <div className="md:col-span-2 rounded-[10px] bg-[url(https://codewithsadee.github.io/anon-ecommerce-website/assets/images/cta-banner.jpg)] bg-no-repeat bg-cover bg-center flex justify-center items-center min-h-64 sm:min-h-80 md:min-h-96">
                <div className="w-4/5 sm:w-3/5 md:w-1/2 h-[61%] bg-[rgba(255,255,255,0.6)] rounded-md flex flex-col justify-center items-center gap-2 sm:gap-3 py-6">
                    <p className='uppercase border px-2 py-1 text-sm sm:text-base md:text-[17px] font-semibold text-white bg-[#212121] rounded-[5px]'>25% Discount</p>
                    <p className='text-xl sm:text-2xl md:text-[28px] text-[#454545] font-bold w-[90%] sm:w-[80%] md:w-[70%] text-center'>Summer Collection</p>
                    <p className='text-base sm:text-lg md:text-[18px] text-[#787878]'>Starting @ $10</p>
                    <p className='uppercase text-sm sm:text-base md:text-[18px] font-bold text-[#787878] mt-1 sm:mt-2 cursor-pointer hover:text-[#FF8F9C] transition-colors'>shop now</p>
                </div>
            </div>

            {/* Our Services Section */}
            <div className="mb-0">
                <h1 className="text-base sm:text-lg md:text-[19px] font-semibold text-[#333232] border-b pb-2 border-gray-200">Our Services</h1>

                <ul className="border border-gray-200 rounded-[10px] mt-4 sm:mt-6 md:mt-7 py-4 sm:py-6 md:py-7 flex flex-col px-4 sm:px-6 md:px-7 gap-2.5 sm:gap-3 md:gap-3.5">
                    <li className='flex items-center gap-3 sm:gap-4 md:gap-5'>
                        <p className='text-[#FF8F9C] hover:text-[#363636] text-3xl sm:text-4xl md:text-[40px] transition-all duration-200'><LiaShipSolid  /></p>
                        <div className='flex flex-col gap-1 sm:gap-2'>
                            <p className='font-semibold text-[#787878] text-sm sm:text-base md:text-[17px]'>Worldwide Delivery</p>
                            <p className='text-xs sm:text-sm md:text-[13px] text-[#545454] '>For Order Over $100</p>
                        </div>
                    </li>
                    <li className='flex items-center gap-3 sm:gap-4 md:gap-5'>
                        <p className='text-[#FF8F9C] hover:text-[#363636] text-3xl sm:text-4xl md:text-[40px] transition-all duration-200'><IoRocketOutline   /></p>
                        <div className='flex flex-col gap-1 sm:gap-2'>
                            <p className='font-semibold text-[#787878] text-sm sm:text-base md:text-[17px]'>Next Day delivery</p>
                            <p className='text-xs sm:text-sm md:text-[13px] text-[#545454] '>UK Orders Only</p>
                        </div>
                    </li>
                    <li className='flex items-center gap-3 sm:gap-4 md:gap-5'>
                        <p className='text-[#FF8F9C] hover:text-[#363636] text-3xl sm:text-4xl md:text-[40px] transition-all duration-200'><IoCallOutline  /></p>
                        <div className='flex flex-col gap-1 sm:gap-2'>
                            <p className='font-semibold text-[#787876] text-sm sm:text-base md:text-[17px]'>Best Online Support</p>
                            <p className='text-xs sm:text-sm md:text-[13px] text-[#545454] '>Hours: 8AM - 11PM</p>
                        </div>
                    </li>
                    <li className='flex items-center gap-3 sm:gap-4 md:gap-5'>
                        <p className='text-[#FF8F9C] hover:text-[#363636] text-3xl sm:text-4xl md:text-[40px] transition-all duration-200'><IoArrowUndoOutline  /></p>
                        <div className='flex flex-col gap-1 sm:gap-2'>
                            <p className='font-semibold text-[#787878] text-sm sm:text-base md:text-[17px]'>Return Policy</p>
                            <p className='text-xs sm:text-sm md:text-[13px] text-[#545454] '>Easy & Free Return</p>
                        </div>
                    </li>
                    <li className='flex items-center gap-3 sm:gap-4 md:gap-5'>
                        <p className='text-[#FF8F9C] hover:text-[#363636] text-3xl sm:text-4xl md:text-[40px] transition-all duration-200'><IoTicketOutline  /></p>
                        <div className='flex flex-col gap-1 sm:gap-2'>
                            <p className='font-semibold text-[#787878] text-sm sm:text-base md:text-[17px]'>30% money back</p>
                            <p className='text-xs sm:text-sm md:text-[13px] text-[#545454] '>For Order Over $100</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </>
  )
}

export default OurService