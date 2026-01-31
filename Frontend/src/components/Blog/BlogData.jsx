import React from 'react'
import { RxArrowTopRight } from 'react-icons/rx'

const BlogData = ({data, dataFlow="second"}) => {
  return (
    <>
        <div className={`group ${dataFlow === "second" ? "blog-card-hover cursor-pointer hover:shadow-lg" : ""}`}>
            <div className={` overflow-hidden mb-4 ${dataFlow === "second" ? "aspect-4/4 relative" : "aspect-3/4 rounded-lg"}`}>
                <img src={data.img} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' alt="" />
                {dataFlow === "second" ? (
                    <>
                        <div className="absolute indent-0 bg-gradient-to-t from-[#221f1c4d] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className='absolute top-4 left-4 px-3 py-1 bg-[#fcfaf8f2] text-xs font-semibold tracking-widest uppercase rounded-full'>{data.Category}</span>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-[#fcfaf8] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <RxArrowTopRight />
                        </div>
                    </>
                ): null
                }
            </div>
            <div className={`${dataFlow === "second" ? "pt-5" : ""}`}>
                <h4 className="font-Cormorant text-lg font-semibold leading-tight line-clamp-2 group-hover:text-[#FF8F9C] transition-color">{data.title}</h4>
                <p className="text-sm text-[#7c736a] mt-2 line-clamp-2">{data.desc}</p>
                <div class="flex items-center gap-2 mt-3 text-xs text-[#7c736a]">
                    <span>{data.author}</span>
                    {dataFlow === "second" ? (
                        <>
                            <span>•</span>
                            <span>{data.readDate}</span>
                        </>
                    ): null}
                    <span>•</span>
                    <span>{data.readTime}</span>
                </div>
            </div>
        </div>
    </>
  )
}

export default BlogData