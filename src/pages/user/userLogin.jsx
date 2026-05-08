'use client';
import React, { useState } from 'react';
import axios from 'axios';  
import { useInventory } from '../../context/InventoryContext.jsx';

const App = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { syncLocalDataWithServer } = useInventory();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Please enter your email address.';
    if (!formData.password.trim()) errors.password = 'Please enter your password.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    try {
      const res = await axios.post('https://pagify-g5g5.onrender.com/api/v1/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (res.status === 200 && res.data.status === 'success') {
        localStorage.setItem('token', res.data.token);
        
        // Sync local storage data with the server after login
        await syncLocalDataWithServer();

        window.location.assign('/user/home');
      } else {
  setErrorMessage('Invalid email or password.');
}

    } catch (err) {
      console.error('Login API error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Cannot connect to the backend service. Check server status.');
      }
    }
  };

 


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 mt-2">Log in to continue your journey.</p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-500 text-white py-3 px-4 rounded-xl text-center mb-4 transition-all duration-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7a9.96 9.96 0 0 1 1.76.17m3.17 3.17a4 4 0 1 0-5.66-5.66M1 1l22 22" />
                  )}
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          Don't have an account? <a href="/user/signup" className="text-emerald-600 font-semibold hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default App;
