'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInventory } from "../../context/InventoryContext.jsx";

/**
 * CustomerSettings.jsx
 * - Same UI/behavior as you posted, now with Axios calls to your backend.
 * - Maps customerName <-> name for the backend.
 */

const API_BASE = 'https://pagify-g5g5.onrender.com/api/v1';

// --- Custom Toast Component (unchanged, just reused) ---
function Toast({ message, isVisible, type, onClose }) {
  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 z-50";
  let colorClasses = "";

  switch (type) {
    case 'success':
      colorClasses = "bg-emerald-500";
      break;
    case 'error':
      colorClasses = "bg-red-500";
      break;
    default:
      colorClasses = "bg-gray-700";
  }

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      {message}
      <button className="ml-4 font-bold" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}

export default function CustomerSettings() {
  const { theme: globalTheme, updateTheme } = useInventory();
  // Page + theme control
  const [activePage, setActivePage] = useState("Settings");
  const [darkMode, setDarkMode] = useState(globalTheme === "dark");

  // Settings UI state
  const [settingsTab, setSettingsTab] = useState("General");
  const [appearance, setAppearance] = useState(globalTheme === "dark" ? "Dark" : "Light");

  // Update local darkMode when global theme changes
  useEffect(() => {
    setDarkMode(globalTheme === "dark");
    setAppearance(globalTheme === "dark" ? "Dark" : "Light");
  }, [globalTheme]);

  // Customer profile state
  const [customerProfile, setCustomerProfile] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    ifscCode: "",
    bankAccount: "",
    gender: "female",
  });

  // Security state
  const [securityState, setSecurityState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFA: false,
  });

  // Notifications & integrations states (same as before)
  const [notificationsState, setNotificationsState] = useState({
    newOrders: true,
    newReviews: false,
    lowStock: true,
    securityAlerts: true,
  });

  const [integrationsState, setIntegrationsState] = useState({
    stripe: false,
    paypal: false,
    square: false,
    ga: false,
    mailchimp: false,
    slack: false,
  });

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const themeStyles = {
    Light: { bg: "bg-white", border: "border-gray-200" },
    Dark: { bg: "bg-gray-900", border: "border-gray-700" },
    Auto: { bg: "bg-white", border: "border-gray-200" },
  };

  const closeToast = () => setToast((s) => ({ ...s, isVisible: false }));

  // ========= Helpers =========
  const getToken = () => localStorage.getItem('token');

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const showSuccess = (msg) =>
    setToast({ isVisible: true, message: msg, type: 'success' });

  const showError = (msg) =>
    setToast({ isVisible: true, message: msg || 'Something went wrong', type: 'error' });

  // ========= Load current profile on mount =========
  useEffect(() => {
    const token = getToken();
    if (!token) {
      showError('Please log in again to view your profile.');
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/me`, { headers: authHeaders() });
        if (res.data?.status === 'success' && res.data.user) {
          const u = res.data.user;
          setCustomerProfile({
            customerName: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
            ifscCode: u.ifscCode || "",
            bankAccount: u.bankAccount || "",
            gender: u.gender || "female",
          });
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        showError(err?.response?.data?.message || 'Failed to load profile');
      }
    })();
  }, []);

  // ========= General Save =========
  async function handleSaveGeneral(profile) {
    const token = getToken();
    if (!token) {
      showError('Please log in again.');
      return;
    }

    // map front-end keys -> backend
    const payload = {
      name: profile.customerName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      bankAccount: profile.bankAccount,
      ifscCode: profile.ifscCode,
      gender: profile.gender || 'female',
    };

    try {
      const res = await axios.patch(`${API_BASE}/users/me`, payload, { headers: authHeaders() });
      if (res.data?.status === 'success') {
        // reflect any normalized values returned by backend
        const u = res.data.user;
        setCustomerProfile((s) => ({
          ...s,
          customerName: u.name || s.customerName,
          email: u.email || s.email,
          phone: u.phone || s.phone,
          address: u.address || s.address,
          bankAccount: u.bankAccount || s.bankAccount,
          ifscCode: u.ifscCode || s.ifscCode,
          gender: u.gender || s.gender,
        }));
        showSuccess('✅ Profile Changes Saved Successfully!');
      } else {
        showError('Failed to save changes');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      showError(err?.response?.data?.message || 'Failed to save changes');
    }
  }

  // ========= Change Password =========
  async function handleUpdatePassword() {
    const token = getToken();
    if (!token) {
      showError('Please log in again.');
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = securityState;
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill all password fields');
      return;
    }

    try {
      const res = await axios.patch(
        `${API_BASE}/users/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: authHeaders() }
      );
      if (res.data?.status === 'success') {
        showSuccess('✅ Password updated successfully');
        // clear fields
        setSecurityState((s) => ({
          ...s,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        showError(res.data?.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      showError(err?.response?.data?.message || 'Failed to update password');
    }
  }

  function toggleNotification(key) {
    setNotificationsState((s) => ({ ...s, [key]: !s[key] }));
  }

  function toggleIntegration(key) {
    setIntegrationsState((s) => ({ ...s, [key]: !s[key] }));
  }

  function handleAppearanceSave() {
    const newTheme = appearance === "Dark" ? "dark" : "light";
    updateTheme(newTheme);
    setDarkMode(newTheme === "dark");
  }

  // ========= Render =========
  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {activePage === "Settings" && (
        <section
          className={`mx-auto max-w-6xl p-6 rounded-xl shadow-2xl ${darkMode ? "bg-gray-800 shadow-gray-700/50" : "bg-white shadow-xl"}`}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left Nav */}
            <div
              className={`w-full lg:w-56 pr-0 lg:pr-6 mb-6 lg:mb-0 border-b lg:border-b-0 lg:border-r ${darkMode ? "border-gray-700" : "border-gray-200"} lg:sticky lg:top-0`}
            >
              <a
                href="/user/home"
                className={`w-full text-center px-4 py-2 mb-6 rounded-md inline-flex justify-center items-center text-lg font-bold transition-colors duration-200 ${
                  darkMode
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg"
                }`}
              >
                ← Back to Home
              </a>

              <h2 className="text-3xl font-Semibold mb-4 text-black-500">
                Customer Settings
              </h2>
              {["General", "Security", "Notifications", "Appearance", "Integrations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-md mb-2 transition-colors duration-200 ${
                    settingsTab === tab
                      ? "bg-emerald-600 text-white font-semibold shadow-md"
                      : darkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right content */}
            <div className="flex-1 lg:pl-6">
              {/* General */}
              {settingsTab === "General" && (
                <div>
                  <h3 className="text-2xl font-semibold mb-3">General Profile</h3>
                  <p className="mb-6 opacity-70">
                    Update your basic account information, contact details, and banking particulars.
                  </p>
                  <div className="space-y-4">
                    {/* Customer Name */}
                    <label className="block">
                      <span className="font-medium">Customer Name</span>
                      <input
                        className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                        }`}
                        placeholder="Full Name"
                        value={customerProfile.customerName}
                        onChange={(e) =>
                          setCustomerProfile((s) => ({ ...s, customerName: e.target.value }))
                        }
                      />
                    </label>

                    {/* Email */}
                    <label className="block">
                      <span className="font-medium">Contact Email</span>
                      <input
                        className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                        }`}
                        placeholder="Contact Email"
                        value={customerProfile.email}
                        onChange={(e) =>
                          setCustomerProfile((s) => ({ ...s, email: e.target.value }))
                        }
                      />
                    </label>

                    {/* Phone */}
                    <label className="block">
                      <span className="font-medium">Phone Number</span>
                      <input
                        className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                        }`}
                        placeholder="Phone"
                        value={customerProfile.phone}
                        onChange={(e) =>
                          setCustomerProfile((s) => ({ ...s, phone: e.target.value }))
                        }
                      />
                    </label>

                    {/* Address */}
                    <label className="block">
                      <span className="font-medium">House Address</span>
                      <input
                        className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                        }`}
                        placeholder="Address"
                        value={customerProfile.address}
                        onChange={(e) =>
                          setCustomerProfile((s) => ({ ...s, address: e.target.value }))
                        }
                      />
                    </label>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Bank Account */}
                      <label className="block flex-1">
                        <span className="font-medium">Bank Account Number</span>
                        <input
                          className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                          }`}
                          placeholder="Bank Account"
                          value={customerProfile.bankAccount}
                          onChange={(e) =>
                            setCustomerProfile((s) => ({ ...s, bankAccount: e.target.value }))
                          }
                        />
                      </label>

                      {/* IFSC */}
                      <label className="block flex-1">
                        <span className="font-medium">IFSC Code (Bank Identifier)</span>
                        <input
                          className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                            darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                          }`}
                          placeholder="IFSC Code"
                          value={customerProfile.ifscCode}
                          onChange={(e) =>
                            setCustomerProfile((s) => ({ ...s, ifscCode: e.target.value }))
                          }
                        />
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() =>
                          handleSaveGeneral({
                            customerName: customerProfile.customerName,
                            email: customerProfile.email,
                            phone: customerProfile.phone,
                            address: customerProfile.address,
                            bankAccount: customerProfile.bankAccount,
                            ifscCode: customerProfile.ifscCode,
                            gender: customerProfile.gender,
                          })
                        }
                        className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition duration-200 shadow-lg"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {settingsTab === "Security" && (
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Password</h3>
                  <div className="space-y-4 mb-6">
                    <input
                      type="password"
                      placeholder="Current password"
                      className={`w-full md:w-2/3 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                      }`}
                      value={securityState.currentPassword}
                      onChange={(e) =>
                        setSecurityState((s) => ({ ...s, currentPassword: e.target.value }))
                      }
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className={`w-full md:w-2/3 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                      }`}
                      value={securityState.newPassword}
                      onChange={(e) =>
                        setSecurityState((s) => ({ ...s, newPassword: e.target.value }))
                      }
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className={`w-full md:w-2/3 px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
                      }`}
                      value={securityState.confirmPassword}
                      onChange={(e) =>
                        setSecurityState((s) => ({ ...s, confirmPassword: e.target.value }))
                      }
                    />
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleUpdatePassword}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition duration-200 shadow-lg"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">Two-Factor Authentication</h3>
                  <div
                    className={`border rounded-xl p-4 mb-6 flex justify-between items-center ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div>
                      <p className="font-medium">Enable Two-Factor Authentication (2FA)</p>
                      <p className="text-sm opacity-70">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securityState.twoFA}
                        onChange={() =>
                          setSecurityState((s) => ({ ...s, twoFA: !s.twoFA }))
                        }
                      />
                      <div className={`w-11 h-6 ${securityState.twoFA ? 'bg-emerald-600' : 'bg-gray-200'} rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500`}></div>
                      <span className={`ms-3 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {securityState.twoFA ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-3 text-red-500">
                      Account Deletion
                    </h3>
                    <p className="mb-4 opacity-70">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <button className="px-6 py-3 border border-red-500 text-red-500 rounded-full font-semibold hover:bg-red-50 transition duration-200 shadow-sm hover:shadow-md">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {settingsTab === "Notifications" && (
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Email Notifications</h3>
                  <div className="space-y-4 mb-8">
                    {[
                      {
                        key: "newOrders",
                        title: "Order Status Updates",
                        desc: "Receive notifications when your order status changes (e.g., shipped, delivered)",
                      },
                      {
                        key: "newReviews",
                        title: "Promotional Emails",
                        desc: "Receive notifications about new products and special offers",
                      },
                      {
                        key: "lowStock",
                        title: "Account Statements",
                        desc: "Receive periodic statements or billing information",
                      },
                    ].map((n) => (
                      <div
                        key={n.key}
                        className={`p-4 border rounded-xl flex justify-between items-center ${
                          darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{n.title}</div>
                          <div className="text-sm opacity-70">{n.desc}</div>
                        </div>
                        <button
                          onClick={() => toggleNotification(n.key)}
                          className={`px-4 py-1.5 rounded-full font-semibold transition-colors duration-200 shadow-md min-w-[70px] ${
                            notificationsState[n.key]
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {notificationsState[n.key] ? "On" : "Off"}
                        </button>
                      </div>
                    ))}

                    <h3 className="text-xl font-semibold mt-8 mb-3 border-t pt-6">
                      System Notifications
                    </h3>
                    <div className="space-y-3">
                      <div
                        className={`p-4 border rounded-xl flex justify-between items-center ${
                          darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium">Security Alerts</div>
                          <div className="text-sm opacity-70">
                            Receive immediate notifications about security issues
                          </div>
                        </div>
                        <button
                          onClick={() => toggleNotification("securityAlerts")}
                          className={`px-4 py-1.5 rounded-full font-semibold transition-colors duration-200 shadow-md min-w-[70px] ${
                            notificationsState.securityAlerts
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {notificationsState.securityAlerts ? "On" : "Off"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {settingsTab === "Appearance" && (
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Theme Settings</h3>
                  <p className="mb-6 opacity-70">
                    Customize the look and feel of your interface.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {[
                      { key: "Light", title: "Light", color: "bg-white", text: "text-gray-800" },
                      { key: "Dark", title: "Dark", color: "bg-gray-900", text: "text-white" },
                      { key: "Auto", title: "Auto", color: "bg-gray-500", text: "text-white" },
                    ].map((t) => (
                      <div
                        key={t.key}
                        onClick={() => setAppearance(t.key)}
                        className={`p-2 border-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          appearance === t.key
                            ? "border-emerald-500 ring-4 ring-emerald-200 shadow-xl"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`h-24 w-full rounded-lg mb-3 shadow-md border ${t.color} ${t.text} flex items-center justify-center`}
                        >
                          <span className="font-bold text-xl">{t.title}</span>
                        </div>
                        <div className="font-medium text-center text-lg">{t.title}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleAppearanceSave}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition duration-200 shadow-lg"
                    >
                      Apply Appearance
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {settingsTab === "Integrations" && (
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Financial Links</h3>
                  <p className="mb-6 opacity-70">
                    Connect or disconnect financial services used for payments and refunds.
                  </p>
                  <div className="space-y-4 mb-8">
                    {[
                      { key: "stripe", label: "Stripe Wallet" },
                      { key: "paypal", label: "PayPal" },
                      { key: "square", label: "Apple/Google Pay" },
                    ].map((it) => (
                      <div
                        key={it.key}
                        className={`p-4 border rounded-xl flex justify-between items-center ${
                          darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{it.label}</div>
                          <div className="text-sm opacity-70">
                            {integrationsState[it.key] ? "Connected" : "Not connected"}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleIntegration(it.key)}
                          className={`px-4 py-1.5 rounded-full font-semibold transition-colors duration-200 shadow-md ${
                            integrationsState[it.key]
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {integrationsState[it.key] ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mb-3 border-t pt-6">Service Connections</h3>
                  <p className="mb-6 opacity-70">Link other helpful services to your account.</p>
                  <div className="space-y-4">
                    {[
                      { key: "ga", label: "Shopping History Sync" },
                      { key: "mailchimp", label: "Loyalty Program" },
                      { key: "slack", label: "Support Chat" },
                    ].map((it) => (
                      <div
                        key={it.key}
                        className={`p-4 border rounded-xl flex justify-between items-center ${
                          darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{it.label}</div>
                          <div className="text-sm opacity-70">
                            {integrationsState[it.key] ? "Connected" : "Not connected"}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleIntegration(it.key)}
                          className={`px-4 py-1.5 rounded-full font-semibold transition-colors duration-200 shadow-md ${
                            integrationsState[it.key]
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {integrationsState[it.key] ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}
