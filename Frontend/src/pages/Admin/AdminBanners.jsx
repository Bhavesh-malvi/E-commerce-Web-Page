import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaPlus, FaTrash, FaImage, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const AdminBanners = () => {
  const { getBanners, createBanner, updateBanner, deleteBanner } = useContext(AppContext);
  const toast = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Form
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    price: "",
    image: "",
    isActive: true
  });

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
        image: banner.image,
        isActive: banner.isActive
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        subtitle: "",
        price: "",
        image: "",
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (isEditing) {
      res = await updateBanner(currentId, formData);
    } else {
      res = await createBanner(formData);
    }

    if (res?.success) {
      toast.success(isEditing ? "Banner updated" : "Banner created");
      setShowModal(false);
      fetchBanners();
    } else {
      toast.error(res?.message || "Operation failed");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Home Banners
          </h1>
          <p className="text-gray-600 mt-1">Manage slides for the home page carousel</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white/50 rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No banners found. Add your first banner!</p>
          </div>
        )}

        {banners.map(banner => (
          <div key={banner._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
            {/* Banner Preview */}
            <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
              <img 
                src={banner.image} 
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              
              {/* Floating Badge */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(banner)}
                  className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                >
                  <FaEdit size={14} />
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, id: banner._id })}
                  className="p-2 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{banner.title}</h3>
                  <p className="text-pink-500 font-medium text-sm">{banner.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{banner.price}</p>
                  <p className="text-xs text-gray-400">Starting Price</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-mono">ID: {banner._id.slice(-8)}</p>
                <button 
                  onClick={() => toggleStatus(banner)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    banner.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {banner.isActive ? (
                    <><FaTimes /> Deactivate</>
                  ) : (
                    <><FaCheck /> Activate</>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/banner.jpg"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
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
                  className="px-10 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg shadow-purple-200"
                >
                  {isEditing ? 'Save Changes' : 'Publish Banner'}
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
