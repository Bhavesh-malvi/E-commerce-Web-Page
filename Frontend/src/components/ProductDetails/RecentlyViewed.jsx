import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Products from '../Products'

const RecentlyViewed = ({ currentProductId }) => {
    const { products } = useContext(AppContext)
    const [history, setHistory] = useState([])

    useEffect(() => {
        // Read IDs from LocalStorage
        const storedIds = JSON.parse(localStorage.getItem("browsingHistory") || "[]");
        
        // Map IDs to full product objects
        const viewedProducts = storedIds
            .map(id => products.find(p => p._id === id)) // Find product in context
            .filter(p => p && p._id !== currentProductId) // Remove nulls and current product
            .slice(0, 10); // Limit to 10

        setHistory(viewedProducts);
        
    }, [currentProductId, products]);

    if (history.length === 0) return null;

    return (
        <div className="my-12 sm:my-16 md:my-20 border-t pt-6 sm:pt-8 md:pt-10 px-3 sm:px-4 md:px-0">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-[22px] font-bold text-[#333232]">Your Browsing History</h2>
            </div>

            <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 sm:pb-6 no-scrollbar snap-x">
                {history.map((item) => (
                    <div 
                        key={item._id} 
                        className="min-w-[160px] sm:min-w-[180px] md:min-w-[220px] lg:min-w-[240px] snap-start"
                    >
                        <Products product={item} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentlyViewed
