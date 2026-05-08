import React, { useState, useRef, useEffect } from "react";
import { Heart, ShoppingCart, Search, User, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "../../context/InventoryContext.jsx";

export default function UserHeader({
  onLogoClick,
  showSearch = false,
  searchTerm = "",
  onSearchChange,
  userProfile,
  profileImage,
}) {
  const { cartCount, wishlistCount } = useInventory();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const popupRef = useRef(null);

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
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.assign('/user/login');
  };

  const LogoutConfirmationModal = ({ onYes, onNo }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[100]"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 rounded-2xl shadow-2xl bg-white flex flex-col items-center text-center max-w-sm w-full mx-4"
      >
        <p className="text-xl font-bold text-gray-800">Are you sure you want to log out?</p>
        <p className="text-sm text-gray-500 mt-2">This will end your current session.</p>
        <div className="flex space-x-4 mt-6 w-full">
          <motion.button
            onClick={onYes}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Yes, Log out
          </motion.button>
          <motion.button
            onClick={onNo}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            No, Stay
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  const ProfilePopup = () => (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 right-4 w-72 p-5 rounded-2xl shadow-2xl z-50 bg-white border border-gray-100"
    >
      <div className="flex flex-col items-center space-y-4">
        <div 
          className="relative group h-20 w-20 rounded-full flex items-center justify-center bg-emerald-500 text-white text-3xl font-bold overflow-hidden cursor-pointer shadow-lg"
          onClick={() => {
             window.location.assign('/user/home?view=my-profile'); // Navigate back to home/profile
          }}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="object-cover h-full w-full" />
          ) : (
            <span className="text-3xl font-bold">{getInitials(userProfile?.name || 'User')}</span>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white h-6 w-6" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800">{userProfile?.name || 'User Name'}</h3>
          <p className="text-sm text-gray-500">{userProfile?.email || 'user@example.com'}</p>
        </div>
        <div className="flex w-full flex-col gap-2 pt-2">
          <motion.button
            onClick={() => {
              window.location.assign('/user/home?view=my-profile');
            }}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View My Profile
          </motion.button>
          <motion.button
            onClick={() => setShowLogoutConfirmation(true)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 font-bold transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Log Out
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <header className="p-4 shadow-md flex items-center justify-between z-20 sticky top-0 bg-white">
        <button
          onClick={onLogoClick}
          className="flex items-center cursor-pointer shrink-0 min-w-[150px]"
        >
          <span className="text-3xl font-bold text-gray-800"> Pa </span>
          <span className="text-5xl font-bold leading-none text-emerald-600"> G </span>
          <span className="text-3xl font-bold text-gray-800"> ify </span>
        </button>

        {showSearch ? (
          <div className="relative flex-1 max-w-2xl mx-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for books, authors, or ISBN..."
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full py-2 pl-10 pr-3 rounded-full border-2 border-emerald-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center space-x-4 shrink-0">
          <button
            onClick={() => { window.location.href = "/user/wishlist"; }}
            className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="h-6 w-6 text-gray-700" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { window.location.href = "/user/cart"; }}
            className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
            title="Cart"
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-500 flex items-center justify-center bg-gray-100 hover:scale-105 transition-transform"
            title="Profile"
            aria-label="Profile"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showProfilePopup && <ProfilePopup />}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {showLogoutConfirmation && (
          <LogoutConfirmationModal 
            onYes={handleLogout} 
            onNo={() => setShowLogoutConfirmation(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
