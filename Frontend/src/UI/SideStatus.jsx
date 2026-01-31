/* eslint-disable react-hooks/purity */
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { RxCross2 } from 'react-icons/rx'

const SideStatus = () => {

    const { dealOfTheDay,truncateText } = useContext(AppContext)

    const [isVisible, setIsVisible] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
    if (!dealOfTheDay?.length) return

    let timer

    const startCycle = () => {

        setIsVisible(true)

        timer = setTimeout(() => {

            setIsVisible(false)

            timer = setTimeout(() => {
                setCurrentIndex(i => (i + 1) % dealOfTheDay.length)
            }, 1000)

            // total hide = 3 sec
            timer = setTimeout(() => {
                startCycle()
            }, 3000)

        }, 5000)
    }

    startCycle()

    return () => clearTimeout(timer)
}, [dealOfTheDay])


    const product = dealOfTheDay?.[currentIndex]
    if (!product) return null

    return (
        <div
            className={`
                fixed bottom-5 left-5 flex w-80 px-3 py-3 gap-4
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

            <div className="w-18 h-18 border flex items-center justify-center p-1 rounded-[7px] border-gray-300">
                <img src={product.image?.[0]} alt={product.name} />
            </div>

            <div>
                <p className='text-[12px] text-[#787878]'>
                    Someone just bought
                </p>
                <p className='text-[14px] mt-2.5 text-[#454545] font-medium'>
                    {truncateText(product.name)}
                </p>
                <p className='text-[12px] mt-0.5 text-[#787878]'>
                    {Math.floor(Math.random() * 5) + 1} minutes ago
                </p>
            </div>
        </div>
    )
}

export default SideStatus
