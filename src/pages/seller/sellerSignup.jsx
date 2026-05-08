import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserRound, Building, CreditCard, Settings, Eye, EyeOff, RefreshCw, Camera } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";

export default function SellerSignup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    phone: "",
    companyName: "",
    companyAddress: "",
    gstNumber: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upi: "",
    notifications: true,
    smsAlerts: false,
    emailAlerts: true,
    theme: "light",
    language: "english",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(URL.createObjectURL(file));
      setProfilePicFile(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    let isValid = true;
    if (activeTab === "profile") {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
        toast.error("Please fill all required fields.", { theme: "colored" });
        isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!", { theme: "colored" });
        isValid = false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters.", { theme: "colored" });
        isValid = false;
      }
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        toast.error("Phone number must be 10 digits.", { theme: "colored" });
        isValid = false;
      }
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    if (profilePicFile) fd.append("profilePicture", profilePicFile);
    await axios.post("https://pagify-g5g5.onrender.com/api/v1/sellers/signup", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    toast.success("Signup successful! Please login.", { theme: "colored" });
    setTimeout(() => navigate("/seller/login"), 1500);
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Signup failed",
      { theme: "colored" }
    );
  }
};


  const handleTabChange = (tab) => {
    if (activeTab === "profile" && !validateForm()) {
      return;
    }
    setActiveTab(tab);
  };

  return (
    <>
      <style>
        {`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
        .Toastify__toast-container {
          padding: 10px;
        }
        .Toastify__toast {
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .Toastify__toast--success {
          background-color: #10B981;
        }
        .Toastify__toast--error {
          background-color: #EF4444;
        }
        .Toastify__toast--info {
          background-color: #3B82F6;
        }
        .Toastify__toast-theme--colored .Toastify__toast--success {
          background-color: #10B981;
        }
        .Toastify__toast-theme--colored .Toastify__toast--error {
          background-color: #EF4444;
        }
        .Toastify__toast-theme--colored .Toastify__toast--info {
          background-color: #3B82F6;
        }
        `}
      </style>
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="bg-white/95 shadow-xl rounded-2xl flex w-full max-w-5xl overflow-hidden">
          {/* Sidebar */}
          <div className="bg-emerald-500 p-6 flex flex-col items-center space-y-6 text-white">
            {[
              { id: "profile", icon: <UserRound size={22} />, label: "Profile" },
              { id: "company", icon: <Building size={22} />, label: "Company" },
              { id: "payment", icon: <CreditCard size={22} />, label: "Payment" },
              { id: "settings", icon: <Settings size={22} />, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`p-2 rounded-full transition ${
                  activeTab === item.id
                    ? "bg-white text-emerald-600"
                    : "hover:bg-emerald-400"
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Seller Signup
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Section */}
              {activeTab === "profile" && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        USER NAME
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        E-MAIL
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        PASSWORD
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Create a password"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-8 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        CONFIRM PASSWORD
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-8 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        LOCATION
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="Enter your location"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        PHONE
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleTabChange("company")}
                      className="bg-emerald-500 text-white px-6 py-2 rounded-full shadow hover:opacity-90"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* Company Section */}
              {activeTab === "company" && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        COMPANY NAME
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your company name"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        COMPANY ADDRESS
                      </label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        required
                        placeholder="Enter your company address"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        GST NUMBER
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="Enter GST Number"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => handleTabChange("profile")}
                      className="bg-gray-400 text-white px-6 py-2 rounded-full hover:opacity-90"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("payment")}
                      className="bg-emerald-500 text-white px-6 py-2 rounded-full shadow hover:opacity-90"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* Payment Section */}
              {activeTab === "payment" && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        BANK NAME
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your bank name"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        ACCOUNT NUMBER
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                        placeholder="Enter your account number"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        IFSC CODE
                      </label>
                      <input
                        type="text"
                        name="ifsc"
                        value={formData.ifsc}
                        onChange={handleChange}
                        required
                        placeholder="Enter IFSC code"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        name="upi"
                        value={formData.upi}
                        onChange={handleChange}
                        placeholder="Enter UPI ID"
                        className="w-full border-b border-slate-300 focus:border-emerald-500 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => handleTabChange("company")}
                      className="bg-gray-400 text-white px-6 py-2 rounded-full hover:opacity-90"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("settings")}
                      className="bg-emerald-500 text-white px-6 py-2 rounded-full shadow hover:opacity-90"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* Settings Section */}
              {activeTab === "settings" && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="notifications"
                        checked={formData.notifications}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <label className="text-sm text-slate-600">
                        Enable Push Notifications
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="smsAlerts"
                        checked={formData.smsAlerts}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <label className="text-sm text-slate-600">
                        Enable SMS Alerts
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="emailAlerts"
                        checked={formData.emailAlerts}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <label className="text-sm text-slate-600">
                        Enable Email Alerts
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        THEME
                      </label>
                      <select
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        className="border border-slate-300 rounded p-2 w-full"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        LANGUAGE
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="border border-slate-300 rounded p-2 w-full"
                      >
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                        <option value="bengali">Bengali</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={() => handleTabChange("payment")}
                      className="bg-gray-400 text-white px-6 py-2 rounded-full hover:opacity-90"
                    >
                      ← Previous
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-500 text-white font-semibold py-2 px-8 rounded-full shadow-lg hover:opacity-90"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center p-6">
            <div className="relative w-28 h-28 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                "Seller"
              )}
              <label className="absolute bottom-1 right-1 bg-black/60 text-white rounded-full p-2 shadow cursor-pointer border border-white" title="Change photo">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Camera className="h-4 w-4" />
              </label>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}