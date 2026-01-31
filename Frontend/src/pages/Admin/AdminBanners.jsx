import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaPlus, FaTrash, FaImage, FaEdit, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const AdminBanners = () => {
  const { getBanners, createBanner, updateBanner, deleteBanner } = useContext(AppContext);
  const toast = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    price: "",
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const res = await getBanners();
    if (res?.success) setBanners(res.banners);
    setLoading(false);
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setIsEditing(true);
      setCurrentId(banner._id);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        price: banner.price,
        isActive: banner.isActive
      });
      setPreviewUrl(banner.image);
      setSelectedFile(null);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        subtitle: "",
        price: "",
        isActive: true
      });
      setPreviewUrl("");
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const bannerData = new FormData();
      bannerData.append("title", formData.title);
      bannerData.append("subtitle", formData.subtitle);
      bannerData.append("price", formData.price);
      bannerData.append("isActive", formData.isActive);
      if (selectedFile) {
        bannerData.append("image", selectedFile);
      }

      let res;
      if (isEditing) {
        res = await updateBanner(currentId, bannerData);
      } else {
        res = await createBanner(bannerData);
      }

      if (res?.success) {
        toast.success(isEditing ? "Banner updated" : "Banner created");
        setShowModal(false);
        fetchBanners();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
       toast.error("An error occurred during submission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteBanner(deleteModal.id);
    if (res?.success) {
      toast.success("Banner deleted");
      setBanners(prev => prev.filter(b => b._id !== deleteModal.id));
    } else {
      toast.error(res?.message);
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const toggleStatus = async (banner) => {
    const res = await updateBanner(banner._id, { isActive: !banner.isActive });
    if (res?.success) {
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`);
      fetchBanners();
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            Home Banners
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage home page slideshow</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100/50 hover:bg-blue-700 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3"
        >
          <FaPlus size={14} /> Add New Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-24 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <FaImage className="text-slate-200 text-4xl" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No banners found</p>
          </div>
        )}

        {banners.map(banner => (
          <div key={banner._id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            {/* Banner Preview */}
            <div className="relative h-56 sm:h-64 bg-slate-100 overflow-hidden">
              <img 
                src={banner.image} 
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all" />
              
              {/* Floating Badge */}
              <div className={`absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg ${
                banner.isActive ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
              }`}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={() => handleOpenModal(banner)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md text-blue-600 rounded-2xl shadow-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                >
                  <FaEdit size={14} />
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, id: banner._id })}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md text-rose-600 rounded-2xl shadow-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight uppercase tracking-tight">{banner.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="w-4 h-[1px] bg-indigo-500"></span>
                     <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">{banner.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800 tracking-tighter">₹{banner.price}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 opacity-60">Entry Price</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ref: {banner._id.slice(-8)}</p>
                <button 
                  onClick={() => toggleStatus(banner)}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    banner.isActive ? 'text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg' : 'text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg'
                  }`}
                >
                  {banner.isActive ? (
                    <>Deactivate</>
                  ) : (
                    <>Activate</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-6 text-[#212121]">
              <h2 className="text-2xl font-bold">{isEditing ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl group flex items-center justify-center h-10 w-10 p-2">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                  <div className="flex flex-col gap-4">
                    {previewUrl && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative">
                      <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        required={!isEditing}
                        onChange={handleFileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sale Offer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    placeholder="2700"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <textarea
                    required
                    placeholder="e.g. New Fashion Summer Sale"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-24"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                   <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                   />
                   <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Show this banner immediately</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg shadow-purple-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {isEditing ? 'Saving...' : 'Publishing...'}
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : 'Publish Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure? This image will be removed from the home page slideshow."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default AdminBanners;
