/* eslint-disable react-hooks/purity */
import React, { useContext, useEffect, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { RxCross2 } from 'react-icons/rx'

const SideStatus = () => {

    const { activeMegaDeal, products, truncateText } = useContext(AppContext)

    const [isVisible, setIsVisible] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const timerRef = useRef(null)

    // Use mega deal products if available, otherwise use products as fallback
    const megaDealProducts = activeMegaDeal?.products || []
    const displayProducts = megaDealProducts.length > 0 ? megaDealProducts : (products?.slice(0, 10) || [])


    useEffect(() => {
        if (!displayProducts?.length) return

        const runCycle = () => {
            // Step 1: Show (slide in)
            setIsVisible(true)

            // Step 2: After 5 seconds, hide (slide out)
            timerRef.current = setTimeout(() => {
                setIsVisible(false)

                // Step 3: After 2 seconds (hidden), change product and show again
                timerRef.current = setTimeout(() => {
                    setCurrentIndex(prev => (prev + 1) % displayProducts.length)
                    runCycle() // Restart cycle
                }, 2000)

            }, 5000)
        }

        // Start first cycle after a small delay
        timerRef.current = setTimeout(() => {
            runCycle()
        }, 1000)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [displayProducts?.length])


    const product = displayProducts?.[currentIndex]
    if (!product) return null

    // Get image URL - handle mainImages array from backend
    const imageUrl = product.mainImages?.[0]?.url || product.mainImages?.[0] || product.image?.[0] || ''

    return (
        <div
            className={`
                fixed bottom-2 left-2 md:bottom-5 md:left-5 flex w-64 md:w-80 px-2 md:px-3 py-2 md:py-3 gap-2 md:gap-4
                bg-white rounded-[7px]
                shadow-[0_0_15px_rgba(0,0,0,0.25)]
                transition-all duration-500
                z-100
                ${isVisible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-20 pointer-events-none'}
            `}
        >
            <div className="absolute right-2 top-2 text-[13px] text-[#787878] cursor-pointer" onClick={() => setIsVisible(false)} >
                <RxCross2 />
            </div>

            <div className="w-14 h-14 md:w-18 md:h-18 border flex items-center justify-center p-1 rounded-[7px] border-gray-300">
                <img src={imageUrl} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>

            <div className="flex-1 min-w-0">
                <p className='text-[10px] md:text-[12px] text-[#787878]'>
                    Someone just bought
                </p>
                <p className='text-[12px] md:text-[14px] mt-1 md:mt-2.5 text-[#454545] font-medium truncate'>
                    {product.name}
                </p>
                <p className='text-[10px] md:text-[12px] mt-0.5 text-[#787878]'>
                    {Math.floor(Math.random() * 5) + 1} minutes ago
                </p>
            </div>
        </div>
    )
}

export default SideStatus
