import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, UserRound } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";

export default function SellerLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let isValid = true;
    if (!formData.email) {
      toast.error("Email is required.", { theme: "colored" });
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email.", { theme: "colored" });
      isValid = false;
    }

    if (!formData.password) {
      toast.error("Password is required.", { theme: "colored" });
      isValid = false;
    } else if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.", { theme: "colored" });
      isValid = false;
    }
    return isValid;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const res = await axios.post(
      "http://localhost:8000/api/v1/sellers/login",
      formData
    );

    // 🔐 STORE SELLER TOKEN
    localStorage.setItem("sellerToken", res.data.token);

    toast.success("Login successful!", { theme: "colored" });

    setTimeout(() => navigate("/seller/dashboard"), 1000);
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Login failed",
      { theme: "colored" }
    );
  }
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
            "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1470&q=80')",
        }}
      >
      
        <div className="bg-white/95 shadow-xl rounded-2xl flex w-full max-w-3xl overflow-hidden">
          {/* Sidebar */}
          <div className="bg-emerald-500 p-6 flex flex-col items-center space-y-6 text-white">
            <UserRound size={22} className="hover:scale-110 transition" />
            <Lock size={22} className="hover:scale-110 transition" />
          </div>

          {/* Main Login Form */}
          <div className="flex-1 p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Seller Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  E-MAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border-b py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  PASSWORD
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border-b py-2 pr-10 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-6 flex items-center p-2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-emerald-500 text-white font-semibold py-2 rounded-full shadow-lg hover:opacity-90 transition"
              >
                LOGIN
              </button>
            </form>

            {/* Signup link */}
            <p className="text-center text-sm text-slate-600 mt-6">
              Don’t have an account?{" "}
              <Link
                to="/seller/signup"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
