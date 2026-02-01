import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useToast } from "../components/common/Toast";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCreditCard, FaStripe, FaTicketAlt, FaCheck, FaPlus, FaMapMarkerAlt, FaEdit, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AddressForm from "../components/common/AddressForm";

const Checkout = () => {
  const { 
    getCart, placeOrder, applyCoupon, 
    addresses, selectedAddressID, setSelectedAddressID, 
    addAddress, updateAddress, fetchAddresses 
  } = useContext(AppContext);
  
  const toast = useToast();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  
  // Modal State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchCart();
    // Auto-fetch addresses if empty
    if (addresses.length === 0) {
      fetchAddresses();
    }
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const res = await getCart();
    if (res?.success && res.cart && res.cart.items.length > 0) {
      setCart(res.cart);
    } else {
      toast.info("Your cart is empty");
      navigate("/");
    }
    setLoading(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    
    // Calculate total for validation
    const itemsPrice = cart.totalPrice;
    const taxPrice = itemsPrice * 0.05;
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const estimatedTotal = itemsPrice + taxPrice + shippingPrice;

    const res = await applyCoupon(couponCode, estimatedTotal);
    
    if (res?.success) {
      setAppliedCoupon({
        code: couponCode,
        discount: res.discount,
        couponId: res.couponId
      });
      toast.success(`Coupon applied! You saved ₹${res.discount}`);
    } else {
      setAppliedCoupon(null);
      toast.error(res?.message || "Invalid coupon");
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    
    if (!selectedAddressID) {
      toast.error("Please select a shipping address");
      return;
    }

    setPlacing(true);

    const selectedAddress = addresses.find(a => a._id === selectedAddressID);

    const data = {
      shippingAddress: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        landmark: selectedAddress.landmark
      },
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : null
    };

    const res = await placeOrder(data);

    if (res?.success) {
      if (res.session_url) {
        toast.success("Redirecting to payment...");
        window.location.replace(res.session_url);
        return;
      }
      toast.success("Order placed successfully! 🎉");
      navigate("/orders");
    } else {
      toast.error(res?.message || "Failed to place order");
    }
    setPlacing(false);
  };

  const handleAddressSubmit = async (formData) => {
    let res;
    if (editingAddress) {
      res = await updateAddress(editingAddress._id, formData);
    } else {
      res = await addAddress(formData);
    }

    if (res.success) {
      setShowAddressForm(false);
      setEditingAddress(null);
      // Auto select the new/edited address
      setSelectedAddressID(res.address?._id || editingAddress?._id);
      localStorage.setItem("selectedAddressID", res.address?._id || editingAddress?._id);
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;

  const itemsPrice = cart?.totalPrice || 0;
  const taxPrice = itemsPrice * 0.05;
  const shippingPrice = itemsPrice > 1000 ? 0 : 50;
  const grossTotal = itemsPrice + taxPrice + shippingPrice;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const netTotal = grossTotal - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 sm:mb-10 font-serif tracking-tight">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT: Address & Payment */}
          <div className="space-y-10">
            
            {/* Address Selection */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-gray-200">1</span>
                  Shipping Address
                </h2>
                <button 
                  type="button"
                  onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                  className="text-[#FF8F9C] font-bold text-sm flex items-center gap-2 hover:bg-[#FF8F9C]/10 px-4 py-2 rounded-xl transition-all"
                >
                  <FaPlus size={12} />
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => {
                        setSelectedAddressID(addr._id);
                        localStorage.setItem("selectedAddressID", addr._id);
                      }}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                        selectedAddressID === addr._id 
                        ? 'border-[#FF8F9C] bg-[#FF8F9C]/5 shadow-md' 
                        : 'border-gray-100 hover:border-[#FF8F9C]/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                             selectedAddressID === addr._id ? 'border-[#FF8F9C]' : 'border-gray-200'
                          }`}>
                            {selectedAddressID === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8F9C]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-extrabold text-gray-900 uppercase tracking-tight">{addr.name}</p>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">{addr.label}</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium line-clamp-2">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-xs text-gray-400 font-bold mt-1">{addr.phone}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddress(addr);
                            setShowAddressForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[#FF8F9C] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
                     <FaMapMarkerAlt className="mx-auto text-gray-200 text-3xl mb-3" />
                     <p className="text-gray-400 font-bold">No saved addresses</p>
                  </div>
                )}
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-gray-200">2</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex flex-col gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#FF8F9C] bg-[#FF8F9C]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <FaMoneyBillWave className={`text-2xl ${paymentMethod === 'cod' ? 'text-[#FF8F9C]' : 'text-gray-400'}`} />
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#FF8F9C]' : 'border-gray-200'}`}>
                       {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8F9C]" />}
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-widest text-xs">Cash on Delivery</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Pay when you receive</p>
                  </div>
                </label>
                
                <label className={`flex flex-col gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[#FF8F9C] bg-[#FF8F9C]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <FaStripe className={`text-3xl ${paymentMethod === 'stripe' ? 'text-[#FF8F9C]' : 'text-gray-400'}`} />
                    <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-[#FF8F9C]' : 'border-gray-200'}`}>
                       {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8F9C]" />}
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-widest text-xs">Card / Online</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Secure via Stripe</p>
                  </div>
                </label>
              </div>
            </section>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:sticky lg:top-8 self-start">
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border border-[#FF8F9C]/10 relative overflow-hidden">
              {/* Abstract decorative circles */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF8F9C]/5 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-8 relative">Order Summary</h2>
              
              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar relative">
                {cart?.items.map((item, i) => {
                  const variantImage = item.variant?.color 
                    ? item.product?.variants?.find(v => v.color === item.variant.color)?.images?.[0]?.url
                    : null;
                  const displayImage = variantImage || item.product.mainImages?.[0]?.url;

                  return (
                  <div key={i} className="flex gap-5 items-center group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:border-[#FF8F9C]/30 transition-colors">
                      <img src={displayImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{item.product.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-400 font-bold">QTY: {item.quantity}</p>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <p className="text-xs font-black text-[#FF8F9C]">₹{(item.finalPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) })}
              </div>

              {/* Coupon Code */}
              <div className="mb-8 relative bg-gray-50 p-5 rounded-2xl border border-gray-100">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Offer Code</label>
                 <div className="flex gap-3">
                   <div className="relative flex-1">
                     <FaTicketAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="PROMO10" 
                       className="w-full bg-white border-2 border-transparent rounded-xl pl-11 pr-4 py-3 text-sm uppercase outline-none focus:border-[#FF8F9C] font-bold tracking-widest transition-all"
                       value={couponCode}
                       onChange={e => setCouponCode(e.target.value)}
                       disabled={!!appliedCoupon}
                     />
                   </div>
                   {appliedCoupon ? (
                     <button type="button" onClick={removeCoupon} className="bg-red-50 text-red-500 px-5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors">
                       Remove
                     </button>
                   ) : (
                     <button 
                       type="button" 
                       onClick={handleApplyCoupon} 
                       disabled={couponLoading || !couponCode}
                       className="bg-gray-900 text-white px-6 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-lg shadow-gray-200"
                     >
                       {couponLoading ? '...' : 'Apply'}
                     </button>
                   )}
                 </div>
                 {appliedCoupon && (
                   <div className="mt-3 text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     <FaCheck /> Coupon Applied
                   </div>
                 )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3.5 border-t border-gray-100 pt-6 text-gray-600 relative">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>Tax (5%)</span>
                  <span className="text-gray-900">₹{taxPrice.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? <span className="text-green-600">FREE</span> : <span className="text-gray-900">₹${shippingPrice}</span>}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 p-2 rounded-lg">
                    <span>Discount</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 mt-2">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Net Total</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{netTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] mt-8 shadow-2xl shadow-gray-300 hover:bg-black transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-3 group"
              >
                {placing ? 'Processing...' : (
                  <>
                    <span>Complete Order</span>
                    <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
            </div>
          </div>

        </div>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 z-[100] overflow-y-auto px-4 py-6 sm:py-12 flex justify-center items-start sm:items-center bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="fixed inset-0"
            />
            <div className="relative w-full max-w-2xl z-10 my-auto">
              <AddressForm 
                initialData={editingAddress}
                onSubmit={handleAddressSubmit}
                onCancel={() => setShowAddressForm(false)}
                loading={loading}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
