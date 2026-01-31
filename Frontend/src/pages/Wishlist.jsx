import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import Products from '../components/Products'
import { Link } from 'react-router-dom'
import { IoHeartOutline } from 'react-icons/io5'
import RecentlyViewed from '../components/ProductDetails/RecentlyViewed'
import { useToast } from '../components/common/Toast'

const Wishlist = () => {
    const { wishlist, getWishlist, addToCart, clearWishlist } = useContext(AppContext);
    const toast = useToast();

    React.useEffect(() => {
        getWishlist();
    }, []);

    const handleAddAllToCart = async () => {
        if (!wishlist?.items?.length) return;
        
        // Improve UX by showing loading state if needed
        let addedCount = 0;
        
        for (const item of wishlist.items) {
           // Skip if no product
           if(!item.product) continue;
           
           const res = await addToCart(item.product._id, 1);
           if (res.success) addedCount++;
        }

        if (addedCount > 0) {
            // Optional: Clear wishlist after moving to cart
             await clearWishlist(); // If clearWishlist exists
             toast.success(`${addedCount} items added to cart!`);
        } else {
             toast.error("Failed to add items to cart");
        }
    };

    return (
        <>
            <div className="py-12 sm:py-16 md:py-20 lg:py-25 min-h-[70vh] px-3 sm:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-12 sm:mb-16 md:mb-20 border-b border-gray-200 pb-4 sm:pb-5">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2937]">My Wishlist</h1>
                        <p className="text-sm sm:text-base text-[#6B7280] mt-1">You have {wishlist?.items?.length || 0} items saved for later</p>
                    </div>
                    {wishlist?.items?.length > 0 && (
                        <button onClick={handleAddAllToCart} className="w-full sm:w-auto bg-[#FF8F9C] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-[#ff7b8b] transition-all shadow-md active:scale-95">
                            Add All to Cart
                        </button>
                    )}
                </div>
                
                {!wishlist?.items || wishlist.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FFF1F3] rounded-full flex justify-center items-center mb-5 sm:mb-6">
                            <IoHeartOutline className="text-4xl sm:text-5xl text-[#FF8F9C]" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#374151] text-center">Your wishlist is waiting!</h2>
                        <p className="text-sm sm:text-base text-[#9CA3AF] mt-2 mb-6 sm:mb-8 text-center max-w-sm px-4">
                            Create your dream collection by saving items you love. They'll be right here when you're ready to buy.
                        </p>
                        <Link to="/" className="border-2 border-[#FF8F9C] text-[#FF8F9C] px-8 sm:px-10 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:bg-[#FF8F9C] hover:text-white transition-all">
                            START SHOPPING
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
                        {wishlist.items.map((item) => (
                            <div key={item._id} className="relative group">
                                <Products product={item.product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RecentlyViewed />
        </>
    )
}

export default Wishlist
