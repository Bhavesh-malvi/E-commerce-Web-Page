import React, { useContext, useEffect, useState } from 'react'
import { IoIosSearch } from 'react-icons/io'
import { AppContext } from '../../context/AppContext'
import StarRating from '../../UI/StarRating'

const FilteredBar = ({ isMobile = false }) => {

    const {
        baseCategoryData,
        setFilteredData,
        currency,
        convertPrice
    } = useContext(AppContext)

    // FILTER STATES
    const [search, setSearch] = useState("")
    const [price, setPrice] = useState(10000)
    const [ratings, setRatings] = useState([])
    const [sale, setSale] = useState(false)
    const [isNew, setIsNew] = useState(false)

    // ⭐ toggle rating
    const toggleRating = (r) => {
        setRatings(prev =>
            prev.includes(r)
                ? prev.filter(i => i !== r)
                : [...prev, r]
        )
    }

    // 🔥 AUTO FILTER EFFECT
    useEffect(() => {
        let data = [...baseCategoryData]

        // 🔍 Search
        if (search.trim()) {
            data = data.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase())
            )
        }

        // 💰 Price
        const maxPrice = Number(price);
        data = data.filter(p => {
            const finalPrice = Number(p.discountPrice || p.offerPrice || p.price || 0);
            return finalPrice <= maxPrice;
        })

        // 🔥 Sale
        if (sale) {
            data = data.filter(p => p.badges?.some(b => b.toLowerCase() === "sale") || p.badge?.toLowerCase() === "sale")
        }

        // 🆕 New Products
        if (isNew) {
            data = data.filter(p => p.badges?.some(b => b.toLowerCase() === "new") || p.badge?.toLowerCase() === "new")
        }

        // ⭐ Ratings
        if (ratings.length) {
            data = data.filter(p =>
                ratings.includes(Math.floor(p.ratings || p.rating || 0))
            )
        }

        setFilteredData(data)

    }, [search, price, ratings, sale, isNew, baseCategoryData])

    // Mobile horizontal layout
    if (isMobile) {
        return (
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max">
                    {/* Search */}
                    <div className="flex items-center border rounded-full px-3 py-1.5 bg-white min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-0 text-sm"
                        />
                        <IoIosSearch className="text-lg" />
                    </div>

                    {/* Price Range */}
                    <div className="flex items-center gap-2 border rounded-full px-4 py-1.5 bg-white">
                        <span className="text-xs whitespace-nowrap">Max: {currency === "USD" ? "$" : "₹"}{convertPrice(price)}</span>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-24"
                        />
                    </div>

                    {/* Sale Checkbox */}
                    <label className="flex items-center gap-2 border rounded-full px-4 py-1.5 bg-white cursor-pointer whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={sale}
                            onChange={() => setSale(!sale)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">On Sale</span>
                    </label>

                    {/* New Checkbox */}
                    <label className="flex items-center gap-2 border rounded-full px-4 py-1.5 bg-white cursor-pointer whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={isNew}
                            onChange={() => setIsNew(!isNew)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">New Arrivals</span>
                    </label>

                    {/* Ratings */}
                    {[5, 4, 3].map(r => (
                        <label key={r} className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-white cursor-pointer">
                            <input
                                type="checkbox"
                                checked={ratings.includes(r)}
                                onChange={() => toggleRating(r)}
                                className="w-4 h-4"
                            />
                            <StarRating rating={r} textSize="14px" />
                        </label>
                    ))}
                </div>
            </div>
        )
    }

    // Desktop vertical layout
    return (
        <div>
            <h1 className="text-sm sm:text-base md:text-[17px] font-semibold uppercase border-b py-3 sm:py-4 border-gray-200">
                Filters
            </h1>

            <div className="border rounded-[8px] sm:rounded-[10px] py-3 sm:py-4 px-3 sm:px-4 md:px-5 mt-4 sm:mt-5 border-gray-200">

                {/* 🔍 SEARCH */}
                <div className="flex items-center border rounded-3xl px-2 sm:px-3 py-1.5 sm:py-2">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-0 text-sm sm:text-base"
                    />
                    <IoIosSearch className="text-lg sm:text-xl" />
                </div>

                {/* 💰 PRICE */}
                <div className="mt-4 sm:mt-5 md:mt-6">
                    <p className="text-center text-xs sm:text-sm mb-2">
                        {currency === "USD" ? "$" : "₹"} {convertPrice(0)} —
                        {currency === "USD" ? "$" : "₹"} {convertPrice(price)}
                    </p>
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* 🔥 SALE & NEW */}
                <div className="mt-3 sm:mt-4 flex flex-col gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <label className="flex gap-2 items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sale}
                            onChange={() => setSale(!sale)}
                            className="w-4 h-4"
                        />
                        On Sale
                    </label>

                    <label className="flex gap-2 items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isNew}
                            onChange={() => setIsNew(!isNew)}
                            className="w-4 h-4"
                        />
                        New Arrivals
                    </label>
                </div>

                {/* ⭐ RATINGS */}
                <div className="mt-4 sm:mt-5 md:mt-6">
                    <h1 className="font-semibold uppercase mb-2 sm:mb-3 text-sm sm:text-base">
                        Ratings
                    </h1>

                    {[5, 4, 3, 2, 1].map(r => (
                        <label key={r} className="flex gap-2 mb-1.5 sm:mb-2 items-center cursor-pointer text-sm sm:text-base">
                            <input
                                type="checkbox"
                                checked={ratings.includes(r)}
                                onChange={() => toggleRating(r)}
                                className="w-4 h-4"
                            />
                            <StarRating rating={r} textSize="16px" />
                        </label>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default FilteredBar
