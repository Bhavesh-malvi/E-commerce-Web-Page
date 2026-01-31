import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";

const BecomeSeller = () => {

  const { applySeller, loading } = useContext(AppContext);


  /* ================= States ================= */

  const [form, setForm] = useState({

    shopName: "",
    gstNumber: "",

    phone: "",

    street: "",
    city: "",
    state: "",
    pincode: ""

  });


  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");



  /* ================= Change ================= */

  const handleChange = (e) => {

    setError("");
    setSuccess("");

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };



  /* ================= Submit ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    const data = {

      shopName: form.shopName,

      gstNumber: form.gstNumber,

      phone: form.phone,

      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode
      }

    };


    const res = await applySeller(data);


    if (res?.success) {

      setSuccess("Request sent for approval ✅");

      setForm({
        shopName: "",
        gstNumber: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: ""
      });

    } else {

      setError(res?.message || "Request failed");

    }
  };



  /* ================= Waiting Screen ================= */

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 shadow rounded text-center">

        <h2 className="text-xl font-bold text-[#787878] mb-2">
          Application Submitted 🎉
        </h2>

        <p className="text-gray-600 mb-3">
          Your seller request is under review.
        </p>

        <p className="text-[#FF8F9C] font-medium">
          Waiting for admin approval ⏳
        </p>

      </div>
    );
  }



  /* ================= Main Form ================= */

  return (
    <div className="max-w-lg bg-white p-6 shadow rounded">


      <h2 className="text-xl font-bold mb-4 text-[#787878]">
        Become a Seller
      </h2>


      {/* Messages */}
      {error && (
        <p className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
          {error}
        </p>
      )}



      <form onSubmit={handleSubmit} className="space-y-3">


        {/* Shop Name */}
        <input
          type="text"
          name="shopName"
          placeholder="Shop Name"
          value={form.shopName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />


        {/* GST */}
        <input
          type="text"
          name="gstNumber"
          placeholder="GST Number (Optional)"
          value={form.gstNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />


        {/* Phone */}
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          maxLength={10}
          className="w-full border p-2 rounded"
          required
        />


        {/* Address */}
        <input
          type="text"
          name="street"
          placeholder="Street Address"
          value={form.street}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />


        <div className="flex gap-2">

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

        </div>


        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          maxLength={6}
          className="w-full border p-2 rounded"
          required
        />


        {/* Button */}
        <button
          disabled={loading}
          className="w-full bg-[#FF8F9C] text-white py-2 rounded hover:opacity-90 transition"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>

      </form>

    </div>
  );
};

export default BecomeSeller;
