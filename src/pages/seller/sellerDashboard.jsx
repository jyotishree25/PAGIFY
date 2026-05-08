// SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lightTheme from "../../assets/sellerLight.png";
import darkTheme from "../../assets/sellerDark.png";
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  Home,
  BookOpen,
  ShoppingCart,
  Tag,
  Star,
  HelpCircle,
  Settings,
  Edit,
  Trash2,
  Mail,
  Phone,
  MessageSquare,
  LogOut,
  Twitter,
  CreditCard,
  Banknote,
  Info,
  Camera,
  X,
} from "lucide-react";

export default function SellerDashboard() {
  // Layout + UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Home");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Seller profile (used in header profile popup + company page)
  const [sellerProfile, setSellerProfile] = useState({
    name: "Seller",
    companyName: "PaGify",
    gstNumber: "",
    bankAccount: "",
    email: "",
    phone: "",
    address: "",
  });

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Company page modal (pagify)
  const [showCompanyPage, setShowCompanyPage] = useState(false);
  const [companyEdit, setCompanyEdit] = useState({ ...sellerProfile });

  // Discounts
  const [discounts, setDiscounts] = useState([
    { code: "NEWYEAR25", percent: "25%", expiry: "2025-12-31", active: true },
    { code: "BOOKLOVER10", percent: "10%", expiry: "2025-10-30", active: true },
    { code: "OLD50", percent: "50%", expiry: "2023-01-01", active: false },
  ]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    percent: "",
    expiry: "",
    active: true,
  });
  const [discountFilter, setDiscountFilter] = useState("All"); // All | Active | Inactive

  const [showEditDiscountModal, setShowEditDiscountModal] = useState(false);
  const [editDiscountIndex, setEditDiscountIndex] = useState(null);
  const [editDiscountData, setEditDiscountData] = useState({
    code: "",
    percent: "",
    expiry: "",
    active: true,
  });

  // Books (products) as state so delete/edit works
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    growth: 0
  });
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // Edit product modal
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProductIndex, setEditProductIndex] = useState(null);
  const [editProductData, setEditProductData] = useState({
    title: "",
    author: "",
    price: "",
    stock: 0,
    status: "Active",
  });

useEffect(() => {
  const fetchSellerProfile = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        navigate("/seller/login");
        return;
      }
      const res = await axios.get("https://pagify-g5g5.onrender.com/api/v1/sellers/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        setSellerProfile(res.data.seller);
        setCompanyEdit(res.data.seller);
      }
    } catch (err) {
      console.error("Failed to load seller profile", err);
      navigate("/seller/login");
    }
  };

  fetchSellerProfile();
}, [navigate]);

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) return;

      // Fetch stats
      const statsRes = await axios.get("https://pagify-g5g5.onrender.com/api/v1/sellers/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.status === "success") {
        setDashboardStats(statsRes.data.stats);
      }

      // Fetch orders (existing logic could be updated to fetch from backend too)
      const ordersRes = await axios.get("https://pagify-g5g5.onrender.com/api/v1/orders/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.data.status === "success") {
        const currentSellerId = sellerProfile._id || sellerProfile.id;
        if (!currentSellerId) return; // Wait for profile

        const myOrders = ordersRes.data.orders.filter(order => {
          return order.items.some(item => {
            const itemSellerId = item.sellerId?._id || item.sellerId;
            return String(itemSellerId) === String(currentSellerId);
          });
        }).map(order => {
          const myItems = order.items.filter(item => {
            const itemSellerId = item.sellerId?._id || item.sellerId;
            return String(itemSellerId) === String(currentSellerId);
          });
          const myTotal = myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          return {
            ...order,
            id: order._id.toString().slice(-8).toUpperCase(),
            customer: order.customerDetails?.name || order.user?.name || "Customer",
            total: `₹${myTotal.toFixed(2)}`,
            book: myItems[0]?.title || "Products",
            qty: myItems.reduce((sum, item) => sum + item.quantity, 0)
          };
        });

        // Add legacy localStorage orders if they belong to this seller
        const allLocalOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
        const myLocalOrders = allLocalOrders.filter(order => {
          return order.items && order.items.some(item => {
            const itemSellerId = item.sellerId?._id || item.sellerId;
            return String(itemSellerId) === String(currentSellerId);
          });
        }).map(order => {
           const myItems = order.items.filter(item => {
             const itemSellerId = item.sellerId?._id || item.sellerId;
             return String(itemSellerId) === String(currentSellerId);
           });
           const myTotal = myItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
           return {
             ...order,
             id: order.id || `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
             customer: order.customer || "Local Customer",
             total: `₹${myTotal.toFixed(2)}`,
             book: myItems[0]?.title || "Products",
             qty: myItems.reduce((sum, item) => sum + item.quantity, 0)
           };
        });

        // Combine both sources, ensuring no duplicates by ID
        const combinedOrders = [...myOrders];
        myLocalOrders.forEach(localOrder => {
          if (!combinedOrders.find(o => o.id === localOrder.id)) {
            combinedOrders.push(localOrder);
          }
        });

        setOrders(combinedOrders);

        // Update stats based on combined data for consistency
        setDashboardStats(prev => ({
          ...prev,
          totalOrders: combinedOrders.length,
          totalRevenue: combinedOrders.reduce((sum, o) => {
            const val = parseFloat(o.total?.replace('₹', '') || 0);
            return sum + (isNaN(val) ? 0 : val);
          }, 0)
        }));
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  if (activePage === "Home" || activePage === "Orders") {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }
}, [activePage, sellerProfile]);

useEffect(() => {
  async function fetchSellerProducts() {
    try {
      const token = localStorage.getItem("sellerToken");

      const res = await axios.get(
        "https://pagify-g5g5.onrender.com/api/v1/sellers/products/my-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const list = Array.isArray(res.data) ? res.data : res.data.products || [];
      setBooks(list);
    } catch (err) {
      console.error("Failed to load seller products", err);
    }
  }

  if (activePage === "Products") {
    fetchSellerProducts();
  }
}, [activePage]);

// Payments
  const [payments, setPayments] = useState([
    { id: "PAY001", date: "2025-09-01", description: "Monthly Payout", amount: "1500.00", status: "Completed" },
    { id: "PAY002", date: "2025-08-01", description: "Monthly Payout", amount: "850.00", status: "Completed" },
    { id: "PAY003", date: "2025-10-01", description: "Upcoming Payout", amount: "1800.00", status: "Pending" },
  ]);
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [bankDetailsEdit, setBankDetailsEdit] = useState({
    bankAccount: sellerProfile.bankAccount,
    gstNumber: sellerProfile.gstNumber,
  });

  // Sales data for graph
  const [salesData] = useState([
    { month: "Jan", sales: 400 },
    { month: "Feb", sales: 600 },
    { month: "Mar", sales: 800 },
    { month: "Apr", sales: 1500 },
    { month: "May", sales: 1200 },
    { month: "Jun", sales: 2000 },
  ]);

  // Settings & integrations & notifications & security
  const [settingsTab, setSettingsTab] = useState("General");
  const [appearance, setAppearance] = useState("Light"); // Light | Dark | Auto
  const [layout, setLayout] = useState("Default"); // Default | Grid
  const [integrationsState, setIntegrationsState] = useState({
    stripe: true,
    paypal: true,
    square: false,
    ga: true,
    mailchimp: false,
    slack: false,
  });
  const [notificationsState, setNotificationsState] = useState({
    newOrders: true,
    newReviews: false,
    newUsers: false,
    lowStock: true,
    systemUpdates: false,
    securityAlerts: true,
  });
  const [securityState, setSecurityState] = useState({
    twoFA: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Mock saved password (for update flow)
  const [savedPassword, setSavedPassword] = useState("password123");

  // Support form modal
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState({
    partnerId: "",
    domain: "Orders",
    message: "",
  });

  // Derived
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { label: "Home", icon: <Home size={18} /> },
    { label: "Products", icon: <BookOpen size={18} /> },
    { label: "Orders", icon: <ShoppingCart size={18} /> },
    { label: "Payments", icon: <CreditCard size={18} /> },
    { label: "Discounts", icon: <Tag size={18} /> },
    { label: "Reviews", icon: <Star size={18} /> },
    { label: "Support", icon: <HelpCircle size={18} /> },
    { label: "Settings", icon: <Settings size={18} /> },
  ];


  useEffect(() => {
  const token = localStorage.getItem("sellerToken");

  // 1️⃣ No token → redirect to seller login
  if (!token) {
    navigate("/seller/login");
    return;
  }

  // 2️⃣ Verify token with backend
  axios
    .get("https://pagify-g5g5.onrender.com/api/v1/sellers/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setSellerProfile((prev) => ({
        ...prev,
        ...res.data.seller,
      }));
    })
    .catch(() => {
      localStorage.removeItem("sellerToken");
      navigate("/seller/login");
    });
}, [navigate]);

  // ----------------------------
  // Effects
  // Appearance controls darkMode now
  useEffect(() => {
    if (appearance === "Light") setDarkMode(false);
    else if (appearance === "Dark") setDarkMode(true);
    else if (appearance === "Auto") {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(!!prefersDark);
    }
  }, [appearance]);

  const handleAppearanceSave = () => {
    toast.success("Appearance settings saved successfully!", { theme: darkMode ? 'dark' : 'colored' });
  };

  // ----------------------------
  // Discounts handlers
  const handleAddDiscount = () => {
    if (newDiscount.code && newDiscount.percent && newDiscount.expiry) {
      setDiscounts((d) => [...d, { ...newDiscount }]);
      setNewDiscount({ code: "", percent: "", expiry: "", active: true });
      setShowDiscountModal(false);
    } else {
      toast.error("Please fill all discount fields.", { theme: darkMode ? 'dark' : 'light' });
    }
  };

  const handleDeleteDiscount = (index) => {
    const updated = discounts.filter((_, i) => i !== index);
    setDiscounts(updated);
    toast.success("Discount deleted successfully!", { theme: darkMode ? 'dark' : 'light' });
  };

  const handleOpenEditDiscount = (index) => {
    setEditDiscountIndex(index);
    setEditDiscountData({ ...discounts[index] });
    setShowEditDiscountModal(true);
  };

  const handleUpdateDiscount = () => {
    if (editDiscountIndex === null) return;
    const copy = [...discounts];
    copy[editDiscountIndex] = { ...editDiscountData };
    setDiscounts(copy);
    setShowEditDiscountModal(false);
    setEditDiscountIndex(null);
    toast.success("Discount updated successfully!", { theme: darkMode ? 'dark' : 'light' });
  };

  const toggleDiscountActive = (index) => {
    const copy = [...discounts];
    copy[index].active = !copy[index].active;
    setDiscounts(copy);
    toast.success(`Discount status changed to ${copy[index].active ? 'Active' : 'Inactive'}`, { theme: darkMode ? 'dark' : 'light' });
  };

  const shownDiscounts = discounts.filter((d) => {
    if (discountFilter === "All") return true;
    if (discountFilter === "Active") return d.active;
    if (discountFilter === "Inactive") return !d.active;
    return true;
  });

  // ----------------------------
  // Support
  const handleSendSupport = () => {
    console.log("Send support message:", supportForm);
    setShowSupportForm(false);
    setSupportForm({ partnerId: "", domain: "Orders", message: "" });
    toast.success("Message sent to support team!", { theme: darkMode ? 'dark' : 'light' });
  };

  // Company page update (persist to backend)
  const handleSaveCompany = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        toast.error("Please log in again.", { theme: darkMode ? 'dark' : 'light' });
        navigate("/seller/login");
        return;
      }
      const payload = {
        companyName: companyEdit.companyName,
        email: companyEdit.email,
        phone: companyEdit.phone,
        address: companyEdit.address,
        gstNumber: companyEdit.gstNumber,
        bankAccount: companyEdit.bankAccount,
      };
      const res = await axios.patch(
        "https://pagify-g5g5.onrender.com/api/v1/sellers/me",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.status === "success") {
        setSellerProfile({ ...sellerProfile, ...companyEdit });
        setShowCompanyPage(false);
        toast.success("Company details updated successfully!", { theme: darkMode ? 'dark' : 'light' });
      } else {
        toast.error(res.data?.message || "Failed to update company details.", { theme: darkMode ? 'dark' : 'light' });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error while updating company details.", { theme: darkMode ? 'dark' : 'light' });
    }
  };

  // New bank details handler
  const handleSaveBankDetails = () => {
    setSellerProfile((prev) => ({
      ...prev,
      bankAccount: bankDetailsEdit.bankAccount,
      gstNumber: bankDetailsEdit.gstNumber,
    }));
    setShowBankDetailsModal(false);
    toast.success("Bank details updated successfully!", { theme: darkMode ? 'dark' : 'light' });
  };

  // ----------------------------
  // Orders functions
  const statusBadge = (status) => {
    // return classes for badge container
    if (status === "Shipped")
      return "inline-block px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700";
    if (status === "Pending")
      return "inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700";
    if (status === "Delivered")
      return "inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700";
    if (status === "Cancelled")
      return "inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700";
    return "inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700";
  };

  // ----------------------------
  // Settings handlers
  const toggleIntegration = (key) => {
    setIntegrationsState((s) => ({ ...s, [key]: !s[key] }));
  };

  const toggleNotification = (key) => {
    setNotificationsState((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleUpdatePassword = async () => {
    if (!securityState.currentPassword || !securityState.newPassword || !securityState.confirmPassword) {
      toast.error("Fill all password fields.", { theme: darkMode ? 'dark' : 'light' });
      return;
    }
    if (securityState.newPassword !== securityState.confirmPassword) {
      toast.error("New password and confirmation do not match.", { theme: darkMode ? 'dark' : 'light' });
      return;
    }
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        toast.error("Please log in again.", { theme: darkMode ? 'dark' : 'light' });
        navigate("/seller/login");
        return;
      }
      const res = await axios.patch(
        "https://pagify-g5g5.onrender.com/api/v1/sellers/change-password",
        {
          currentPassword: securityState.currentPassword,
          newPassword: securityState.newPassword,
          confirmPassword: securityState.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.status === "success") {
        localStorage.setItem("sellerToken", res.data.token);
        setSecurityState((s) => ({
          ...s,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        toast.success("Password updated successfully!", { theme: darkMode ? 'dark' : 'light' });
      } else {
        toast.error(res.data?.message || "Failed to update password.", { theme: darkMode ? 'dark' : 'light' });
      }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Server error while updating password.", { theme: darkMode ? 'dark' : 'light' });
  }
};

  const handleProfileImageUpload = async (file) => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        toast.error("Please log in again.", { theme: darkMode ? 'dark' : 'light' });
        navigate("/seller/login");
        return;
      }
      const fd = new FormData();
      fd.append("profilePicture", file);
      const res = await axios.post(
        "https://pagify-g5g5.onrender.com/api/v1/sellers/upload-profile-picture",
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.status === "success") {
        setSellerProfile((p) => ({ ...p, profilePicture: res.data.seller.profilePicture }));
        toast.success("Profile picture updated!", { theme: darkMode ? 'dark' : 'light' });
      } else {
        toast.error(res.data?.message || "Failed to update profile picture.", { theme: darkMode ? 'dark' : 'light' });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error while uploading.", { theme: darkMode ? 'dark' : 'light' });
    }
  };
  // General Save (updates sellerProfile)
  const handleSaveGeneral = async (fields) => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        toast.error("Please log in again.", { theme: darkMode ? 'dark' : 'light' });
        navigate("/seller/login");
        return;
      }
      const res = await axios.patch(
        "https://pagify-g5g5.onrender.com/api/v1/sellers/me",
        fields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.status === "success") {
        setSellerProfile((p) => ({ ...p, ...fields }));
        toast.success("General settings saved successfully!", { theme: darkMode ? 'dark' : 'light' });
      } else {
        toast.error(res.data?.message || "Failed to save changes.", { theme: darkMode ? 'dark' : 'light' });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error while saving.", { theme: darkMode ? 'dark' : 'light' });
    }
  };

  const handleLogout = () => {
    // Clear session, etc.
    navigate("/seller/login");
  };

  // ----------------------------
  // small helper for profile pic initials fallback
  const initials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div
        className={`flex min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-black text-emerald-100" : "bg-white text-gray-900"
        }`}
      >
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64 h-screen p-4" : "w-20 h-screen p-4"
          } ${darkMode ? "bg-black text-white" : "bg-white text-gray-800"} shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {/* Top section with logo + hamburger */}
          <div className="flex items-center justify-between p-4 mt=[-10px]">
            {/* Hide logo when sidebar collapsed */}
            {sidebarOpen && (
  <button onClick={() => setActivePage("Home")} className="flex items-end">
    <h1 className="text-2xl md:text-4xl font-bold flex items-end cursor-pointer">
      <span className={darkMode ? "text-white" : "text-black"}>Pa</span>
      <span className="text-emerald-600 text-3xl md:text-5xl">G</span>
      <span className={darkMode ? "text-white" : "text-black"}>ify</span>
    </h1>
  </button>
)}

            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md">
              ☰
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  if (item.label === "Reviews") {
                    setShowReviewsModal(true);
                  } else {
                    setActivePage(item.label);
                  }
                }}
                className={`flex items-center w-full px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 ${
                  activePage === item.label
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "hover:bg-gray-100 hover:text-[#047857]"
                }`}
                title={item.label}
              >
                <span
        className={`text-xl ${
          activePage === item.label ? "text-white" : "text-gray-600"
        }`}
      >
        {item.icon}
      </span>
      <span
        className={`ml-3 text-lg font-medium ${
          sidebarOpen ? "inline-block" : "hidden"
        }`}
      >
        {item.label}
      </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{activePage}</h1>

            {/* Profile picture replaces theme toggle now */}
            <div className="relative flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 flex items-center justify-center"
                title="Profile"
              >
                {/* attempt avatar using gravatar-like service with email, fallback to initials */}
                {sellerProfile.profilePicture ? (
                  <img
                    src={sellerProfile.profilePicture}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://i.pravatar.cc/40?u=${encodeURIComponent(sellerProfile.email || 'seller')}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <span className="font-semibold text-sm">{initials(sellerProfile.name)}</span>
              </button>
            </div>
          </header>

          {/* PROFILE POPUP */}
          {showProfileModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
    onClick={() => setShowProfileModal(false)}
  >
    <div
      className={`w-full max-w-md p-6 rounded-xl ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">{sellerProfile.name}</h2>
          <p className="text-sm opacity-80">{sellerProfile.companyName}</p>
        </div>
        <button
          className="text-sm text-red-500"
          onClick={() => setShowProfileModal(false)}
        >
          Close
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border">
          {sellerProfile.profilePicture ? (
            <img src={sellerProfile.profilePicture} alt="profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-sm">
              Seller
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-black/60 text-white rounded-full p-1 cursor-pointer border border-white" title="Edit photo">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleProfileImageUpload(e.target.files[0])}
            />
            <Camera className="h-3 w-3" />
          </label>
        </div>
        <div className="text-sm opacity-80">
          <div>{sellerProfile.email}</div>
          <div>{sellerProfile.phone}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div>
          <strong>Company:</strong> {sellerProfile.companyName}
        </div>
        <div>
          <strong>GST No:</strong> {sellerProfile.gstNumber}
        </div>
        <div>
          <strong>Bank A/C:</strong> {sellerProfile.bankAccount}
        </div>
        <div>
          <strong>Email:</strong> {sellerProfile.email}
        </div>
        <div>
          <strong>Phone:</strong> {sellerProfile.phone}
        </div>
        <div>
          <strong>Address:</strong> {sellerProfile.address}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {/* Edit Company button */}
        <button
          onClick={() => {
            setShowProfileModal(false);
            setShowCompanyPage(true);
            setCompanyEdit({ ...sellerProfile });
          }}
          className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          Edit Company
        </button>
        {/* Logout button */}
        <button
          onClick={() => {
            localStorage.removeItem("sellerToken"); 
            setShowProfileModal(false);
            window.location.href = "/seller/login";
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  </div>
)}

          {/* COMPANY PAGE (pagify) */}
          {showCompanyPage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
              onClick={() => setShowCompanyPage(false)}
            >
              <div
                className={`w-full max-w-2xl p-6 rounded-xl ${
                  darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {companyEdit.companyName || "Company Details"}
                  </h2>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => setShowCompanyPage(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Company Name</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={companyEdit.companyName}
                      onChange={(e) =>
                        setCompanyEdit((s) => ({ ...s, companyName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm">GST Number</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={companyEdit.gstNumber}
                      onChange={(e) =>
                        setCompanyEdit((s) => ({ ...s, gstNumber: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Bank Account</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={companyEdit.bankAccount}
                      onChange={(e) =>
                        setCompanyEdit((s) => ({ ...s, bankAccount: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm">Phone</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={companyEdit.phone}
                      onChange={(e) =>
                        setCompanyEdit((s) => ({ ...s, phone: e.target.value }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm">Address</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={companyEdit.address}
                      onChange={(e) =>
                        setCompanyEdit((s) => ({ ...s, address: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Contact Email</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={companyEdit.email}
                      onChange={(e) =>
                        setCompanyEdit((s) => ({ ...s, email: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCompanyPage(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCompany}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-full"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Bank Details Modal */}
          {showBankDetailsModal && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
              onClick={() => setShowBankDetailsModal(false)}
            >
              <div
                className={`w-full max-w-xl p-6 rounded-xl ${
                  darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Update Bank Details</h2>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => setShowBankDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={bankDetailsEdit.bankAccount}
                      onChange={(e) => setBankDetailsEdit(s => ({ ...s, bankAccount: e.target.value }))}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter new bank account number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">GST Number</label>
                    <input
                      type="text"
                      value={bankDetailsEdit.gstNumber}
                      onChange={(e) => setBankDetailsEdit(s => ({ ...s, gstNumber: e.target.value }))}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter GST number"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button onClick={() => setShowBankDetailsModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded-full">
                      Cancel
                    </button>
                    <button onClick={handleSaveBankDetails} className="px-4 py-2 bg-emerald-600 text-white rounded-full">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- HOME --- */}
          {activePage === "Home" && (
            <>
              {/* Stats */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 {[
  { label: "Books Listed", value: dashboardStats.totalProducts, icon: "📚" },
  { label: "Orders", value: dashboardStats.totalOrders, icon: "🛒" },
  { label: "Revenue", value: `₹${Number(dashboardStats.totalRevenue).toFixed(2)}`, icon: "💰" },
  { label: "Growth", value: `${dashboardStats.growth}%`, icon: "📈", highlight: true },
].map((stat, i) => (
  <div
    key={i}
    onClick={() => {
      if (stat.label === "Orders") {
        setActivePage("Orders");
      }
      if (stat.label === "Books Listed") {
        setActivePage("Products");
      }
    }}
    className={`
      cursor-pointer
      p-6 rounded-xl shadow-md flex flex-col items-center justify-center space-y-2
      transition-all duration-300 ease-in-out
      transform hover:scale-105 hover:shadow-xl
      ${
        darkMode
          ? "bg-gray-800 text-gray-400 hover:bg-emerald-700 hover:text-white"
          : "bg-white text-gray-800 hover:bg-emerald-100"
      }
    `}
  >


      <div className="text-3xl mb-1">{stat.icon}</div>
      <div className="text-center">
        <p className="text-sm font-medium">{stat.label}</p>
        <h3
          className={`text-2xl font-extrabold mt-1 ${
            stat.label === "Growth" 
              ? (parseFloat(stat.value) >= 0 ? "text-emerald-500" : "text-red-500")
              : (stat.highlight ? "text-emerald-500" : "")
          }`}
        >
          {stat.label === "Growth" && parseFloat(stat.value) >= 0 ? `+${stat.value}` : stat.value}
        </h3>
      </div>
    </div>
  ))}
</section>
              {/* Sales Overview Graph */}
              <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <h2 className="text-lg font-bold mb-4">Sales Overview</h2>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.7} />
                        <stop offset="50%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ddd"} />
                    <XAxis dataKey="month" stroke={darkMode ? "#ccc" : "#333"} />
                    <YAxis stroke={darkMode ? "#ccc" : "#333"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#fff",
                        borderRadius: "8px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="none"
                      fill="url(#greenGradient)"
                      fillOpacity={1}
                    />

                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 6, fill: darkMode ? "#fff" : "#10B981", strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </section>
            </>
          )}

          {/* --- ORDERS --- */}
          {activePage === "Orders" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-bold mb-4">Orders</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={darkMode ? "text-emerald-300" : "text-gray-700"}>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Book</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr
                      key={i}
                      className={`border-t ${
                        darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-emerald-50"
                      }`}
                    >
                      <td className="p-2">{o.id}</td>
                      <td className="p-2">{o.customer}</td>
                      <td className="p-2">{o.book}</td>
                      <td className="p-2">{o.qty}</td>
                      <td className="p-2">{o.total}</td>
                      <td className="p-2">
                        <span className={statusBadge(o.status)}>{o.status}</span>
                      </td>
                      <td className="py-3 pr-0 text-right">
                    <button
                      onClick={() => navigate(`/seller/order/${o.id}`)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
                    >
                      View Details
                    </button>
                  </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td className="p-4" colSpan={7}>
                        No orders available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {/* --- PAYMENTS --- */}
          {activePage === "Payments" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard size={20} /> Payment Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBankDetailsEdit({ bankAccount: sellerProfile.bankAccount, gstNumber: sellerProfile.gstNumber });
                      setShowBankDetailsModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full shadow"
                  >
                    Update Bank Details
                  </button>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className={`p-6 mb-8 rounded-xl border border-dashed flex items-center justify-between ${darkMode ? "bg-gray-700 border-emerald-500" : "bg-emerald-50 border-emerald-400"}`}>
                <div className="flex items-center gap-4">
                  <Banknote size={40} className="text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Your Bank Details</h3>
                    <p className="text-sm opacity-80">
                      <span className="font-medium">Account:</span> {sellerProfile.bankAccount}
                    </p>
                    <p className="text-sm opacity-80">
                      <span className="font-medium">GSTIN:</span> {sellerProfile.gstNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setBankDetailsEdit({ bankAccount: sellerProfile.bankAccount, gstNumber: sellerProfile.gstNumber });
                    setShowBankDetailsModal(true);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${darkMode ? "bg-emerald-600 text-white" : "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"}`}
                >
                  Edit
                </button>
              </div>

              {/* Payments History Table */}
              <h2 className="text-lg font-bold mb-4">Payment History</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={darkMode ? "text-emerald-300" : "text-gray-700"}>
                    <th className="p-2">Date</th>
                    <th className="p-2">Transaction ID</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr
                      key={i}
                      className={`border-t ${
                        darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-emerald-50"
                      }`}
                    >
                      <td className="p-2">{p.date}</td>
                      <td className="p-2">{p.id}</td>
                      <td className="p-2">{p.description}</td>
                      <td className="p-2 font-semibold text-right">{p.amount}</td>
                      <td className="p-2 text-center">
                        <span className={statusBadge(p.status)}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td className="p-4 text-center" colSpan={5}>
                        No payment history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {/* --- PRODUCTS --- */}
          {activePage === "Products" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex justify-between mb-4">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-400 text-black"
                  }`}
                />
                <button
                  onClick={() => navigate("/seller/add-book")}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full shadow"
                >
                  + Add New Book
                </button>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={darkMode ? "text-emerald-300" : "text-gray-700"}>
                    <th className="p-2">Title</th>
                    <th className="p-2">Author</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
  <tr key={book._id}>
    <td>{book.title}</td>
    <td>{book.author || "-"}</td>
    <td>₹{book.price}</td>
    <td>{book.stock}</td>
    <td>{book.status}</td>
    <td>
      <button
        onClick={() =>
          navigate(`/seller/manage-book/${book._id}`)
        }
        className="px-4 py-2 bg-emerald-600 text-white rounded-full"
      >
        Manage Product
      </button>
    </td>
  </tr>
))}

                  {filteredBooks.length === 0 && (
                    <tr>
                      <td className="p-4" colSpan={6}>
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {/* --- DISCOUNTS --- */}
          {activePage === "Discounts" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Discount Management</h2>

                {/* Filter toggles */}
                <div className="flex items-center space-x-2">
                  {["All", "Active", "Inactive"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setDiscountFilter(t)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        discountFilter === t ? "bg-emerald-600 text-white" : "bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount List */}
              <table className="w-full text-left border-collapse mb-6">
                <thead>
                  <tr className={darkMode ? "text-emerald-300" : "text-gray-700"}>
                    <th className="p-2">Code</th>
                    <th className="p-2">Percent</th>
                    <th className="p-2">Expiry</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shownDiscounts.map((d, i) => (
                    <tr
                      key={i}
                      className={`border-t ${
                        darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-emerald-50"
                      }`}
                    >
                      <td className="p-2">{d.code}</td>
                      <td className="p-2">{d.percent}</td>
                      <td className="p-2">{d.expiry}</td>
                      <td
                        className={`p-2 ${d.active ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {d.active ? "Active" : "Inactive"}
                      </td>
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => handleOpenEditDiscount(discounts.indexOf(d))}
                          className="px-3 py-1 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 inline-flex items-center"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDiscount(discounts.indexOf(d))}
                          className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 inline-flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                        <button
                          onClick={() => toggleDiscountActive(discounts.indexOf(d))}
                          className="px-3 py-1 bg-gray-200 text-black rounded-full hover:bg-gray-300"
                        >
                          {d.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shownDiscounts.length === 0 && (
                    <tr>
                      <td className="p-4" colSpan={5}>
                        No discounts match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Create Discount Button */}
              <button
                onClick={() => setShowDiscountModal(true)}
                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
              >
                + Create Discount
              </button>

              {/* Add Discount Modal */}
              {showDiscountModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  onClick={() => setShowDiscountModal(false)}
                >
                  <div
                    className={`p-6 rounded-xl shadow-lg w-96 ${
                      darkMode ? "bg-gray-900" : "bg-white"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold mb-4">Create New Discount</h3>
                    <input
                      type="text"
                      placeholder="Discount Code"
                      value={newDiscount.code}
                      onChange={(e) =>
                        setNewDiscount({ ...newDiscount, code: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Percent (e.g., 20%)"
                      value={newDiscount.percent}
                      onChange={(e) =>
                        setNewDiscount({ ...newDiscount, percent: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      type="date"
                      value={newDiscount.expiry}
                      onChange={(e) =>
                        setNewDiscount({ ...newDiscount, expiry: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <div className="flex items-center mb-4">
                      <input
                        id="activeChk"
                        type="checkbox"
                        checked={newDiscount.active}
                        onChange={(e) =>
                          setNewDiscount({ ...newDiscount, active: e.target.checked })
                        }
                        className="mr-2"
                      />
                      <label htmlFor="activeChk">Active</label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowDiscountModal(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddDiscount}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Discount Modal */}
              {showEditDiscountModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                  onClick={() => setShowEditDiscountModal(false)}
                >
                  <div
                    className={`p-6 rounded-xl shadow-lg w-96 ${
                      darkMode ? "bg-gray-900" : "bg-white"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold mb-4">Edit Discount</h3>
                    <input
                      type="text"
                      placeholder="Discount Code"
                      value={editDiscountData.code}
                      onChange={(e) =>
                        setEditDiscountData({ ...editDiscountData, code: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Percent (e.g., 20%)"
                      value={editDiscountData.percent}
                      onChange={(e) =>
                        setEditDiscountData({ ...editDiscountData, percent: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      type="date"
                      value={editDiscountData.expiry}
                      onChange={(e) =>
                        setEditDiscountData({ ...editDiscountData, expiry: e.target.value })
                      }
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <div className="flex items-center mb-4">
                      <input
                        id="editActiveChk"
                        type="checkbox"
                        checked={editDiscountData.active}
                        onChange={(e) =>
                          setEditDiscountData({
                            ...editDiscountData,
                            active: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <label htmlFor="editActiveChk">Active</label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowEditDiscountModal(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateDiscount}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}{/* REVIEWS */}
          {activePage === "Reviews" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-bold mb-4">Customer Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { user: "Alice", review: "Great book quality!", rating: 4 },
                  { user: "Bob", review: "Fast delivery and good service.", rating: 5 },
                  { user: "Charlie", review: "Stock updates need improvement.", rating: 3 },
                ].map((r, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl shadow hover:shadow-lg transition ${
                      darkMode ? "bg-gray-700" : "bg-yellow-100"
                    }`}
                  >
                    <h4 className="font-bold mb-2">{r.user}</h4>
                    <p className="mb-2">{r.review}</p>
                    <p className="text-emerald-500">
                      {"⭐".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SUPPORT */}
          {activePage === "Support" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="text-lg font-bold mb-4">Support</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact details */}
                <div className={`p-4 rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <h3 className="font-semibold mb-2 flex items-center"><Mail size={16} className="mr-2" /> Contact</h3>

                  {/* Company name is now a clickable "page" */}
                  <p className="mb-2"><strong>Company:</strong> <button onClick={() => { setShowCompanyPage(true); setCompanyEdit({ ...sellerProfile }); }} className="text-emerald-600 underline">{sellerProfile.companyName}</button></p>
                  <p className="mb-2"><strong>Email:</strong> pagify@gmail.com</p>
                  <p className="mb-2"><strong>Phone:</strong> +91 5577993311</p>
                  <p className="mb-2"><strong>Address:</strong> 123 Bookworm Lane, Kolkata, 777777, India</p>

                  <div className="mt-3">
                    <h4 className="font-semibold mb-1">Social</h4>
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2 px-3 py-1 border rounded-full"><Twitter size={16} /><span>@pagify</span></button>
                      <button className="flex items-center space-x-2 px-3 py-1 border rounded-full"><MessageSquare size={16} /><span>/pagify-support</span></button>
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className={`p-4 rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <h3 className="font-semibold mb-2">Frequently Asked</h3>
                  <ul className="list-disc ml-5 space-y-2">
                    <li>How to create a product listing?</li>
                    <li>How to withdraw payments?</li>
                    <li>How to handle returns & refunds?</li>
                    <li>How to change bank or payout details?</li>
                  </ul>

                  <div className="mt-4">
                    <button onClick={() => setShowSupportForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">Send Message</button>
                  </div>
                </div>
              </div>

              {/* Support message form modal */}
              {showSupportForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className={`w-full max-w-lg p-6 rounded-lg ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                    <h3 className="text-lg font-bold mb-4">Send Support Message</h3>
                    <label className="block mb-2 text-sm font-medium">Partner ID (Seller ID)</label>
                    <input type="text" value={supportForm.partnerId} onChange={(e) => setSupportForm(s => ({ ...s, partnerId: e.target.value }))} className="w-full mb-3 px-3 py-2 border rounded" placeholder="e.g., SELLER_123" />

                    <label className="block mb-2 text-sm font-medium">Domain</label>
                    <select value={supportForm.domain} onChange={(e) => setSupportForm(s => ({ ...s, domain: e.target.value }))} className="w-full mb-3 px-3 py-2 border rounded">
                      <option>Orders</option>
                      <option>Payments</option>
                      <option>Listings</option>
                      <option>Technical</option>
                      <option>Other</option>
                    </select>

                    <label className="block mb-2 text-sm font-medium">Message</label>
                    <textarea value={supportForm.message} onChange={(e) => setSupportForm(s => ({ ...s, message: e.target.value }))} rows={6} className="w-full mb-4 px-3 py-2 border rounded" placeholder="Describe your issue..." />

                    <div className="flex justify-end space-x-2">
                      <button onClick={() => setShowSupportForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded-full">Cancel</button>
                      <button onClick={handleSendSupport} className="px-4 py-2 bg-emerald-600 text-white rounded-full">Send</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SETTINGS */}
          {activePage === "Settings" && (
            <section className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex">
                {/* Left Nav */}
                <div className="w-56 pr-6">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  {["General", "Security", "Notifications", "Appearance", "Integrations"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setSettingsTab(tab)}
                        className={`w-full text-left px-4 py-3 rounded-md mb-2 ${
                          settingsTab === tab ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                {/* Right content */}
                <div className="flex-1">
                  {/* General */}
                  {settingsTab === "General" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">General</h3>
                      <p className="mb-4 opacity-70">Basic account information and profile.</p>
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-md font-semibold mb-2">Store Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm mb-1">Store Name</label>
                              <input
                                className="w-1/2 px-3 py-2 border rounded"
                                value={sellerProfile.companyName}
                                onChange={(e) =>
                                  setSellerProfile((s) => ({ ...s, companyName: e.target.value }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Address</label>
                              <input
                                className="w-1/2 px-3 py-2 border rounded"
                                value={sellerProfile.address}
                                onChange={(e) =>
                                  setSellerProfile((s) => ({ ...s, address: e.target.value }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold mb-2">Contact Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm mb-1">Contact Email</label>
                              <input
                                className="w-1/2 px-3 py-2 border rounded"
                                value={sellerProfile.email}
                                onChange={(e) =>
                                  setSellerProfile((s) => ({ ...s, email: e.target.value }))
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Phone</label>
                              <input
                                className="w-1/2 px-3 py-2 border rounded"
                                value={sellerProfile.phone}
                                onChange={(e) =>
                                  setSellerProfile((s) => ({ ...s, phone: e.target.value }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold mb-2">Tax Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm mb-1">GST Number</label>
                              <input
                                className="w-1/2 px-3 py-2 border rounded"
                                value={sellerProfile.gstNumber}
                                onChange={(e) =>
                                  setSellerProfile((s) => ({ ...s, gstNumber: e.target.value }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold mb-2">Bank Information</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm mb-1">Bank Account</label>
                              <input
                                className="w-1/2 px-3 py-2 border rounded"
                                value={sellerProfile.bankAccount}
                                onChange={(e) =>
                                  setSellerProfile((s) => ({ ...s, bankAccount: e.target.value }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              handleSaveGeneral({
                                companyName: sellerProfile.companyName,
                                email: sellerProfile.email,
                                phone: sellerProfile.phone,
                                address: sellerProfile.address,
                                gstNumber: sellerProfile.gstNumber,
                                bankAccount: sellerProfile.bankAccount,
                              })
                            }
                            className="px-4 py-2 bg-emerald-600 text-white rounded-full"
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
                      <h3 className="text-lg font-semibold mb-3">Password</h3>
                      <div className="space-y-3 mb-6">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-2/3 px-3 py-2 border rounded"
                          value={securityState.currentPassword}
                          onChange={(e) =>
                            setSecurityState((s) => ({ ...s, currentPassword: e.target.value }))
                          }
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-2/3 px-3 py-2 border rounded"
                          value={securityState.newPassword}
                          onChange={(e) =>
                            setSecurityState((s) => ({ ...s, newPassword: e.target.value }))
                          }
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-2/3 px-3 py-2 border rounded"
                          value={securityState.confirmPassword}
                          onChange={(e) =>
                            setSecurityState((s) => ({
                              ...s,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleUpdatePassword}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-full"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-3">Two-Factor Authentication</h3>
                      <div className="border rounded p-4 mb-6 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Enable Two-Factor Authentication</p>
                          <p className="text-sm opacity-70">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={securityState.twoFA}
                            onChange={() =>
                              setSecurityState((s) => ({ ...s, twoFA: !s.twoFA }))
                            }
                          />
                          <span>{securityState.twoFA ? "On" : "Off"}</span>
                        </label>
                      </div>

                      <h3 className="text-lg font-semibold mb-3">Login Sessions</h3>
                      <div className="space-y-3">
                        <div className="border rounded p-4 flex justify-between items-center">
                          <div>
                            <div className="font-medium">Current Session</div>
                            <div className="text-sm opacity-70">
                              Windows • Chrome • IP: 192.168.1.1
                            </div>
                          </div>
                          <div className="text-sm text-emerald-600">Active</div>
                        </div>

                        <div className="border rounded p-4 flex justify-between items-center">
                          <div>
                            <div className="font-medium">Previous Session</div>
                            <div className="text-sm opacity-70">
                              Mac OS • Safari • IP: 192.168.1.2
                            </div>
                          </div>
                          <button className="text-red-500">Revoke</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {settingsTab === "Notifications" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Email Notifications</h3>
                      <div className="space-y-3 mb-6">
                        {[
                          { key: "newOrders", title: "New Orders", desc: "Receive notifications for new orders" },
                          { key: "newReviews", title: "New Reviews", desc: "Receive notifications for new product reviews" },
                          { key: "lowStock", title: "Low Stock", desc: "Receive notifications when products are low in stock" },
                        ].map((n) => (
                          <div key={n.key} className="p-4 border rounded flex justify-between items-center">
                            <div>
                              <div className="font-medium">{n.title}</div>
                              <div className="text-sm opacity-70">{n.desc}</div>
                            </div>
                            <button
                              onClick={() => toggleNotification(n.key)}
                              className={`px-3 py-1 rounded-full ${
                                notificationsState[n.key]
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-200 text-black"
                              }`}
                            >
                              {notificationsState[n.key] ? "On" : "Off"}
                            </button>
                          </div>
                        ))}

                        <h3 className="text-lg font-semibold mb-3 mt-4">System Notifications</h3>
                        <div className="space-y-3">
                          <div className="p-4 border rounded flex justify-between items-center">
                            <div>
                              <div className="font-medium">Security Alerts</div>
                              <div className="text-sm opacity-70">
                                Receive notifications about security issues
                              </div>
                            </div>
                            <button
                              onClick={() => toggleNotification("securityAlerts")}
                              className={`px-3 py-1 rounded-full ${
                                notificationsState.securityAlerts
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-200 text-black"
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
    <h3 className="text-lg font-semibold mb-3">Theme</h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[
        { key: "Light", title: "Light", img: lightTheme },
        { key: "Dark", title: "Dark", img: darkTheme },
        { key: "Auto", title: "Auto", img: lightTheme }, // Auto uses same as Light
      ].map((t) => (
        <div
          key={t.key}
          onClick={() => setAppearance(t.key)}
          className={`p-4 border rounded cursor-pointer ${
            appearance === t.key ? "ring-2 ring-emerald-400" : ""
          }`}
        >
          {/* Preview image */}
          <img
            src={t.img}
            alt={`${t.title} theme preview`}
            className="h-24 w-full object-cover rounded mb-3"
          />
          <div className="font-medium text-center">{t.title}</div>
        </div>
      ))}
    </div>

    <div className="flex justify-end">
      <button onClick={handleAppearanceSave} className="px-4 py-2 bg-emerald-600 text-white rounded-full">
        Save Changes
      </button>
    </div>
  </div>
)}

                  {/* Integrations */}
                  {settingsTab === "Integrations" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Payment Gateways</h3>
                      <div className="space-y-3 mb-6">
                        {[
                          { key: "stripe", label: "Stripe" },
                          { key: "paypal", label: "PayPal" },
                          { key: "square", label: "Square" },
                        ].map((it) => (
                          <div key={it.key} className="p-4 border rounded flex justify-between items-center">
                            <div>
                              <div className="font-medium">{it.label}</div>
                              <div className="text-sm opacity-70">
                                {integrationsState[it.key] ? "Connected" : "Not connected"}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleIntegration(it.key)}
                              className={`px-3 py-1 rounded-full ${
                                integrationsState[it.key]
                                  ? "bg-red-500 text-white"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              {integrationsState[it.key] ? "Disconnect" : "Connect"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-lg font-semibold mb-3">Third-Party Services</h3>
                      <div className="space-y-3">
                        {[
                          { key: "ga", label: "Google Analytics" },
                          { key: "mailchimp", label: "Mailchimp" },
                          { key: "slack", label: "Slack" },
                        ].map((it) => (
                          <div key={it.key} className="p-4 border rounded flex justify-between items-center">
                            <div>
                              <div className="font-medium">{it.label}</div>
                              <div className="text-sm opacity-70">
                                {integrationsState[it.key] ? "Connected" : "Not connected"}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleIntegration(it.key)}
                              className={`px-3 py-1 rounded-full ${
                                integrationsState[it.key]
                                  ? "bg-red-500 text-white"
                                  : "bg-emerald-600 text-white"
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
        </main>
      </div>

      {/* Professional Customer Reviews Modal */}
      <AnimatePresence>
        {showReviewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'} border`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Customer Reviews</h3>
                  <button
                    onClick={() => setShowReviewsModal(false)}
                    className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <Star size={40} className="text-amber-500 opacity-30" />
                  </div>
                  <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Customer Reviews</h4>
                  <p className={`text-sm max-w-[280px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    You haven't received any customer reviews yet. Once your customers start sharing their feedback, they will appear here.
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowReviewsModal(false)}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer
  position="top-center"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme={darkMode ? "dark" : "light"}
/>
      <style>
  {`
  .Toastify__toast-container {
    padding: 10px;
  }
  .Toastify__toast {
    border-radius: 8px;
    background-color: #fff;
    color: #1F2937;
    font-family: inherit;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .Toastify__toast--success {
    border-left: 5px solid #10B981;
  }
  .Toastify__toast--error {
    border-left: 5px solid #EF4444;
  }
  .Toastify__toast--info {
    border-left: 5px solid #3B82F6;
  }
  .Toastify__toast-theme--dark {
    background-color: #1F2937;
    color: #fff;
  }
  .Toastify__progress-bar {
    background: rgba(0, 0, 0, 0.3);
  }
  .Toastify__progress-bar--dark {
    background: rgba(255, 255, 255, 0.3);
  }
  .Toastify__close-button {
    color: #1F2937;
    opacity: 0.8;
  }
  .Toastify__close-button--dark {
    color: #fff;
  }
  `}
</style>
    </>
  );
}
