import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from 'axios';
import { toast } from 'react-toastify';
import { addToCart } from '../../utils/cartUtils';
import { toggleWishlist, isInWishlist, removeFromWishlist } from '../../utils/wishlistUtils';
import BestsellerComponent from "../../components/books/bestseller";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../../context/InventoryContext.jsx";

import {
  Home,
  ListFilter,
  Award,
  Settings,
  HelpCircle,
  Search,
  ShoppingCart,
  Heart,
  Trash2,
  X,
  Star,
  Book,
  Brain,
  Rocket,
  Ghost,
  User,
  Sun,
  Moon,
  Menu,
  ShoppingBag,
  Camera,
  LogOut,
  MapPin,
  Monitor,
} from 'lucide-react';

import { fetchWishlist as fetchWishlistAPI, fetchCart as fetchCartAPI, fetchMyOrders as fetchMyOrdersAPI } from '../../services/inventoryApi';

export default function HomePage() {
  const [booksFromDB, setBooksFromDB] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Popular");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("dashboard");

  // Handle initial view from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      setView(viewParam);
      // Clean up the URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const [theme, setTheme] = useState("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Sabrina Aryan',
    email: 'SabrinaAry208@gmail.com',
    username: 'sabrina_ary',
    phoneNumber: '555-123-4567',
    birthdate: '1990-01-01',
    gender: 'Female',
    accountStatus: 'Active'
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    reEnterPassword: ''
  });
  const [addresses, setAddresses] = useState([{
    street: '123 Reading Lane',
    city: 'Bookville',
    state: 'Literature State',
    zip: '54321',
    country: 'USA',
    default: true
  }]);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [profileImage, setProfileImage] = useState("https://placehold.co/100x100/A3A3A3/FFFFFF?text=SA");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredHeaderItem, setHoveredHeaderItem] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const fileInputRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const { cartCount, wishlistCount, wishlistItems, addToCart: addToCartCtx, removeFromCart: removeFromCartCtx, addToWishlist: addToWishlistCtx, removeFromWishlist: removeFromWishlistCtx, setUserId: setCtxUser, fetchCounts, theme: globalTheme, updateTheme } = useInventory();

  // Load orders from server
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadOrders = async () => {
      try {
        const userOrders = await fetchMyOrdersAPI();
        setOrders(userOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
      }
    };
    loadOrders();
  }, [userId]);

  // ===============================
  // MAP DB PRODUCT → UI BOOK CARD
  // ===============================
  const mapProductToBookCard = (product) => {
    if (!product || (!product._id && !product.id)) return null;
    return {
      id: product._id || product.id,
      title: product.title || "Untitled",
      author: product.author || "Unknown Author",
      cover:
        product.coverImage ||
        "https://placehold.co/200x300?text=Book",
      price: product.price ? `₹${product.price}` : "Price N/A",
    };
  };

  // Sync local wishlist with context wishlistItems
  useEffect(() => {
    if (wishlistItems && Array.isArray(wishlistItems)) {
      const mapped = wishlistItems
        .map(p => mapProductToBookCard(p))
        .filter(p => p !== null);
      setWishlist(mapped);
    }
  }, [wishlistItems]);

  // Load cart from server
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadCartData = async () => {
      try {
        const cartItems = await fetchCartAPI();
        if (cartItems && Array.isArray(cartItems)) {
          // cart from API returns array of { product: { ... }, quantity: N }
          setCart(cartItems.map(item => ({
            ...mapProductToBookCard(item.product),
            quantity: item.quantity
          })));
        }
      } catch (err) {
        console.error('Error loading cart data:', err);
      }
    };

    loadCartData();
  }, [userId]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    const loadingToast = toast.loading("Uploading profile picture...");

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/v1/users/upload-profile-picture', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.user;
        setUserProfile({
            name: updatedUser.name || '',
            email: updatedUser.email || '',
            username: updatedUser.email ? updatedUser.email.split('@')[0] : '',
            phoneNumber: updatedUser.phone || '',
            phone: updatedUser.phone || '', // Unified key
            birthdate: '', 
            gender: updatedUser.gender || '',
            accountStatus: 'Active',
            address: updatedUser.address || '',
            bankAccount: updatedUser.bankAccount || '',
            ifscCode: updatedUser.ifscCode || ''
        });
        setProfileImage(updatedUser.profilePicture);
        toast.update(loadingToast, { render: "Profile picture updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
      }
      // Reset file input so the same file can be uploaded again if needed
      if (e.target) e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      toast.update(loadingToast, { render: "Failed to upload profile picture.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!editFormData.name || !editFormData.phone) {
      alert('Name and Phone are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Explicit payload to ensure we only send what we intend
      const payload = {
        name: editFormData.name,
        // email is disabled in form, but we include it if needed. 
        // If backend allows updating email, it will be processed.
        email: editFormData.email, 
        phone: editFormData.phone,
        gender: editFormData.gender || 'female',
        address: editFormData.address,
        bankAccount: editFormData.bankAccount,
        ifscCode: editFormData.ifscCode
      };

      const response = await axios.patch('http://localhost:8000/api/v1/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        // Update token if provided by backend (e.g. if email changed)
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        const updatedUser = response.data.user;
        setUserProfile({
            name: updatedUser.name || '',
            email: updatedUser.email || '',
            username: updatedUser.email ? updatedUser.email.split('@')[0] : '',
            phoneNumber: updatedUser.phone || '',
            phone: updatedUser.phone || '', // Unified key
            birthdate: '', 
            gender: updatedUser.gender || '',
            accountStatus: 'Active',
            address: updatedUser.address || '',
            bankAccount: updatedUser.bankAccount || '',
            ifscCode: updatedUser.ifscCode || ''
        });
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(err?.response?.data?.message || 'Failed to update profile.');
    }
  };

  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const popupRef = useRef(null);
  useEffect(() => {
    // Sync local theme state with global theme
    setTheme(globalTheme);
  }, [globalTheme]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.assign('/user/login');
      return;
    }

    axios.get('http://localhost:8000/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
        if (res.data.status === 'success') {
            const user = res.data.user;
            const uid = user._id || user.id;
            if (uid) {
              setUserId(uid);
              setCtxUser(uid);
              fetchCounts();
            }
            setUserProfile({
                name: user.name || '',
                email: user.email || '',
                username: user.email ? user.email.split('@')[0] : '',
                phoneNumber: user.phone || '',
                phone: user.phone || '', // Unified key
                birthdate: '', // Not in DB yet
                gender: user.gender || '',
                accountStatus: 'Active',
                address: user.address || '',
                bankAccount: user.bankAccount || '',
                ifscCode: user.ifscCode || ''
            });
            setEditFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || '',
                address: user.address || '',
                bankAccount: user.bankAccount || '',
                ifscCode: user.ifscCode || ''
            });
            if (user.profilePicture) {
                setProfileImage(user.profilePicture);
            } else {
                setProfileImage(null);
            }
        }
    })
    .catch(() => {
      localStorage.removeItem('token');
      window.location.assign('/user/login');
    });
  }, []);

useEffect(() => {
  axios
    .get('http://localhost:8000/api/v1/products/public')
    .then((res) => {
      setBooksFromDB(res.data.products);
    })
    .catch((err) => {
      console.error('Failed to load books', err);
    })
    .finally(() => {
      setLoadingBooks(false);
    });
}, []);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);// ===============================
// DB PRODUCT → UI BOOK CARD
// ===============================



  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    updateTheme(newTheme);
  };

  const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.assign('/user/login');
};


  const showMessage = (message) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
  };

  const handleSaveChanges = () => {
    if (isChangingPassword) {
      if (passwords.newPassword !== passwords.reEnterPassword) {
        showMessage("Passwords do not match!");
        return;
      }
      // Here you would typically handle the password change logic
    }
    showMessage("Profile updated successfully!");
  };

  const startCamera = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing the camera: ", err);
      setIsCameraActive(false);
      showMessage("Could not access camera. Please check your permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      setProfileImage(imageDataUrl);
      stopCamera();
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(' ');
    let initials = '';
    if (parts.length > 0 && parts[0]) {
      initials += parts[0].charAt(0).toUpperCase();
    }
    if (parts.length > 1 && parts[1]) {
      initials += parts[1].charAt(0).toUpperCase();
    }
    return initials;
  };

  const handleAddAddress = () => {
    setAddresses([...addresses, { ...newAddress, default: false }]);
    setIsAddingAddress(false);
    setNewAddress({
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    });
  };

  const handleDeleteAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };


  // Reusable modal for messages
  const MessageModal = ({ message, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center`}
      >
        <p className={`text-lg font-semibold ${currentTheme.textColor} text-center`}>{message}</p>
        <motion.button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const LogoutConfirmationModal = ({ onYes, onNo }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <p className={`text-lg font-semibold ${currentTheme.textColor}`}>Are you sure you want to log out?</p>
        <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>This will end your current session.</p>
        <div className="flex space-x-4 mt-4">
          <motion.button
            onClick={onYes}
            className={`px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Yes
          </motion.button>
          <motion.button
            onClick={onNo}
            className={`px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            No
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
  
  const HelpModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col w-full max-w-lg`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Help & Support</h2>
          <motion.button onClick={() => setShowHelpModal(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <X className={`h-6 w-6 ${currentTheme.textColor}`} />
          </motion.button>
        </div>
        <p className={`${currentTheme.secondaryTextColor} mb-4`}>
          Need assistance? We’re here to help you make the most of Pagify.
        </p>
        <ul className="space-y-4">
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Account Help</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Trouble signing in or creating an account? Click here.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Order & Payments</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Learn how to buy, sell, or donate books securely.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Community Guidelines</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Understand how to engage respectfully with fellow readers and sellers.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Donations & Contributions</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Find answers about supporting Pagify and where your donations go.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Contact Support</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Still need help? Reach out at support@pagify.com.</p>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
  
  const themeStyles = {
    light: {
      appBg: "bg-white",
      sidebarBg: "bg-neutral-100",
      headerBg: "bg-neutral-100",
      cardBg: "bg-white",
      cardHover: "bg-neutral-100",
      textColor: "text-gray-800",
      secondaryTextColor: "text-gray-500",
      accent: "text-emerald-700",
      accentButtonBg: "bg-emerald-700",
      accentButtonHover: "hover:bg-emerald-800",
      inputBorder: "border-emerald-300",
      inputBg: "bg-white",
      headerIconColor: "text-black",
      navTextColor: "text-gray-800",
      navIconColor: "text-gray-800",
      navHover: "hover:bg-neutral-200",
      pagify: {
        text1: "text-gray-800",
        text2: "text-emerald-700"
      },
      navMobileBg: "bg-emerald-700",
      navMobile: {
        active: "text-emerald-200",
        inactive: "text-white"
      }
    },
    dark: {
      appBg: "bg-gray-900",
      sidebarBg: "bg-gray-950",
      headerBg: "bg-gray-600",
      cardBg: "bg-gray-700",
      cardHover: "bg-gray-600",
      textColor: "text-gray-100",
      secondaryTextColor: "text-gray-400",
      accent: "text-emerald-400",
      accentButtonBg: "bg-emerald-700",
      accentButtonHover: "hover:bg-emerald-600",
      inputBorder: "border-emerald-500",
      inputBg: "bg-gray-200",
      inputTextColor: "text-gray-900",
      headerIconColor: "text-gray-100",
      navTextColor: "text-gray-300",
      navIconColor: "text-gray-300",
      iconHover: "hover:text-emerald-400",
      navHover: "hover:bg-gray-800",
      pagify: {
        text1: "text-white",
        text2: "text-emerald-400"
      },
      navMobileBg: "bg-emerald-800",
      navMobile: {
        active: "text-emerald-200",
        inactive: "text-white"
      }
    },
  };
  const currentTheme = themeStyles[theme];

  const handleAddToWishlist = async (book) => {
    const isCurrentlyInWishlist = wishlistItems.some(item => (item._id || item.id) === book.id);
    
    try {
      if (isCurrentlyInWishlist) {
        await removeFromWishlistCtx(book.id);
        toast.info(`"${book.title}" removed from wishlist`, {
          position: "bottom-right",
          autoClose: 2000,
        });
      } else {
        await addToWishlistCtx(book.id);
        toast.success(`"${book.title}" added to wishlist!`, {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      toast.error('Failed to update wishlist', {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const handleAddToCart = async (book) => {
    try {
      // Add to context (server + state)
      await addToCartCtx(book.id, 1);
      
      // Show success toast
      toast.success(`"${book.title}" added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart', {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };
  const handleRemoveFromCart = async (bookId) => {
    try {
      await removeFromCartCtx(bookId);
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };
  const handleRemoveFromWishlist = async (bookId) => {
    try {
      await removeFromWishlistCtx(bookId);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  
  // Reusable tab component
  const Tab = ({ name }) => (
    <motion.button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
        activeTab === name
          ? `${currentTheme.accentButtonBg} text-white shadow-md`
          : `${currentTheme.secondaryTextColor} ${theme === 'light' ? 'hover:bg-neutral-100' : 'hover:bg-gray-600'}`
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {name}
    </motion.button>
  );

  // Reusable book card component
  const BookCard = ({ book, onAddToWishlist, onAddToCart, wishlist }) => {
    const isWished = wishlist && Array.isArray(wishlist) && wishlist.some(item => (item._id || item.id) === book.id);

    return (
      <motion.div
        onClick={() => navigate(`/user/product/${book.id}`)}
        className={`flex flex-col items-center text-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
            : 'bg-white border border-gray-100 hover:shadow-lg'
        }`}
        whileHover={{ y: -5 }}
      >
        <motion.img
          src={book.cover}
          alt={book.title}
          className="w-32 h-48 rounded-lg shadow-md object-cover"
        />

        <h3 className="text-sm font-semibold mt-3 line-clamp-2">
          {book.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {book.author}
        </p>

        <p className="text-sm font-bold text-emerald-600 mt-2">
          {book.price}
        </p>

        <div className="flex items-center gap-1 mt-1">
          {[1,2,3,4,5].map((k) => {
            const active = k <= 4;
            return (
              <Star
                key={k}
                className={`h-4 w-4 ${active ? 'text-amber-500' : 'text-gray-300'}`}
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            );
          })}
          <span className="ml-1 text-xs text-gray-500">4.0</span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onAddToWishlist(book); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full ${isWished ? 'bg-red-100' : 'bg-gray-100'} hover:bg-red-200`}
            aria-label="Add to Favorite"
            title="Add to Favorite"
          >
            <Heart className={`h-5 w-5 ${isWished ? 'text-red-600' : 'text-gray-600'}`} />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onAddToCart(book); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
          >
            Add to Cart
          </motion.button>
        </div>
      </motion.div>
    );
  };


  // Render function for the wishlist view
  const renderWishlist = () => (
    <div className={`p-6 rounded-xl shadow-lg w-full ${currentTheme.cardBg} ${theme === 'dark' ? 'border border-gray-600' : 'border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold ${currentTheme.textColor}`}>Your Wishlist ({wishlist.length})</h2>
        <motion.button onClick={() => setView("dashboard")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <X className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
        </motion.button>
      </div>
      <div className="space-y-3">
        {wishlist.length > 0 ? wishlist.map(book => (
          <motion.div key={book.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}>
            <img src={book.cover || 'https://placehold.co/80x112/e5e7eb/4b5563?text=Book'} alt={book.title} className="w-16 h-24 rounded-lg shadow-md object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${currentTheme.textColor} truncate`}>{book.title}</h4>
              <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{book.author}</p>
              <p className={`text-sm font-bold ${currentTheme.accent} mt-1`}>{book.price || "Price not listed"}</p>
            </div>
            <motion.button onClick={() => handleRemoveFromWishlist(book.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Trash2 className={`h-5 w-5 ${theme === 'dark' ? 'text-red-400 hover:text-red-500' : 'text-red-500 hover:text-red-600'}`} />
            </motion.button>
          </motion.div>
        )) : (
          <p className={`text-center py-12 ${currentTheme.secondaryTextColor}`}>Your wishlist is empty. Add some books!</p>
        )}
      </div>
    </div>
  );

  // Render function for the cart view
  const renderCart = () => (
    <div className={`p-6 rounded-xl shadow-lg w-full ${currentTheme.cardBg} ${theme === 'dark' ? 'border border-gray-600' : 'border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold ${currentTheme.textColor}`}>Your Shopping Cart ({cart.length})</h2>
        <motion.button onClick={() => setView("dashboard")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <X className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
        </motion.button>
      </div>
      <div className="space-y-3">
        {cart.length > 0 ? cart.map(book => (
          <motion.div key={book.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}>
            <img src={book.cover || 'https://placehold.co/80x112/e5e7eb/4b5563?text=Book'} alt={book.title} className="w-16 h-24 rounded-lg shadow-md object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${currentTheme.textColor} truncate`}>{book.title}</h4>
              <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{book.author}</p>
              <p className={`text-sm font-bold ${currentTheme.accent} mt-1`}>{book.price || "Price not listed"}</p>
            </div>
            <motion.button onClick={() => handleRemoveFromCart(book.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Trash2 className={`h-5 w-5 ${theme === 'dark' ? 'text-red-400 hover:text-red-500' : 'text-red-500 hover:text-red-600'}`} />
            </motion.button>
          </motion.div>
        )) : (
          <p className={`text-center py-12 ${currentTheme.secondaryTextColor}`}>Your cart is empty.</p>
        )}
      </div>
    </div>
  );

  // Render function for the downloads modal
  const renderDownloadModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <p className={`text-lg font-semibold ${currentTheme.textColor}`}>Your downloads are empty!</p>
        <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>Get premium to read offline.</p>
        <motion.button
          onClick={() => {
            setShowDownloadModal(false);
            setView('premium');
          }}
          className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Premium
        </motion.button>
        <motion.button
          onClick={() => setShowDownloadModal(false)}
          className="mt-2 px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render function for the genres view
  const renderGenres = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor} mb-6`}>Explore Genres</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {genres.map(genre => (
          <motion.div
            key={genre.id}
            className={`flex flex-col items-center text-center p-6 rounded-xl ${currentTheme.cardBg} cursor-pointer`}
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            {genre.icon}
            <h3 className={`text-lg font-semibold mt-4 ${currentTheme.textColor}`}>{genre.name}</h3>
            <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>{genre.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render function for the bestsellers view
  const renderBestseller = () => (
    <div className="w-full">
      <BestsellerComponent theme={theme} />
    </div>
  );

  // Render function for the orders view
  const renderOrders = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor} mb-6`}>Your Orders</h2>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id || order.id} className={`p-5 rounded-2xl border ${currentTheme.inputBorder} ${currentTheme.inputBg} hover:shadow-lg transition-all duration-300`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className={`text-sm font-bold ${currentTheme.accent} uppercase tracking-wider`}>Order #{String(order._id || order.id).slice(-8).toUpperCase()}</p>
                  <p className={`text-xs ${currentTheme.secondaryTextColor} mt-1`}>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${
                    order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                  <p className={`text-lg font-black ${currentTheme.textColor}`}>₹{order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img 
                        src={item.product?.coverImage || "https://placehold.co/100x150?text=Book"} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold ${currentTheme.textColor} truncate`}>{item.title}</h4>
                      <p className={`text-xs ${currentTheme.secondaryTextColor} mt-1`}>Quantity: {item.quantity}</p>
                      <p className={`text-xs font-bold ${currentTheme.accent} mt-1`}>₹{item.price?.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <p className={`text-xs font-medium ${currentTheme.secondaryTextColor}`}>Payment Method: <span className="font-bold uppercase">{order.paymentMethod}</span></p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-xs font-bold ${currentTheme.accent} hover:underline`}
                >
                  View Details
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className={`w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4`}>
            <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <p className={`text-lg font-bold ${currentTheme.textColor}`}>
            No orders found
          </p>
          <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2 max-w-xs`}>
            Looks like you haven't placed any orders yet. Start exploring our collection!
          </p>
          <motion.button
            onClick={() => setView('popular')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            Go Shopping
          </motion.button>
        </div>
      )}
    </div>
  );

  // Render function for the premium view
  const renderPremium = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Premium Membership</h2>
      <p className={`${currentTheme.secondaryTextColor} mt-2`}>This section is under development. Please check back later.</p>
    </div>
  );

  // Render function for the address modal
  const renderAddressModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <h3 className={`text-2xl font-bold ${currentTheme.textColor} mb-4`}>Address</h3>
        <div className={`w-full text-left p-4 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} mb-4`}>
          {addresses.map((addr, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
              <div className={`flex flex-col`}>
                <p className={`${currentTheme.textColor} font-semibold`}>{addr.default ? "Default Address" : `Address ${index + 1}`}</p>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{addr.street}, {addr.city}</p>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{addr.state} {addr.zip}, {addr.country}</p>
              </div>
              <motion.button onClick={() => handleDeleteAddress(index)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Trash2 className="h-5 w-5 text-red-500" />
              </motion.button>
            </div>
          ))}
        </div>
        <motion.button
          onClick={() => {
            setShowAddressModal(false);
            setView('my-profile');
            setEditFormData(userProfile);
            setIsEditingProfile(true);
          }}
          className={`mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit Address
        </motion.button>
        <motion.button
          onClick={() => setShowAddressModal(false)}
          className="mt-2 px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render function for the display modal
  const renderDisplayModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <h3 className={`text-2xl font-bold ${currentTheme.textColor} mb-4`}>Display Settings</h3>
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex justify-between items-center w-full">
            <label className={`text-lg font-medium ${currentTheme.textColor}`}>Theme</label>
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Sun className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Moon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
          <div className="flex justify-between items-center w-full">
            <label className={`text-lg font-medium ${currentTheme.textColor}`}>Sidebar</label>
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${isSidebarOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarOpen ? 'Collapse' : 'Expand'}
            </motion.button>
          </div>
        </div>
        <motion.button
          onClick={() => setShowDisplayModal(false)}
          className="mt-6 px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render function for the my-profile view (static content)
  const ProfileListItem = ({ name, icon, onClick }) => (
    <motion.li
      onClick={onClick}
      className={`flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer ${currentTheme.navHover}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`${currentTheme.navIconColor}`}>
          {icon}
        </div>
        <span className={`text-lg ${currentTheme.textColor}`}>{name}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right h-5 w-5 ${currentTheme.navIconColor}`}><path d="m9 18 6-6-6-6"/></svg>
    </motion.li>
  );

  const calculateProfileCompletion = () => {
    const fields = ['name', 'email', 'phone', 'gender', 'address', 'bankAccount', 'ifscCode'];
    let filled = 0;
    fields.forEach(field => {
      if (userProfile[field] && String(userProfile[field]).trim() !== '') filled++;
    });
    if (profileImage && !profileImage.includes('placehold.co')) filled++;
    // Total fields = 7 text fields + 1 image = 8
    return Math.round((filled / 8) * 100);
  };

  const renderMyProfile = () => {
    const completion = calculateProfileCompletion();
    
    return (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg} flex flex-col`}>
      <div className="flex items-center space-x-4 mb-6">
        <motion.button onClick={() => {
            if(isEditingProfile) setIsEditingProfile(false);
            else setView('dashboard');
        }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-left ${currentTheme.textColor}`}><path d="m15 18-6-6 6-6"/></svg>
        </motion.button>
        <h2 className={`text-2xl font-bold flex-1 ${currentTheme.textColor}`}>{isEditingProfile ? 'Edit Profile' : 'My Profile'}</h2>
      </div>

      <div className="flex flex-col items-center mb-6 text-center">
        {/* Profile Image with Camera Overlay */}
        <div 
          className="relative group h-24 w-24 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2 cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="object-cover h-full w-full" />
          ) : (
            <span className={`text-4xl font-bold ${currentTheme.secondaryTextColor}`}>{getInitials(userProfile.name)}</span>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white h-8 w-8" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleProfileImageUpload} 
          />
        </div>

        {!isEditingProfile && (
            <>
                <h3 className={`text-xl font-semibold ${currentTheme.textColor}`}>{userProfile.name}</h3>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{userProfile.email}</p>
                
                {/* Completion Bar */}
                <div className="w-full max-w-xs mt-4">
                    <div className="flex justify-between text-xs font-medium mb-1">
                        <span className={currentTheme.secondaryTextColor}>Profile Completion</span>
                        <span className="text-emerald-500">{completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${completion}%` }}
                        ></div>
                    </div>
                </div>

                <motion.button
                  onClick={() => {
                      setEditFormData(userProfile);
                      setIsEditingProfile(true);
                  }}
                  className={`mt-6 px-6 py-2 text-sm rounded-full border-2 ${currentTheme.inputBorder} ${currentTheme.accent} font-semibold transition-colors duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Profile
                </motion.button>
            </>
        )}
      </div>

      {isEditingProfile ? (
        <form onSubmit={handleProfileUpdate} className="w-full max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>Full Name</label>
                    <input 
                        type="text" 
                        value={editFormData.name || ''} 
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} ${currentTheme.cardBg} ${currentTheme.textColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>Phone Number</label>
                    <input 
                        type="text" 
                        value={editFormData.phone || ''} 
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} ${currentTheme.cardBg} ${currentTheme.textColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>Gender</label>
                    <select 
                        value={editFormData.gender || 'female'} 
                        onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                        className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} ${currentTheme.cardBg} ${currentTheme.textColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                 <div>
                    <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>Email</label>
                    <input 
                        type="email" 
                        value={editFormData.email || ''} 
                        disabled
                        className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} bg-gray-100 dark:bg-gray-800 ${currentTheme.secondaryTextColor} cursor-not-allowed`}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>Address</label>
                    <textarea 
                        value={editFormData.address || ''} 
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                        className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} ${currentTheme.cardBg} ${currentTheme.textColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
                        rows="3"
                    />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>Bank Account</label>
                        <input 
                            type="text" 
                            value={editFormData.bankAccount || ''} 
                            onChange={(e) => setEditFormData({...editFormData, bankAccount: e.target.value})}
                            className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} ${currentTheme.cardBg} ${currentTheme.textColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${currentTheme.secondaryTextColor}`}>IFSC Code</label>
                        <input 
                            type="text" 
                            value={editFormData.ifscCode || ''} 
                            onChange={(e) => setEditFormData({...editFormData, ifscCode: e.target.value})}
                            className={`w-full p-2 rounded-lg border ${currentTheme.inputBorder} ${currentTheme.cardBg} ${currentTheme.textColor} focus:ring-2 focus:ring-emerald-500 outline-none`}
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button 
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 font-medium"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </form>
      ) : (
        <div className="w-full">
            <ul className={`divide-y ${theme === 'light' ? 'divide-gray-200' : 'divide-gray-800'}`}>
            <ProfileListItem name="Favourites" icon={<Heart />} onClick={() => setView('wishlist')} />
            <ProfileListItem name="Downloads" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-download ${currentTheme.textColor}`}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>} onClick={() => setShowDownloadModal(true)} />
            <div className={`h-px my-4 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
            <ProfileListItem name="Address" icon={<MapPin />} onClick={() => setShowAddressModal(true)} />
            <ProfileListItem name="Display" icon={<Monitor />} onClick={() => setShowDisplayModal(true)} />
            <ProfileListItem name="Help" icon={<HelpCircle />} onClick={() => setShowHelpModal(true)} />
            <ProfileListItem name="Logout" icon={<LogOut />} onClick={() => setShowLogoutConfirmation(true)} />
            </ul>
        </div>
      )}
    </div>
    );
  };



  // Render function for the static settings view
  const renderSettings = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Settings Page Placeholder</h2>
      <p className={`${currentTheme.secondaryTextColor} mt-2`}>
        This is the internal view placeholder for the 'Settings' link. 
        It reflects the navigation to: 
        <span className="font-mono text-emerald-500"> /user/settings</span>
      </p>
    </div>
  );

  // Main content rendering logic based on the current view
  const renderContent = () => {
    switch (view) {
      case "dashboard":
case "home": {
  // Filter books based on search term
  const filteredBooks = searchTerm.trim() === ""
    ? booksFromDB
    : booksFromDB.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.title?.toLowerCase().includes(searchLower) ||
          product.author?.toLowerCase().includes(searchLower) ||
          product.isbn?.toLowerCase().includes(searchLower) ||
          product.publisher?.toLowerCase().includes(searchLower)
        );
      });

  // 🔥 SORT ALL BOOKS BY MOST RECENT FIRST
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  // 🧠 GROUP BY CATEGORY + TRACK LATEST DATE PER CATEGORY
  const groupedByCategory = {};
  const categoryLatestDate = {};

  sortedBooks.forEach(product => {
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      product.categories.forEach(category => {
        if (!groupedByCategory[category]) {
          groupedByCategory[category] = [];
          categoryLatestDate[category] = new Date(
            product.updatedAt || product.createdAt
          );
        }

        groupedByCategory[category].push(product);

        // Update category latest date if this product is newer
        const productDate = new Date(product.updatedAt || product.createdAt);
        if (productDate > categoryLatestDate[category]) {
          categoryLatestDate[category] = productDate;
        }
      });
    }
  });

  // 🔥 SORT CATEGORIES BY MOST RECENT ACTIVITY
  const categories = Object.keys(groupedByCategory).sort(
    (a, b) => categoryLatestDate[b] - categoryLatestDate[a]
  );

  return (
    <div className={`flex-1 rounded-xl shadow-md ${currentTheme.cardHover}`}>
      {loadingBooks ? (
        <div className="text-center text-lg p-6">Loading books...</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 p-6">
          No books available.
        </div>
      ) : (
        <div className="space-y-12 p-6">
          {categories.map(category => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`rounded-xl p-6 shadow-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Category Header */}
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>
                  {category}
                </h2>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>
                  {groupedByCategory[category].length} books
                </p>
              </div>

              {/* Books Grid (already sorted by most recent) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {groupedByCategory[category].map(product => {
                  const book = mapProductToBookCard(product);
                  return (
                    <BookCard
                      key={book.id}
                      book={book}
                      onAddToWishlist={handleAddToWishlist}
                      onAddToCart={handleAddToCart}
                      wishlist={wishlist}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


      case "wishlist":
        return renderWishlist();
      case "cart":
        return renderCart();
      case "filters":
        return renderGenres();
      case "bestseller":
        return renderBestseller();
      case "your-orders":
        return renderOrders();
      case "premium":
        return renderPremium();
      case "my-profile":
        return renderMyProfile();
      case "settings":
        return renderSettings();
      default:
        return (
          <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
            <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>404 - View Not Found</h2>
            <p className={`${currentTheme.secondaryTextColor} mt-2`}>The requested view could not be loaded.</p>
          </div>
        );
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="h-6 w-6" />, view: 'dashboard' },
    { name: 'Bestseller', icon: <Award className="h-6 w-6" />, view: 'bestseller' },
    // Genres now directly opens the category page
    { 
      name: 'Genres', 
      icon: <ListFilter className="h-6 w-6" />, 
      view: 'genres', 
      onClick: () => { window.location.href = '/user/category'; } 
    },
    { name: 'Premium', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card h-6 w-6"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>, view: 'premium' },
    { name: 'Your Orders', icon: <ShoppingBag className="h-6 w-6" />, view: 'your-orders' },
    // Settings now uses onClick to navigate to /user/settings
    { 
      name: 'Settings', 
      icon: <Settings className="h-6 w-6" />, 
      view: 'settings', 
      onClick: () => { window.location.href = '/user/settings'; } 
    },
    { name: 'Help', icon: <HelpCircle className="h-6 w-6" />, view: 'help', onClick: () => setShowHelpModal(true) },
  ];

  const ProfilePopup = () => (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`absolute top-16 right-4 w-72 p-4 rounded-lg shadow-xl z-50 ${currentTheme.cardBg}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div 
          className="relative group h-20 w-20 rounded-full flex items-center justify-center bg-emerald-500 text-white text-3xl font-bold overflow-hidden cursor-pointer"
          onClick={() => {
             window.location.assign('/user/profile');
          }}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="object-cover h-full w-full" />
          ) : (
            <span className="text-3xl font-bold">{getInitials(userProfile.name)}</span>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white h-6 w-6" />
          </div>
        </div>
        <div className="text-center">
          <h3 className={`text-lg font-semibold ${currentTheme.textColor}`}>{userProfile.name}</h3>
          <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{userProfile.email}</p>
        </div>
        <div className="flex w-full space-x-2">
          <motion.button
            onClick={() => {
              // Directs to My Profile view, which contains all profile options
              setView('my-profile');
              setShowProfilePopup(false);
            }}
            className={`flex-1 px-4 py-2 text-sm rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white font-semibold transition-colors duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Profile
          </motion.button>
          <motion.button
            onClick={() => setShowLogoutConfirmation(true)}
            className={`flex-1 px-4 py-2 text-sm rounded-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.div>
  );


  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.appBg}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 256 : 72 }}
        animate={{ width: isSidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.2 }}
        className={`flex flex-col p-4 shadow-xl z-30 ${currentTheme.sidebarBg} transition-all duration-200`}
      >
        {/* Sidebar Header (Logo moved to main Header) */}
        <div className={`flex items-center ${isSidebarOpen ? 'justify-end' : 'justify-center'} mb-8 h-10`}>
          {/* Show a placeholder or the collapsed icon, since the full logo is now in the main header */}
          {!isSidebarOpen && (
            <motion.button
              onClick={() => setView('dashboard')}
              className="flex items-center justify-center bg-emerald-700 h-10 w-10 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Book className="h-6 w-6 text-white" />
            </motion.button>
          )}
          <motion.button onClick={() => setIsSidebarOpen(!isSidebarOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={isSidebarOpen ? '' : 'ml-2'}>
            <Menu className={`h-6 w-6 ${currentTheme.navIconColor} transition-transform duration-200 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
          </motion.button>
        </div>
        <nav className="flex-1 space-y-4 w-full">
          {menuItems.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => {
                // Use onClick if defined (for external navigation like Genres and Settings), otherwise use internal setView.
                if (item.onClick) {
                  item.onClick();
                } else {
                  setView(item.view);
                }
              }}
              className={`relative flex items-center w-full rounded-lg py-2 px-3 transition-colors duration-200 ${
                view === item.view
                  ? `${currentTheme.accentButtonBg} text-white shadow-md`
                  : `${currentTheme.navTextColor} ${currentTheme.navHover}`
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => !isSidebarOpen && setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`${view === item.view ? 'text-white' : currentTheme.navIconColor}`}>
                {item.icon}
              </div>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 font-semibold"
                >
                  {item.name}
                </motion.span>
              )}
              {!isSidebarOpen && hoveredItem === item.name && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-40"
                >
                  {item.name}
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>
        <div className="mt-8">
          <motion.button
            onClick={handleThemeToggle}
            className={`flex items-center w-full rounded-lg py-2 px-3 transition-colors duration-200 ${currentTheme.navTextColor} ${currentTheme.navHover}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => !isSidebarOpen && setHoveredItem('Theme')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {theme === 'light' ? <Sun className={`h-6 w-6 ${currentTheme.navIconColor}`} /> : <Moon className={`h-6 w-6 ${currentTheme.navIconColor}`} />}
            {isSidebarOpen && (
              <span className="ml-4 font-semibold">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
            {!isSidebarOpen && hoveredItem === 'Theme' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-40"
              >
                Toggle Theme
              </motion.div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header - MODIFIED LAYOUT */}
        <header className={`p-4 shadow-md flex items-center justify-between z-20 sticky top-0 ${currentTheme.headerBg}`}>
          
          {/* 1. Logo (Left Corner) - Same style kept */}
          <motion.button
              onClick={() => setView('dashboard')}
              className="flex items-center cursor-pointer shrink-0 min-w-[150px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
          >
              <span className={`text-3xl font-bold ${currentTheme.pagify.text1}`}> Pa </span>
              <span className={`text-5xl font-bold leading-none ${currentTheme.pagify.text2}`}> G </span>
              <span className={`text-3xl font-bold ${currentTheme.pagify.text1}`}> ify </span>
          </motion.button>
          
          {/* 2. Search Bar (Middle) - MAX-WIDTH INCREASED from max-w-xl to max-w-2xl */}
          <div className="relative flex-1 max-w-2xl mx-8">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${currentTheme.secondaryTextColor}`} />
            <input
              type="text"
              placeholder="Search for books, authors, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-2 pl-10 pr-10 rounded-full border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
            />
            {searchTerm && (
              <motion.button
                onClick={() => setSearchTerm("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Clear search"
              >
                <X className={`h-5 w-5 ${currentTheme.secondaryTextColor}`} />
              </motion.button>
            )}
          </div>
          
          {/* 3. Icons (Right) */}
          <div className="flex items-center space-x-4 shrink-0">
            <motion.button
              onClick={() => { window.location.href = '/user/wishlist'; }} // Wishlist Link
              className="relative p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredHeaderItem('Wishlist')}
              onMouseLeave={() => setHoveredHeaderItem(null)}
            >
              <Heart className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                  {wishlistCount}
                </span>
              )}
              {hoveredHeaderItem === 'Wishlist' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Wishlist
                </motion.div>
              )}
            </motion.button>
            <motion.button
              onClick={() => { window.location.href = '/user/cart'; }} // Cart Link
              className="relative p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredHeaderItem('Cart')}
              onMouseLeave={() => setHoveredHeaderItem(null)}
            >
              <ShoppingCart className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white text-xs font-bold">
                  {cartCount}
                </span>
              )}
              {hoveredHeaderItem === 'Cart' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Cart
                </motion.div>
              )}
            </motion.button>
            <motion.button
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-500 flex items-center justify-center bg-gray-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredHeaderItem('Profile')}
              onMouseLeave={() => setHoveredHeaderItem(null)}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
              )}
              {hoveredHeaderItem === 'Profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Profile
                </motion.div>
              )}
            </motion.button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Popups and Modals */}
      {showProfilePopup && <ProfilePopup />}
      {showLogoutConfirmation && <LogoutConfirmationModal onYes={handleLogout} onNo={() => setShowLogoutConfirmation(false)} />}
      {showLogoutMessage && <MessageModal message="You have been successfully logged out!" onClose={() => setShowLogoutMessage(false)} />}
      {showConfirmation && <MessageModal message={confirmationMessage} onClose={() => setShowConfirmation(false)} />}
      {showDownloadModal && renderDownloadModal()}
      {showAddressModal && renderAddressModal()}
      {showDisplayModal && renderDisplayModal()}
      {showHelpModal && <HelpModal />}
    </div>
  );
}
