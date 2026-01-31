import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Products from '../Products'

const RecentlyViewed = ({ currentProductId }) => {
    const { getMyActivity, user } = useContext(AppContext)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setLoading(false)
                return
            }
            const res = await getMyActivity()
            if (res.success) {
                // Filter out current product and duplicates
                const uniqueProducts = []
                const seen = new Set()
                
                res.data.forEach(item => {
                    if (item.product && 
                        item.product._id !== currentProductId && 
                        !seen.has(item.product._id)) {
                        uniqueProducts.push(item.product)
                        seen.add(item.product._id)
                    }
                })

                setHistory(uniqueProducts.slice(0, 10))
            }
            setLoading(false)
        }

        fetchHistory()
    }, [currentProductId, user, getMyActivity])

    if (!user || history.length === 0) return null

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
