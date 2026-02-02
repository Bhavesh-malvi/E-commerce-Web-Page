import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import API from "../../Api/Api.js";

import { FaEye, FaEyeSlash } from "react-icons/fa";


const UpdatePassword = () => {

  const { loading, user, forgotPassword } = useContext(AppContext);


  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");


  // Show / Hide
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);


  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* ================= Submit ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }


    try {

      const { data } = await API.put(
        "/auth/change-password",
        {
          oldPassword,
          newPassword,
        }
      );


      if (data.success) {

        setSuccess("Password updated successfully ✅");

        setOldPassword("");
        setNewPassword("");
      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Password update failed"
      );
    }
  };
  
  
    /* ================= Forgot ================= */
    const handleForgot = async () => {
  
      if(!user?.email) return;
  
      if(!window.confirm(`Send password reset link to ${user.email}?`)) return;
  
      setError("");
      setSuccess("");
  
      const res = await forgotPassword(user.email);
  
      if (res?.success) {
        setSuccess("Password reset link sent to your email 📩");
      } else {
        setError(res?.message || "Failed to send reset link");
      }
    };


  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow">


      <h2 className="text-xl font-semibold text-[#787878] mb-4">

        Change Password 🔐

      </h2>


      {/* Messages */}
      {error && (
        <p className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">
          {error}
        </p>
      )}

      {success && (
        <p className="bg-green-100 text-green-600 p-2 rounded mb-3 text-sm">
          {success}
        </p>
      )}


      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >


        {/* Old Password */}
        <div className="relative">

          <input
            type={showOld ? "text" : "password"}
            placeholder="Current password"
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(e.target.value)
            }
            className="w-full border p-2 pr-10 rounded focus:ring-2 focus:ring-[#FF8F9C]"
            required
          />


          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showOld ? <FaEyeSlash /> : <FaEye />}
          </button>

        </div>


        {/* New Password */}
        <div className="relative">

          <input
            type={showNew ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            className="w-full border p-2 pr-10 rounded focus:ring-2 focus:ring-[#FF8F9C]"
            required
          />


          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </button>

        </div>


        {/* Button */}
        <button
          disabled={loading}
          className="w-full bg-[#FF8F9C] text-white py-2 rounded hover:opacity-90"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </form>

      {/* Forgot Password Link */}
      <div className="mt-6 border-t pt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Forgot your current password?
        </p>
        <button
          type="button"
          onClick={handleForgot}
          className="text-[#FF8F9C] text-sm font-medium hover:underline"
        >
          Send Reset Link to Email
        </button>
      </div>

    </div>
  );
};

export default UpdatePassword;
