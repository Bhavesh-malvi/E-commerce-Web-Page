import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import API from "../../Api/Api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";


const UpdatePassword = ({ token }) => {

  const { loading, user, forgotPassword } = useContext(AppContext);
  const navigate = useNavigate();


  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // For reset mode


  // Show / Hide
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localLoading, setLocalLoading] = useState(false);


  /* ================= Submit ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (token && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLocalLoading(true);


    try {

      let data;

      if (token) {
        // Reset Password Mode
        const res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/auth/password/reset/${token}`,
          { password: newPassword }
        );
        data = res.data;
      } else {
        // Update Password Mode (Authenticated)
        const res = await API.put("/auth/change-password", {
          oldPassword,
          newPassword,
        });
        data = res.data;
      }


      if (data.success) {

        setSuccess(token ? "Password reset successfully! Redirecting..." : "Password updated successfully ✅");

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        if (token) {
          setTimeout(() => {
             // Open login popup or redirect to home where login popup might open
             // For now just redirect home
             navigate("/");
          }, 2000);
        }
      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        (token ? "Reset failed" : "Password update failed")
      );
    } finally {
      setLocalLoading(false);
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

        {token ? "Reset Password 🔐" : "Change Password 🔐"}

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


        {/* Old Password - Hide if Token exists */}
        {!token && (
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
        )}


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

        {/* Confirm Password - Only for Reset Mode */}
        {token && (
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 pr-10 rounded focus:ring-2 focus:ring-[#FF8F9C]"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        )}


        {/* Button */}
        <button
          disabled={loading || localLoading}
          className="w-full bg-[#FF8F9C] text-white py-2 rounded hover:opacity-90"
        >
          {localLoading || loading ? (token ? "Resetting..." : "Updating...") : (token ? "Reset Password" : "Update Password")}
        </button>

      </form>

      {/* Forgot Password Link - Hide in Reset Mode */}
      {!token && (
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
      )}

    </div>
  );
};

export default UpdatePassword;
