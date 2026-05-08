'use client';
import React, { useState,useEffect } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

// Define the assumed backend endpoint based on the previous files
const API_BASE_URL = 'http://localhost:8000/api/v1/auth/signup';

// Main App component which contains the entire signup page.
// We are exporting this as UserSignup, matching the router configuration.
const UserSignup = () => {
   

  // State to manage form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'female',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  // State to track if the user has successfully signed up
  const [isSignedUp, setIsSignedUp] = useState(false);
  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // New states for API interaction
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);



  // Handles input changes and updates the form data state
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    // Clear server error on input change
    if (serverError) setServerError(null);
  };

  // Toggles the visibility of the password field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggles the visibility of the confirm password field
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validates the form data and returns true if there are no errors
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name.';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter a phone number.';
    }
    if (!formData.password.trim()) {
      errors.password = 'Please enter a password.';
    }
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- MODIFIED: Handles the form submission and API call using Axios ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop if client-side validation fails
    }

    setIsLoading(true);
    setServerError(null); // Clear previous server errors

    try {
      // Prepare data for the backend
      const signupData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      // Make the POST request to the backend
      const response = await axios.post(API_BASE_URL, signupData);

      // Check for successful response status (201 Created)
      if (response.status === 201 && response.data.status === 'success') {
           localStorage.setItem('token', response.data.token);

        setIsSignedUp(true); // Show success view
      }
    } catch (error) {
      console.error('Signup API Error:', error);
          
      // Handle errors returned by the server (e.g., 400 validation, 409 conflict)
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.response && error.response.data && error.response.data.message) {
        // Use the detailed message from the backend controller
        errorMessage = error.response.data.message;
      } else if (error.request) {
        // Request was made but no response received (e.g., server down)
        errorMessage = 'Cannot connect to the backend service. Check server status.';
      }

      setServerError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };
  // --- END MODIFIED: handleSubmit ---

  // Handles the "OK" button click to navigate to the user home page
  const handleOkClick = () => {
    // Navigates to the user home page
    // Note: In a real app, this would use a router, but we use a simple window assignment here.
    window.location.assign('/user/home');
  };

  // Handles the Google sign-in click
  const handleGoogleSignIn = () => {
    console.log("Simulating Google Sign-In...");
    // You would add your actual Google authentication logic here,
    // for example, using Firebase Auth.
  };

  // If the user has signed up, show the success page
  if (isSignedUp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-[Inter]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-8.63" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="text-3xl font-bold mb-2">Success!</h2>
            <p className="text-white text-lg">Your account has been created successfully. Welcome home!</p>
          </div>
          {/* New "OK" button added here */}
          <button
            onClick={handleOkClick}
            className="mt-6 w-full py-3 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, show the signup form
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-[Inter]">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
          <p className="text-gray-500 mt-2">Join the community and discover amazing books!</p>
        </div>
        
        {/* Server Error Message Display */}
        {serverError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg" role="alert">
                <p className="font-bold">Signup Failed</p>
                <p>{serverError}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="name">
              Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

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

          {/* Phone Number Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              </div>
            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
          </div>

          {/* Gender Select */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
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

          {/* Confirm Password Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
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
                onClick={toggleConfirmPasswordVisibility}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showConfirmPassword ? (
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7a9.96 9.96 0 0 1 1.76.17m3.17 3.17a4 4 0 1 0-5.66-5.66M1 1l22 22" />
                  )}
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading} // Disable button while loading
            className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 focus:ring-emerald-500'
            }`}
          >
            {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing Up...</span>
                </div>
            ) : (
                'Sign Up'
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
          <p className="text-center font-semibold mx-4 mb-0">OR</p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-xl text-gray-800 font-semibold text-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 flex items-center justify-center space-x-2"
        >
          {/* Google 'G' Logo SVG */}
          <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.67 1.22 9.09 3.63L36.94 9c-3.14-2.88-7.58-4.5-12.94-4.5-8.52 0-15.72 6.13-17.65 14.28h6.46c1.78-4.43 6.07-7.6 11.19-7.6z"/>
            <path fill="#4285F4" d="M41.87 23.5c0-.98-.08-1.93-.2-2.87H24v5.49h10.98c-1.31 3.2-3.88 5.48-7.14 6.88v4.51h5.81c3.5-3.23 5.49-8.02 5.49-13.01z"/>
            <path fill="#FBBC05" d="M9.68 28.17c-1.31-3.2-1.31-7.16 0-10.36v-4.51H3.87C1.4 17.52 0 20.67 0 24c0 3.33 1.4 6.48 3.87 9.33l5.81-4.51z"/>
            <path fill="#34A853" d="M24 43.5c-4.92 0-9.2-2.73-11.49-6.88l-5.81 4.51c3.14 2.88 7.58 4.5 12.94 4.5 8.52 0 15.72-6.13 17.65-14.28h-6.46c-1.78 4.43-6.07 7.6-11.19 7.6z"/>
            <path d="M0 0h48v48H0z" fill="none"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 text-center text-gray-600">
          Already have an account? <a href="/user/login" className="text-emerald-600 font-semibold hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
