import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Auth = () => {

  const { setOpen, login, register, sendOtp, forgotPassword, loading } = useContext(AppContext);


  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: ""
  });

  const [isOtpSent, setIsOtpSent] = useState(false); // Track OTP status

  const [forgotEmail, setForgotEmail] = useState("");


  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Show / Hide Password
  const [showPassword, setShowPassword] = useState(false);


  /* ================= Change ================= */
  const handleChange = (e) => {

    setError("");
    setSuccess("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  /* ================= Submit ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister) {
      // REGISTER FLOW
      if (!isOtpSent) {
        // Step 1: Send OTP
        const res = await sendOtp(formData);
        
        if (res?.success) {
          setSuccess("OTP sent to your email 📩");
          setIsOtpSent(true);
        } else {
          setError(res?.message || "Failed to send OTP");
        }
      } else {
        // Step 2: Verify OTP & Register
        const res = await register(formData);

        if (res?.success) {
          setSuccess("Account created successfully ✅");
          setIsRegister(false);
          setIsOtpSent(false); // Reset OTP state
          setOpen(false);
        } else {
          setError(res?.message || "Registration failed");
        }
      }

    } else {
      // LOGIN FLOW
      const res = await login(
        formData.email,
        formData.password,
      );

      if (res?.success) {
        if (res.user.role === "admin") {
          navigate("/admin");
        }
        else if (res.user.role === "seller") {
          navigate("/seller");
        }
        else {
          navigate("/");
        }
        setOpen(false);
      } else {
        setError(res?.message || "Invalid email or password");
      }
    }
  };


  /* ================= Forgot ================= */
  const handleForgot = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const res = await forgotPassword(forgotEmail);

    if (res?.success) {
      setSuccess("Password reset link sent to email 📩");
      setIsForgot(false);
      setForgotEmail("");
    } else {
      setError(res?.message || "Email not found");
    }
  };


  return (
    <>
      <div
        className="w-full h-screen flex justify-center items-center bg-black/50 fixed top-0 left-0 z-200 overflow-y-auto py-10"
        onClick={() => setOpen(false)}
      >
        <div
          className="bg-white p-8 rounded-lg shadow-lg w-[340px] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <p className="text-2xl font-semibold mb-4 text-center">

            {isForgot
              ? "Forgot Password"
              : isRegister
              ? "Register"
              : "Login"}

          </p>


          {/* ================= Messages ================= */}
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


          {/* ================= Forms ================= */}
          {!isForgot ? (

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >

              {/* Name */}
              {isRegister && (
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border p-2 rounded-md"
                  required
                  disabled={isOtpSent} // Disable after OTP sent
                />
              )}


              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border p-2 rounded-md"
                required
                disabled={isRegister && isOtpSent} // Disable after OTP sent
              />


              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border p-2 pr-10 rounded-md"
                  required
                  disabled={isRegister && isOtpSent} // Disable after OTP sent
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  disabled={isRegister && isOtpSent}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* OTP Input (Only during Register & After OTP Sent) */}
              {isRegister && isOtpSent && (
                <input
                  type="number"
                  placeholder="Enter 6-digit OTP"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="border p-2 rounded-md font-bold tracking-widest text-center"
                  required
                />
              )}


              {/* Button */}
              <button
                disabled={loading}
                className="bg-[#FF8F9C] text-white p-2 rounded-md font-medium hover:opacity-90 transition"
              >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Please wait...
                    </div>
                ) : isRegister ? (
                    isOtpSent ? "Verified & Register" : "Send OTP"
                ) : (
                    "Login"
                )}
              </button>
              
              {/* Back to Edit (If OTP sent) */}
              {isRegister && isOtpSent && !loading && (
                 <button 
                  type="button"
                  onClick={() => { setIsOtpSent(false); setSuccess(""); setError(""); }}
                  className="text-gray-500 text-sm hover:underline"
                 >
                   Back to Edit Details
                 </button>
              )}

            </form>

          ) : (

            /* ================= Forgot Form ================= */
            <form
              onSubmit={handleForgot}
              className="flex flex-col gap-4"
            >

              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="border p-2 rounded-md"
                required
              />

              <button
                disabled={loading}
                className="bg-[#FF8F9C] text-white p-2 rounded-md font-medium"
              >
                {loading ? "Sending..." : "Send Link"}
              </button>

            </form>
          )}


          {/* ================= Links ================= */}
          {!isForgot && !isRegister && (
            <p
              onClick={() => {
                setIsForgot(true);
                setError("");
                setSuccess("");
              }}
              className="text-sm text-[#FF8F9C] cursor-pointer text-right mt-2"
            >
              Forgot Password?
            </p>
          )}


          <p className="text-center mt-4 text-sm">

            {isForgot ? (

              <span
                onClick={() => setIsForgot(false)}
                className="text-[#FF8F9C] cursor-pointer"
              >
                Back to Login
              </span>

            ) : isRegister ? (

              <>
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegister(false);
                    setIsOtpSent(false); // Reset
                    setError("");
                    setSuccess("");
                  }}
                  className="text-[#FF8F9C] cursor-pointer"
                >
                  Login
                </span>
              </>

            ) : (

              <>
                Don&apos;t have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegister(true);
                     setIsOtpSent(false); // Reset
                     setError("");
                     setSuccess("");
                  }}
                  className="text-[#FF8F9C] cursor-pointer"
                >
                  Register
                </span>
              </>
            )}

          </p>

        </div>
      </div>
    </>
  );
};

export default Auth;
