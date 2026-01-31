import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { Link, useNavigate } from 'react-router-dom'
import { IoTrashOutline } from 'react-icons/io5'
import { useToast } from '../components/common/Toast'

const Cart = () => {
    const { cart, getCart, removeFromCart, updateCartQuantity, currency, convertPrice } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        await getCart();
        setLoading(false);
    };

    const handleQuantityChange = async (productId, newQty) => {
        if (newQty < 1) return;
        console.log("Updating quantity:", { productId, newQty });
        const res = await updateCartQuantity(productId, newQty);
        if (!res?.success) {
            toast.error(res?.message || "Failed to update quantity");
        }
    };

    const handleRemove = async (productId) => {
        const res = await removeFromCart(productId);
        if (res?.success) {
            toast.success("Item removed from cart");
        } else {
            toast.error(res?.message || "Failed to remove item");
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8F9C]"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <IoTrashOutline className="text-6xl text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Add some products to get started!</p>
                <Link to="/" className="bg-[#FF8F9C] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#ff7b8b] transition-all shadow-md">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const itemsPrice = cart.totalPrice || 0;
    const taxPrice = itemsPrice * 0.05;
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    return (
        <div className="py-8 sm:py-12 md:py-15 px-4 sm:px-6 md:px-8 lg:px-25 min-h-screen bg-gray-50">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item._id} className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <img 
                                src={item.product?.mainImages?.[0]?.url} 
                                alt={item.product?.name} 
                                className="w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 object-cover rounded-lg border border-gray-200"
                            />
                            
                            <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{item.product?.name}</h3>
                                {item.variant && (
                                    <p className="text-xs sm:text-sm text-gray-500 mb-2">
                                        {item.variant.color && `Color: ${item.variant.color}`}
                                        {item.variant.size && ` • Size: ${item.variant.size}`}
                                    </p>
                                )}
                                <p className="text-lg sm:text-xl font-bold text-[#FF8F9C]">
                                    {currency === "USD" ? "$" : "₹"}{convertPrice(item.finalPrice)}
                                </p>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between">
                                <button 
                                    onClick={() => handleRemove(typeof item.product === 'object' ? item.product._id : item.product)}
                                    className="text-red-500 hover:text-red-700 transition-colors order-2 sm:order-1"
                                >
                                    <IoTrashOutline className="text-lg sm:text-xl" />
                                </button>

                                <div className="flex items-center gap-2 sm:gap-3 border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 order-1 sm:order-2">
                                    <button 
                                        onClick={() => handleQuantityChange(typeof item.product === 'object' ? item.product._id : item.product, item.quantity - 1)}
                                        className="text-lg sm:text-xl font-bold text-gray-600 hover:text-[#FF8F9C] transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="text-base sm:text-lg font-semibold w-6 sm:w-8 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(typeof item.product === 'object' ? item.product._id : item.product, item.quantity + 1)}
                                        className="text-lg sm:text-xl font-bold text-gray-600 hover:text-[#FF8F9C] transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 mt-6 lg:mt-0">
                    <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 lg:sticky lg:top-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        
                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({cart.totalItems} items)</span>
                                <span>{currency === "USD" ? "$" : "₹"}{convertPrice(itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (5%)</span>
                                <span>{currency === "USD" ? "$" : "₹"}{convertPrice(taxPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>
                                    {shippingPrice === 0 ? (
                                        <span className="text-green-600 font-medium">Free</span>
                                    ) : (
                                        `${currency === "USD" ? "$" : "₹"}${convertPrice(shippingPrice)}`
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                            <span>Total</span>
                            <span>{currency === "USD" ? "$" : "₹"}{convertPrice(totalPrice)}</span>
                        </div>

                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-gradient-to-r from-[#FF8F9C] to-[#ff7b8b] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            Proceed to Checkout
                        </button>

                        <Link to="/" className="block text-center text-[#FF8F9C] font-medium mt-4 hover:underline">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
