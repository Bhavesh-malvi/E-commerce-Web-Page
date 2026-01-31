import React, { useContext } from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { AppContext } from '../context/AppContext'

const Header = () => {

    const {currency, setCurrency, convertPrice} = useContext(AppContext);
    
    
    return (
        <>
            <header className='px-4 sm:px-8 md:px-16 lg:px-25 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0'>
                <div className="flex gap-1 py-2 sm:py-3">
                    <div className="w-fit p-1 sm:p-1.5 rounded-[5px] bg-[#e6e6e6] text-[#787878] hover:bg-[#FF8F9C] hover:text-white transition-all duration-200 cursor-pointer">
                        <FaFacebook className="text-sm sm:text-base" />
                    </div>
                    <div className="w-fit p-1 sm:p-1.5 rounded-[5px] bg-[#e6e6e6] text-[#787878] hover:bg-[#FF8F9C] hover:text-white transition-all duration-200 cursor-pointer">
                        <FaTwitter className="text-sm sm:text-base" />
                    </div>
                    <div className="w-fit p-1 sm:p-1.5 rounded-[5px] bg-[#e6e6e6] text-[#787878] hover:bg-[#FF8F9C] hover:text-white transition-all duration-200 cursor-pointer">
                        <FaInstagram className="text-sm sm:text-base" />
                    </div>
                    <div className="w-fit p-1 sm:p-1.5 rounded-[5px] bg-[#e6e6e6] text-[#787878] hover:bg-[#FF8F9C] hover:text-white transition-all duration-200 cursor-pointer">
                        <FaLinkedin className="text-sm sm:text-base" />
                    </div>
                </div>
            
                <p className='text-[11px] sm:text-[13px] uppercase text-[#787878] text-center sm:text-left'><span className='font-semibold'>Free Shipping</span> This Week Order Over - {currency === "USD" ? "$" : "₹"} {Math.round(convertPrice(5000))}</p>
            
                <select 
                    name="" 
                    id="" 
                    value={currency} 
                    onChange={(e)=> setCurrency(e.target.value)} 
                    style={{fontSize: '11px'}}
                    className='text-[#787878] outline-0 sm:text-sm py-0 sm:py-1 px-1 sm:px-2 border border-gray-300 rounded bg-white cursor-pointer h-6 sm:h-8 w-16 sm:w-auto leading-tight'
                >
                    <option value="USD" style={{fontSize: '11px'}}>USD $</option>
                    <option value="INR" style={{fontSize: '11px'}}>INR ₹</option>  
                </select>
            </header>
        </>
    )
}

export default Header