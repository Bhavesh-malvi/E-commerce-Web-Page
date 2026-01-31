import React from 'react'
import { assets, trending, BlogCategory } from '../assets/assets'
import { FaArrowTrendUp } from 'react-icons/fa6'
import { TiStarOutline } from 'react-icons/ti'
import BlogData from '../components/Blog/BlogData'
import BlogCategoryData from '../components/Blog/BlogCategory'

const Blog = () => {


    return (
        <>
            <section className="py-8 sm:py-12 px-3 sm:px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-16 items-center">
                    <div className="flex flex-col order-2 lg:order-1" style={{animationDelay: '0.1s'}}>
                        <p className='px-3 sm:px-4 w-fit uppercase inline-block py-1 sm:py-1.5 bg-[#FF8F9C]/10 text-[#FF8F9C] text-xs font-semibold tracking-widest rounded-full mb-4 sm:mb-6'>Featured Story</p>
                        <p className='block text-xs sm:text-sm font-medium tracking-widest uppercase text-[#7c736a] mb-3 sm:mb-4'>Jewelry</p>
                        <h1 className='font-Cormorant text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight mb-4 sm:mb-6'>The Art of Timeless Elegance: Spring's Most Coveted Jewelry</h1>
                        <p className='text-base sm:text-lg text-[#7c736a] leading-relaxed mb-6 sm:mb-8 max-w-xl'>Discover the exquisite craftsmanship behind this season's most sought-after pieces. From delicate gold chains to statement earrings, explore how artisans are redefining luxury.</p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm">
                            <span className='text-[#7c736a]'>By <span className='text-[#221f1c] font-medium'>Victoria Laurent</span></span>
                            <span className="w-1 h-1 bg-[#7c736a] rounded-full hidden sm:inline"></span>
                            <span className='text-[#7c736a]'>Jan 18, 2025</span>
                            <span className="w-1 h-1 bg-[#7c736a] rounded-full hidden sm:inline"></span>
                            <span className='text-[#7c736a]'>8 min read</span>
                        </div>
                    </div>
                    <div className="h-64 sm:h-96 md:h-[500px] lg:h-[600px] xl:h-[122vh] order-1 lg:order-2">
                        <img src={assets.blog_banner} className='w-full h-full object-cover rounded-lg lg:rounded-none' alt="" />
                    </div>
                </div>
            </section>

            <section className='py-16 md:py-20'>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-[#FF8F9C] rounded-full flex items-center justify-center text-white">
                        <FaArrowTrendUp />
                    </div>
                    <h2 className='font-Cormorant text-2xl md:text-3xl font-semibold'>Trending Now</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {trending.map((items)=>(
                        <div className="group flex gap-4 p-4 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <span className='font-Cormorant text-4xl font-bold text-[#FF8F9C]/30 group-hover:text-[#FF8F9C] transition-color'>{items.id}</span>
                            <div className="flex-1 min-w-0">
                                <span className='text-xs font-semibold tracking-widest uppercase text-[#FF8F9C] mb-2 block'>{items.title}</span>
                                <h3 className='font-Cormorant text-lg font-semibold leading-tight line-clamp-2  group-hover:text-[#FF8F9C] transition-color'>{items.desc}</h3>

                                <div className="flex items-center gap-2 mt-3 text-xs text-[#7c736a]">
                                    <span>{items.author}</span>
                                    <span className="w-1 h-1 bg-[#7c736a] rounded-full"></span>
                                    <span>{items.timing}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className='py-16 md:py-24'>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#221f1c] rounded-full flex items-center justify-center text-white text-[23px]">
                                <TiStarOutline />
                            </div>
                            <h2 className='font-Cormorant text-2xl md:text-3xl font-semibold'>Editor's Picks</h2>
                        </div>
                        <p className='text-sm font-medium tracking-wide uppercase text-[#7c736a] hover:text-[#221f1c]'>View All</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-lg cursor-pointer">
                            <div className="aspect-16/10 lg:aspect-auto lg:h-full">
                                <img src={assets.blog_accessories} className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105' alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#221f1c] via-[#221f1c]/50 to-transparent"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 mb:p-10">
                                <span className='inline-block px-3 py-1 bg-[#FF8F9C] text-[#fcfaf8] text-xs font-semibold tracking-widest uppercase rounded-full mb-4'>Men</span>
                                <h3 className='font-Cormorant text-2xl md:text-4xl font-semibold text-[#fcfaf8] leading-tight mb-4 group-hover:text-[#FF8F9C]/50 transition-color'>The Ultimate Watch Guide for the Modern Gentleman</h3>
                                <p className='text-[#fcfaf8]/80 text-sm md:text-base mb-4 max-w-lg line-clamp-2'>From dress watches to sports chronographs, discover the timepieces that define sophisticated style.</p>

                                <div class="flex items-center gap-4 text-xs text-[#fcfaf8]/70">
                                    <span>Marcus Wong</span>
                                    <span>•</span>
                                    <span>Jan 17, 2025</span>
                                    <span>•</span>
                                    <span>10 min read</span>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-lg">
                            <div className="aspect-4/3">
                                <img src={assets.blog_jewelry_4} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#221f1c] via-[#221f1c]/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className='block py-1 text-[#FF8F9C] text-xs font-semibold tracking-widest uppercase mb-2'>Jewelry</span>
                                    <h3 className='font-Cormorant text-lg font-semibold text-[#fcfaf8] leading-tight line-clamp-2 group-hover:text-[#FF8F9C]/50 transition-colors'>Bridal Jewelry: Finding Your Perfect Wedding Day Pieces</h3>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-[#fcfaf8]/70">
                                        <span>8 min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-lg">
                            <div className="aspect-4/3">
                                <img src={assets.blog_womens_4} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#221f1c] via-[#221f1c]/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className='block py-1 text-[#FF8F9C] text-xs font-semibold tracking-widest uppercase mb-2'>Women</span>
                                    <h3 className='font-Cormorant text-lg font-semibold text-[#fcfaf8] leading-tight line-clamp-2 group-hover:text-[#FF8F9C]/50 transition-colors'>Garden Party Elegance: Embracing Romantic Florals</h3>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-[#fcfaf8]/70">
                                        <span>6 min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-lg">
                            <div className="aspect-4/3">
                                <img src={assets.blog_shoes_3} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#221f1c] via-[#221f1c]/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className='block py-1 text-[#FF8F9C] text-xs font-semibold tracking-widest uppercase mb-2'>Shoes</span>
                                    <h3 className='font-Cormorant text-lg font-semibold text-[#fcfaf8] leading-tight line-clamp-2 group-hover:text-[#FF8F9C]/50 transition-colors'>The Art of the Oxford: A Timeless Shoe Investment</h3>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-[#fcfaf8]/70">
                                        <span>7 min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 group relative overflow-hidden rounded-lg max-h-80">
                            <div className="aspect-4/3">
                                <img src={assets.blog_womens_2} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#221f1c] via-[#221f1c]/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className='block py-1 text-[#FF8F9C] text-xs font-semibold tracking-widest uppercase mb-2'>Bag</span>
                                    <h3 className='font-Cormorant text-lg font-semibold text-[#fcfaf8] leading-tight line-clamp-2 group-hover:text-[#FF8F9C]/50 transition-colors'>Handbag Essentials: The Only Five Bags You'll Ever Need</h3>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-[#fcfaf8]/70">
                                        <span>8 min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='py-16 md:py-20'>
                <div className="px-4 ">
                    <h2 className='font-Cormorant text-3xl md:text-4xl font-semibold text-center mb-4'>Explore by Category</h2>
                    <p className='text-[#7c736a] text-center max-w-2xl mx-auto mb-12'>Dive deep into your favorite topics with our curated collections</p>

                    <div className="py-12 border-t border-[#e7e1da] first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className='font-Cormorant text-2xl font-semibold'>Jewelry</h3>
                            <p className='text-sm font-medium tracking-wide uppercase text-[#7c736a] hover:text-[#7c736a]'>See All Jewelry</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {BlogCategory.filter((p)=> p.Category === "jewelry").slice(0,4).map((data)=>{
                                return(
                                    <BlogData data={data} dataFlow={"first"} />
                                )
                            })}
                        </div>
                    </div>

                    <div className="py-12 border-t border-[#e7e1da] first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className='font-Cormorant text-2xl font-semibold'>Women</h3>
                            <p className='text-sm font-medium tracking-wide uppercase text-[#7c736a] hover:text-[#7c736a]'>See All Women</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {BlogCategory.filter((p)=> p.Category === "women").slice(0,4).map((data)=>{
                                return(
                                    <BlogData data={data} dataFlow={"first"} />
                                )
                            })}
                        </div>
                    </div>

                    <div className="py-12 border-t border-[#e7e1da] first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className='font-Cormorant text-2xl font-semibold'>Men</h3>
                            <p className='text-sm font-medium tracking-wide uppercase text-[#7c736a] hover:text-[#7c736a]'>See All men</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {BlogCategory.filter((p)=> p.Category === "men").slice(0,4).map((data)=>{
                                return(
                                    <BlogData data={data} dataFlow={"first"} />
                                )
                            })}
                        </div>
                    </div>

                    <div className="py-12 border-t border-[#e7e1da] first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className='font-Cormorant text-2xl font-semibold'>Shoes</h3>
                            <p className='text-sm font-medium tracking-wide uppercase text-[#7c736a] hover:text-[#7c736a]'>See All Shoes</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {BlogCategory.filter((p)=> p.Category === "shoes").slice(0,4).map((data)=>{
                                return(
                                    <BlogData data={data} dataFlow={"first"} />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <BlogCategoryData />

        </>
    )
}

export default Blog