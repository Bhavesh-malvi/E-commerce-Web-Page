import React from 'react'
import { assets, footerLinkData1, footerLinksData2 } from '../assets/assets'
import { IoCallOutline, IoLocationOutline, IoMailOutline } from 'react-icons/io5'

const Footer = () => {

    return (
        <footer className='mt-14 bg-[#212121] py-6 sm:py-10'>
            <div className="w-[90%] sm:w-[87%] m-auto">
                <h1 className='uppercase text-sm sm:text-[17px] font-semibold text-[#FF8F9C]'>Brand directory</h1>

                <div className="mt-3 flex flex-col gap-2 sm:gap-3">
                    {footerLinkData1.map((data, index)=>{
                        return(
                            <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-5">
                                <p className='text-[#787878] font-semibold uppercase text-sm sm:text-base'>{data.title}</p>
                                <ul className='flex flex-wrap'>
                                    {data.links.map((links, idx)=>{
                                        return(
                                            <li key={idx} className='relative text-[#787878] hover:text-[#909090] text-sm sm:text-[16.5px] transition-all duration-300 after:content-[] after:h-3 sm:after:h-4.5 after:w-0.5 after:bg-[#787878] after:absolute after:top-0.5 sm:after:top-0.75 after:-right-px px-1.5 sm:px-2 cursor-pointer'>{links}</li>
                                        )
                                    })}
                                </ul>
                            </div>

                        )
                    })}
                </div>
            </div>
            <hr className='border-[#585858] my-8 sm:my-12 ' />

            <div className="w-[90%] sm:w-[87%] m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4">
                {footerLinksData2.map((data, index)=>{
                    return(
                        <div key={index} className="">
                            <h1 className='text-[#FFFFFF] uppercase font-semibold tracking-wide relative after:content-[] after:absolute after:w-12 sm:after:w-16 after:h-px after:bg-[#FF8F9C] after:left-0 after:-bottom-0.5 text-sm sm:text-base'>{data.title}</h1>

                            <ul className='mt-4 sm:mt-5 flex flex-col gap-1'>
                                {data.links.map((links, idx)=>(
                                    <li key={idx} className='text-[#787878] hover:text-[#FF8F9C] cursor-pointer transition-all duration-200 w-fit text-sm sm:text-base'>{links}</li>
                                ))}
                            </ul>
                        </div>
                    )
                })}

                <div className="">
                    <h1 className='text-[#FFFFFF] uppercase font-semibold tracking-wide relative after:content-[] after:absolute after:w-12 sm:after:w-16 after:h-px after:bg-[#FF8F9C] after:left-0 after:-bottom-0.5 text-sm sm:text-base'>Contact</h1>

                    <ul className='mt-4 sm:mt-5 flex flex-col gap-2'>
                        <li className='text-[#787878] flex gap-2'>
                            <p><IoLocationOutline className='text-xl sm:text-[25px]' /> </p>
                            <p className='text-sm sm:text-[17px]'>419 State 414 Rte Beaver Dams, New York(NY), 14812, USA</p>
                        </li>
                        <li className='text-[#787878] cursor-pointer flex gap-2'>
                            <p><IoCallOutline className='text-xl sm:text-[25px]' /> </p>
                            <p className='text-sm sm:text-[17px] hover:text-[#FF8F9C] transition-all duration-200'>(607) 936-8058</p>
                        </li>
                        <li className='text-[#787878] cursor-pointer flex gap-2'>
                            <p><IoMailOutline className='text-xl sm:text-[25px]' /> </p>
                            <p className='text-sm sm:text-[17px] hover:text-[#FF8F9C] transition-all duration-200'>example@gmail.com</p>
                        </li>
                    </ul>
                </div>
            </div>

            <hr className='border-[#585858] my-8 sm:my-12 ' />

            <div className="m-auto w-fit px-4 sm:px-0">
                <img src={assets.payment} alt="" className="w-full max-w-xs sm:max-w-md mx-auto" />
                <p className='mt-4 sm:mt-5 text-xs sm:text-[15px] font-semibold text-[#787878] tracking-wide text-center'>Copyright ©{new Date().getFullYear()} Anon all rights reserved.</p>
            </div>

        </footer>
    )
}

export default Footer