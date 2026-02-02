import React, { useState, useEffect } from 'react'
import { IoBagHandleOutline, IoSearchOutline } from "react-icons/io5";
import { assets } from '../assets/assets';
import { IoIosHeartEmpty } from 'react-icons/io';
import { HiMenuAlt3 } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const NavBar = () => {

    const {setOpen, user, wishlist, cart, activeMegaDeal} = useContext(AppContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
            } else if (window.location.pathname === "/search") {
                // Optional: If search cleared while on search page, maybe show all or go back?
                // For now, let's just do nothing or maybe reset params
                // navigate("/search"); 
            }
        }, 300); // 300ms debounce to prevent lag on every keystroke

        return () => clearTimeout(timeoutId);
    }, [searchTerm, navigate]);

    // Handle initial close of mobile menu if needed, but usually search is separate
    
    // Manual trigger not strictly needed with useEffect, but good for immediate action
    const handleManualSearch = () => {
        if(searchTerm.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
            setMobileMenuOpen(false);
        }
    };

    
    return (
        <>
            {/* Top Nav Bar */}
            <nav className='sticky top-0 z-50 bg-white px-4 sm:px-8 md:px-16 lg:px-25 border-b border-gray-300 flex justify-between items-center py-4 md:py-7 gap-2 sm:gap-3 md:gap-5 shadow-sm'>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <img src={assets.logo} alt="" className="w-20 sm:w-24 md:w-28 lg:w-[120px]" />
                </Link>
                
                <div className="hidden sm:flex group w-full md:w-[70%] items-center rounded-md relative">
                    <input 
                        type="text" 
                        placeholder='Enter your product name...' 
                        className='w-full h-8 md:h-10 border border-gray-300 px-3 rounded-md text-sm md:text-base outline-none focus:border-[#FF8F9C] transition-colors'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <IoSearchOutline 
                        className='text-base md:text-[20px] absolute right-3 cursor-pointer hover:text-[#FF8F9C]' 
                        onClick={handleManualSearch}
                    />
                </div>

                <ul className='flex text-xl md:text-[28px] gap-3 md:gap-5 items-center justify-center'>
                    {/* Mobile Menu Toggle - Only on small screens */}
                    <li className='lg:hidden cursor-pointer'>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                            {mobileMenuOpen ? <IoClose className="text-2xl" /> : <HiMenuAlt3 className="text-2xl" />}
                        </button>
                    </li>

                    <li className='relative p-1.5 md:p-2 cursor-pointer' onClick={(e) => {
                        if (!user) {
                            e.preventDefault();
                            setOpen(true);
                        } else {
                            scrollTo(0,0);
                        }
                    }}>
                        {user ? (
                            <Link to="/wishlist">
                                <IoIosHeartEmpty className='text-xl md:text-[25px]' />
                                {wishlist?.items?.length > 0 && (
                                    <div className="text-[11px] md:text-[13px] w-4 h-4 md:w-3.75 md:h-3.75 flex justify-center items-center absolute -top-1 md:top-0 -right-1 md:right-0 bg-[#FF6666] text-white rounded-full">
                                        {wishlist.items.length}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <>
                                <IoIosHeartEmpty className='text-xl md:text-[25px]' />
                            </>
                        )}
                    </li>
                    <li className='relative p-1.5 md:p-2 cursor-pointer' onClick={(e) => {
                        if (!user) {
                            e.preventDefault();
                            setOpen(true);
                        } else {
                            scrollTo(0,0);
                        }
                    }}>
                        {user ? (
                            <Link to="/cart">
                                <IoBagHandleOutline className="text-xl md:text-[28px]" />
                                {cart?.totalItems > 0 && (
                                    <div className="text-[11px] md:text-[13px] w-4 h-4 md:w-3.75 md:h-3.75 flex justify-center items-center absolute top-0 md:top-1 -right-1 md:right-0 bg-[#FF6666] text-white rounded-full">
                                        {cart.totalItems}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <>
                                <IoBagHandleOutline className="text-xl md:text-[28px]" />
                            </>
                        )}
                    </li>
                    <li>
                        {user ? <Link to={`${user.role === "admin" ? "/admin" : user.role === "seller" ? "/seller" : "/profile"}`}>
                        {
                            (() => {
                                let avatarUrl = user.avatar?.url || (typeof user.avatar === 'string' && user.avatar);
                                if (avatarUrl && !avatarUrl.startsWith('http')) {
                                    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace('/api', '');
                                    avatarUrl = `${baseUrl}/${avatarUrl}`;
                                }
                                return avatarUrl ? 
                                    <img src={avatarUrl} alt="Avatar" className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" /> : 
                                    <div className="border text-sm md:text-[18px] px-2 md:px-2.5 py-0.5 md:py-1 bg-gray-500 rounded-full text-white font-medium">{user.name?.charAt(0)}</div>
                            })()
                        }</Link> : <button className='text-sm md:text-[17px] px-4 md:px-7 py-1.5 md:py-2 rounded-full bg-[#FF8F9C] text-white font-medium cursor-pointer whitespace-nowrap' onClick={()=>setOpen(true)}>Login</button>}
                    </li>
                </ul>
            </nav>

            {/* Mobile Search Bar - Only visible on xs screens */}
            <div className="sm:hidden px-4 py-3 border-b border-gray-300">
                <div className="flex items-center rounded-md relative">
                    <input 
                        type="text" 
                        placeholder='Search products...' 
                        className='w-full h-9 border border-gray-300 px-3 rounded-md text-sm outline-none focus:border-[#FF8F9C]'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <IoSearchOutline 
                        className='text-lg absolute right-3 cursor-pointer' 
                        onClick={handleManualSearch}
                    />
                </div>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:block w-[60%] m-auto py-2">
                <ul className='flex justify-between '>
                    <li>
                        <Link to="/" className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Home</Link>
                    </li>
                    <li className='relative flex flex-col items-center group'>
                        <p className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Categories</p>

                        <div className="absolute z-20 flex w-140 top-9 justify-between px-5 gap-10 py-3 rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.25)] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-3 group-hover:translate-y-0 transition-all duration-200 bg-white">
                            <ul className='w-1/2 flex flex-col gap-3'>
                                <li className='font-semibold border-b border-gray-300 pb-3 text-[#464646]'>Men's</li>
                                {["shirt & t-shirt","formal shoes", "casual shoes", "sports shoes", "jacket"].map((p)=>{
                                    return(
                                        <li key={p} className='capitalize cursor-pointer hover:text-[#FF8F9C]'><Link to={`/categoryPage/male/${p}`} onClick={()=> scrollTo(0,650)}>{p}</Link></li>
                                    )
                                })}

                                <li className='rounded-[5px] overflow-hidden cursor-pointer'><img src={assets.mens_banner} alt="" /></li>
                            </ul>

                            <ul className='w-1/2 flex flex-col gap-3'>
                                <li className='font-semibold border-b border-gray-300 pb-3 text-[#464646]'>Women's</li>
                                {["shirt & t-shirt","earring", "party wear", "jacket","bags"].map((p)=>{
                                    return(
                                        <li key={p} className='capitalize cursor-pointer hover:text-[#FF8F9C]'><Link to={`/categoryPage/female/${p}`} onClick={()=> scrollTo(0,650)}>{p}</Link></li>
                                    )
                                })}

                                <li className='rounded-[5px] overflow-hidden cursor-pointer'><img src={assets.womens_banner} alt="" /></li>
                            </ul>
                        </div>
                    </li>
                    <li className='relative flex flex-col items-start group'>
                        <p className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Men's</p>

                        <div className="absolute z-20 flex w-50 top-9 justify-between px-5 gap-10 py-3 rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.25)] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-3 group-hover:translate-y-0 transition-all duration-200 bg-white">
                            <ul className='w-full flex flex-col gap-3'>
                                {["shirt", "shorts & jeans", "shoes", "wallet"].map((p)=>{
                                    return(
                                        <li key={p} className='capitalize cursor-pointer hover:text-[#FF8F9C]'><Link to={`/categoryPage/male/${p}`} onClick={()=> scrollTo(0,650)}>{p}</Link></li>
                                    )
                                })}
                            </ul>
                        </div>
                    </li>
                    <li className='relative flex flex-col items-start group'>
                        <p className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Women's</p>

                        <div className="absolute z-20 flex w-50 top-9 justify-between px-5 gap-10 py-3 rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.25)] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-3 group-hover:translate-y-0 transition-all duration-200 bg-white">
                            <ul className='w-full flex flex-col gap-3'>
                                {["clothes", "earring", "necklace", "shorts & jeans"].map((p)=>{
                                    return(
                                        <li key={p} className='capitalize cursor-pointer hover:text-[#FF8F9C]'><Link to={`/categoryPage/female/${p}`} onClick={()=> scrollTo(0,650)}>{p}</Link></li>
                                    )
                                })}
                            </ul>
                        </div>
                    </li>
                    <li className='relative flex flex-col items-start group'>
                        <p className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Jewelry</p>

                        <div className="absolute z-20 flex w-50 top-9 justify-between px-5 gap-10 py-3 rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.25)] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-3 group-hover:translate-y-0 transition-all duration-200 bg-white">
                            <ul className='w-full flex flex-col gap-3'>
                                {["earring", "couple rings", "necklace", "bracelets"].map((p)=>{
                                    return(
                                        <li key={p} className='capitalize cursor-pointer hover:text-[#FF8F9C]'><Link to={`/categoryPage/${p}`} onClick={()=> scrollTo(0,650)}>{p}</Link></li>
                                    )
                                })}
                            </ul>
                        </div>
                    </li>
                    <li className='relative flex flex-col items-start group'>
                        <p className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Perfume</p>

                        <div className="absolute z-20 flex w-50 top-9 justify-between px-5 gap-10 py-3 rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.25)] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-3 group-hover:translate-y-0 transition-all duration-200 bg-white">
                            <ul className='w-full flex flex-col gap-3'>
                                {["clothes perfume", "deodorant"].map((p)=>{
                                    return(
                                        <li key={p} className='capitalize cursor-pointer hover:text-[#FF8F9C]'><Link to={`/categoryPage/${p}`} onClick={()=> scrollTo(0,650)}>{p}</Link></li>
                                    )
                                })}
                            </ul>
                        </div>
                    </li>
                    <li>
                        <Link to="/blog" className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase'>Blog</Link>
                    </li>
                    {activeMegaDeal && (
                        <li>
                            <Link to="/hotOffer" className='font-semibold pb-3 text-[#464646] relative after:content-[] after:absolute after:w-[0%] after:h-[2.5px] after:bg-[#FF8F9C] after:left-0 after:bottom-0 hover:after:w-full after:transition-w after:duration-300  hover:text-[#FF8F9C] cursor-pointer uppercase flex items-center gap-1'>
                                Hot Offers 🔥
                            </Link>
                        </li>
                    )}
                </ul>
            </div>

            {/* Mobile Navigation Menu - Slide from right */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
                
                {/* Drawer */}
                <div className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#464646]">Menu</h2>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                                <IoClose className="text-2xl" />
                            </button>
                        </div>

                        <ul className='flex flex-col gap-4'>
                            <li>
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className='block font-semibold text-[#464646] hover:text-[#FF8F9C] uppercase py-2 border-b border-gray-200'>Home</Link>
                            </li>
                            <li>
                                <p className='font-semibold text-[#464646] uppercase py-2 border-b border-gray-200'>Men's</p>
                                <ul className='pl-4 mt-2 flex flex-col gap-2'>
                                    {["shirt", "shorts & jeans", "shoes", "wallet"].map((p)=>(
                                        <li key={p} className='capitalize text-sm hover:text-[#FF8F9C]'>
                                            <Link to={`/categoryPage/male/${p}`} onClick={() => {setMobileMenuOpen(false); scrollTo(0,650)}}>{p}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li>
                                <p className='font-semibold text-[#464646] uppercase py-2 border-b border-gray-200'>Women's</p>
                                <ul className='pl-4 mt-2 flex flex-col gap-2'>
                                    {["clothes", "earring", "necklace", "shorts & jeans"].map((p)=>(
                                        <li key={p} className='capitalize text-sm hover:text-[#FF8F9C]'>
                                            <Link to={`/categoryPage/female/${p}`} onClick={() => {setMobileMenuOpen(false); scrollTo(0,650)}}>{p}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li>
                                <p className='font-semibold text-[#464646] uppercase py-2 border-b border-gray-200'>Jewelry</p>
                                <ul className='pl-4 mt-2 flex flex-col gap-2'>
                                    {["earring", "couple rings", "necklace", "bracelets"].map((p)=>(
                                        <li key={p} className='capitalize text-sm hover:text-[#FF8F9C]'>
                                            <Link to={`/categoryPage/${p}`} onClick={() => {setMobileMenuOpen(false); scrollTo(0,650)}}>{p}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li>
                                <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className='block font-semibold text-[#464646] hover:text-[#FF8F9C] uppercase py-2 border-b border-gray-200'>Blog</Link>
                            </li>
                            {activeMegaDeal && (
                                <li>
                                    <Link to="/hotOffer" onClick={() => setMobileMenuOpen(false)} className='block font-semibold text-[#464646] hover:text-[#FF8F9C] uppercase py-2 border-b border-gray-200'>
                                        Hot Offers 🔥
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NavBar