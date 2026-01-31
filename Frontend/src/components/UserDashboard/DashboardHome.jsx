/* eslint-disable react-hooks/set-state-in-effect */
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";


/* ================================
   Generate Color From Name
================================ */
const getRandomColor = (name = "") => {

  const colors = [
    "#FF8F9C",
    "#787878",
    "#6B7280",
    "#9CA3AF",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
  ];

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }

  return colors[hash % colors.length];
};



const DashboardHome = () => {

  const { user, updateProfile, loading } =
    useContext(AppContext);


  /* ================= States ================= */

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);


  /* ================= Sync User ================= */

  useEffect(() => {

    if (user) {

      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");

      // ✅ Handle both object & string avatar
      setPreview(
        user.avatar?.url || user.avatar || null
      );

    }

  }, [user]);


  /* ================= Image ================= */

  const handleImage = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };


  /* ================= Save ================= */

  const handleSave = async () => {

    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("phone", phone);

    if (avatar) data.append("avatar", avatar);


    const res = await updateProfile(data);

    if (res?.success) {

      setEditMode(false);
      setAvatar(null);

    }
  };


  /* ================= Cancel ================= */

  const handleCancel = () => {

    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");

    setPreview(
      user?.avatar?.url || user?.avatar || null
    );

    setAvatar(null);
    setEditMode(false);
  };


  if (!user) return null;


  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-xl relative">


      {/* Edit Button */}
      {!editMode && (
        <button
          onClick={() => setEditMode(true)}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#FF8F9C]"
        >
          <FaEdit size={18} />
        </button>
      )}


      {/* ================= Header ================= */}

      <div className="flex items-center gap-5 mb-6">


        {/* Avatar */}
        <div className="relative">

          <label className="cursor-pointer">

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImage}
              disabled={!editMode}
            />


            <div
              className="w-20 h-20 rounded-full border flex items-center justify-center overflow-hidden shadow"
              style={{
                backgroundColor:
                  !preview
                    ? getRandomColor(name)
                    : "transparent",
              }}
            >

              {/* Image */}
              {preview ? (

                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />

              ) : (

                <span className="text-white text-3xl font-bold">
                  {name?.charAt(0)?.toUpperCase()}
                </span>

              )}

            </div>

          </label>


          {editMode && (
            <p className="text-xs text-gray-400 text-center mt-1">
              Change
            </p>
          )}

        </div>


        {/* Info */}
        <div className="flex-1">


          {/* Name */}
          {editMode ? (

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-[#FF8F9C]"
              placeholder="Name"
            />

          ) : (

            <h2 className="text-xl font-semibold text-[#787878]">
              {user.name}
            </h2>

          )}


          {/* Email */}
          {editMode ? (

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-[#FF8F9C]"
              placeholder="Email"
            />

          ) : (

            <p className="text-gray-500">
              {user.email}
            </p>

          )}


          {/* Phone */}
          {editMode ? (

            <input
              value={phone}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  setPhone(e.target.value);
                }
              }}
              maxLength={10}
              className="border p-2 rounded w-full focus:ring-2 focus:ring-[#FF8F9C]"
              placeholder="Phone number"
            />

          ) : (

            <p className="text-gray-500 mt-1">
              {user.phone || "No phone added"}
            </p>

          )}

        </div>

      </div>


      {/* ================= Buttons ================= */}

      {editMode && (

        <div className="flex justify-end gap-3">


          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 border rounded text-gray-600 hover:bg-gray-100"
          >
            <FaTimes className="inline mr-1" />
            Cancel
          </button>


          {/* Save */}
          <button
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#FF8F9C] text-white rounded hover:opacity-90"
          >
            <FaSave className="inline mr-1" />

            {loading ? "Saving..." : "Save"}

          </button>

        </div>
      )}


      {/* Info Text */}
      {!editMode && (

        <p className="text-gray-600 max-w-md leading-relaxed">

          From your dashboard you can view your recent orders,
          manage addresses and edit account details.

        </p>
      )}

    </div>
  );
};

export default DashboardHome;
