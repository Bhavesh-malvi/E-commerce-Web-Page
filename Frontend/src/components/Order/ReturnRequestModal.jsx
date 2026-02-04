
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaUpload, FaCheck } from 'react-icons/fa';
import API from '../../Api/Api'; // Adjust path if needed

const ReturnRequestModal = ({ isOpen, onClose, orderId, item, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !item) return null;

  const reasons = [
    "Product Damaged",
    "Wrong Item Received",
    "Item Defective",
    "Don't like the product",
    "Size doesn't fit",
    "Other"
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        
        const res = await API.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (res.data.success) {
            return res.data.url;
        } else {
            throw new Error("Upload failed");
        }
      });

      const urls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...urls]);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  
    // Since I cannot easily add a generic upload route safely without more checking,
    // and `requestReturn` is JSON.
    // I will mock the upload for now to Local Object URL for preview, 
    // BUT for the actual request I'll send a placeholder or base64?
    // User wants "image upload".
    // I will modify `OrderRoute.js` to add an upload endpoint?
    // Let's stick to the UI first. I'll pass the file objects if I can.
    // But `requestReturn` expects `items` array.
    // I'll implement logic to upload to a new `/api/support/upload` or similar if I can.
    
    // DECISION: To keep it working without massive backend changes for generic upload:
    // I will use a simple "Upload" button that mimics upload and returns a string URL 
    // (In a real app, this would hit /api/upload).
    // I'll add a todo to implement real upload.
    // Wait, the user `UserDashboard` has `UpdatePassword` etc.
    // Let's check `ProductModel` image handling. It has `public_id`, `url`.
    
    // Temporary solution: Just UI for now.

  const handleSubmit = async () => {
    if (["Product Damaged", "Item Defective"].includes(reason) && images.length === 0) {
      alert("Please upload at least one image for damaged/defective items.");
      return;
    }
    if (!reason) {
      alert("Please select a reason.");
      return;
    }

    setLoading(true);
    try {
      // Use actual uploaded images
      const validImages = images;
        
      const payload = {
        items: [{
          itemId: item._id,
          reason,
          description,
          images: validImages 
        }]
      };

      const res = await API.post(`/order/return/${orderId}`, payload);
      
      if (res.data.success) {
        onSuccess(res.data.message);
        onClose();
      } else {
        alert(res.data.message || "Failed to request return");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
                 <h3 className="text-lg font-black text-gray-900 tracking-tight">Request Return</h3>
                 <p className="text-xs text-gray-500 font-bold">{item.name}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all">
                <FaTimes />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
             
             {/* Reason */}
             <div className="space-y-2">
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Reason for Return</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {reasons.map((r) => (
                        <div 
                            key={r}
                            onClick={() => setReason(r)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-xs font-bold ${
                                reason === r 
                                ? 'border-[#FF8F9C] bg-[#FF8F9C]/5 text-[#FF8F9C]' 
                                : 'border-gray-100 text-gray-500 hover:border-gray-200'
                            }`}
                        >
                            {r}
                        </div>
                    ))}
                </div>
             </div>

             {/* Description */}
             <div className="space-y-2">
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please explain the issue..."
                    className="w-full bg-gray-50 border-2 border-transparent rounded-xl p-3 text-sm focus:border-[#FF8F9C] outline-none transition-all resize-none h-24 font-medium text-gray-700"
                />
             </div>

             {/* Image Upload */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-gray-900 uppercase tracking-widest">
                        Evidence 
                        {["Product Damaged", "Item Defective"].includes(reason) && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <span className="text-[10px] font-bold text-gray-400">{images.length} / 3 images</span>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {/* Upload Button */}
                    <label className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8F9C] hover:bg-[#FF8F9C]/5 transition-all group">
                        <FaCamera className="text-gray-300 group-hover:text-[#FF8F9C] text-xl mb-1" />
                        <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#FF8F9C] uppercase">Add</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    {/* Previews */}
                    {images.map((img, i) => (
                        <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 relative group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
             </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
             <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 text-sm">Cancel</button>
             <button 
                onClick={handleSubmit} 
                disabled={loading || uploading}
                className="flex-1 py-3.5 rounded-2xl font-black text-white bg-black hover:bg-gray-800 disabled:opacity-50 text-sm uppercase tracking-widest shadow-lg shadow-gray-200"
            >
                {loading ? "Submitting..." : "Submit Request"}
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReturnRequestModal;
