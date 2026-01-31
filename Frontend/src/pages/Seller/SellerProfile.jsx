import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import { FaShopify, FaMapMarkerAlt, FaPhoneAlt, FaFileInvoice, FaSave } from "react-icons/fa";

const SellerProfile = () => {
  const { getSellerProfile, updateSellerProfile } = useContext(AppContext);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: "",
    phone: "",
    gstNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    }
  });

  const [stats, setStats] = useState({
    status: "",
    isVerified: false,
    totalSales: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await getSellerProfile();
    if (res.success) {
      const s = res.seller;
      setFormData({
        shopName: s.shopName || "",
        phone: s.phone || "",
        gstNumber: s.gstNumber || "",
        address: {
          street: s.address?.street || "",
          city: s.address?.city || "",
          state: s.address?.state || "",
          pincode: s.address?.pincode || ""
        }
      });
      setStats({
        status: s.status,
        isVerified: s.isVerified,
        totalSales: s.totalSales,
        totalOrders: s.totalOrders
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSellerProfile(formData);
    if (res.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(res.message || "Failed to update profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-200/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-bold border border-white/30">
            {formData.shopName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{formData.shopName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${stats.isVerified ? 'bg-emerald-400/20 border border-emerald-400' : 'bg-amber-400/20 border border-amber-400'}`}>
                {stats.status}
              </span>
              {stats.isVerified && <span className="text-emerald-300 text-xs font-medium">✓ Verified Merchant</span>}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 min-w-[120px]">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Total Sales</p>
            <p className="text-xl font-bold mt-1">₹{stats.totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 min-w-[120px]">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Orders</p>
            <p className="text-xl font-bold mt-1">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        
        {/* Left Column: Business Info */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white rounded-[2rem] shadow-xl shadow-purple-100/20 border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-3">
               <FaShopify className="text-purple-600" />
               <h2 className="text-lg font-bold text-slate-800">Business Identity</h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Shop Display Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium"
                  placeholder="Your Brand Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GST Identification Number</label>
                <div className="relative">
                  <FaFileInvoice className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium uppercase"
                    placeholder="Enter GSTIN (Optional)"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2rem] shadow-xl shadow-purple-100/20 border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-3">
               <FaMapMarkerAlt className="text-pink-600" />
               <h2 className="text-lg font-bold text-slate-800">Dispatch Address</h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Street / Building / Area</label>
                <textarea
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-medium resize-none"
                  placeholder="Detailed address for order pickup..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Actions & Help */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white sticky top-24">
              <h3 className="text-xl font-bold mb-4">Save Profile</h3>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                Updating your shop name and address will reflect on all invoices and the store's customer-facing product pages.
              </p>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaSave />
                    Update Profile
                  </>
                )}
              </button>
              
              <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Your data is secure
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Verified by Admin
                 </div>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default SellerProfile;
