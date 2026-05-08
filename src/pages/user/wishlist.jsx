import React, { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getWishlistFromStorage } from '../../utils/wishlistUtils';
import { useInventory } from '../../context/InventoryContext.jsx';
import { fetchWishlist as fetchWishlistAPI } from '../../services/inventoryApi';
import UserHeader from "../../components/common/UserHeader.jsx";

const themeStyles = {
  light: {
    appBg: "bg-white",
    headerBg: "bg-neutral-100",
    cardBg: "bg-white",
    cardHover: "bg-neutral-100",
    textColor: "text-gray-800",
    secondaryTextColor: "text-gray-500",
    accent: "text-emerald-700",
    accentButtonBg: "bg-emerald-700",
    accentButtonHover: "hover:bg-emerald-800",
    headerIconColor: "text-black",
  },
  dark: {
    appBg: "bg-gray-900",
    headerBg: "bg-gray-600",
    cardBg: "bg-gray-700",
    cardHover: "bg-gray-800",
    textColor: "text-gray-100",
    secondaryTextColor: "text-gray-400",
    accent: "text-emerald-400",
    accentButtonBg: "bg-emerald-700",
    accentButtonHover: "hover:bg-emerald-600",
    headerIconColor: "text-gray-100",
  },
};

const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

// Wishlist Item Card Component
const WishlistItem = ({ item, onRemove, onMoveToCart, theme = 'light' }) => {
  const currentTheme = themeStyles[theme];
  return (
    <div
      className={`flex items-start ${currentTheme.cardBg} p-4 rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm mb-4 transition-all duration-300 ${theme === 'dark' ? 'hover:shadow-lg hover:bg-gray-700' : 'hover:shadow-md'}`}
    >
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={item.coverImage || "https://placehold.co/96x128/e5e7eb/4b5563?text=Book"}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://placehold.co/96x128/e5e7eb/4b5563?text=Book";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${currentTheme.textColor} line-clamp-2`}>{item.title}</h3>
          <p className={`text-sm ${currentTheme.secondaryTextColor} mt-1`}>By {item.author || 'Unknown'}</p>
          <p className={`text-xs ${currentTheme.secondaryTextColor} mt-1 opacity-70`}>{item.category || 'General'}</p>
          
          <div className="flex items-center justify-between mt-4">
            <span className={`text-lg font-bold ${currentTheme.accent}`}>{formatCurrency(item.price)}</span>
            
            {/* Stock Status */}
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              item.stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onMoveToCart(item)}
            disabled={item.stock <= 0}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>
          
          <button
            onClick={() => onRemove(item._id)}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WishlistPage() {
  const [theme, setTheme] = useState("light");
  const currentTheme = themeStyles[theme];
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const { addToCart: addToCartCtx, removeFromWishlist: removeFromWishlistCtx, setUserId: setCtxUser, theme: globalTheme } = useInventory();

  // Sync local theme state with global theme
  useEffect(() => {
    setTheme(globalTheme);
  }, [globalTheme]);

  // Load wishlist items and theme on mount
  useEffect(() => {
    initAndLoad();
  }, []);

  const initAndLoad = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const me = await axios.get('https://pagify-g5g5.onrender.com/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } });
          const userData = me.data?.user;
          const uid = userData?._id || userData?.id;
          if (uid) {
            setUserId(uid);
            setCtxUser(uid);
            setUserProfile(userData);
            setProfileImage(userData?.profilePicture);
          }
          const serverItems = await fetchWishlistAPI();
          // serverItems are now populated product objects
          setWishlistItems(serverItems);
          setIsLoading(false);
          return;
        } catch (err) {
          console.error('Error fetching server wishlist:', err);
        }
      } else {
        // Only use local storage if NOT logged in
        const storedWishlist = getWishlistFromStorage(null);
        const ids = storedWishlist.map(i => i._id);
        
        if (ids.length === 0) {
          setWishlistItems([]);
          setIsLoading(false);
          return;
        }

        try {
          const response = await axios.post('https://pagify-g5g5.onrender.com/api/v1/cart', {
            productIds: ids
          });
          if (response.data && response.data.status === 'success' && response.data.products) {
            setWishlistItems(response.data.products);
          }
        } catch (err) {
          console.error('Error fetching guest wishlist details:', err);
        }
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlistCtx(productId);
    const updatedItems = wishlistItems.filter(item => item._id !== productId);
    setWishlistItems(updatedItems);
    toast.info('Item removed from wishlist');
  };

  const handleMoveToCart = async (item) => {
    if (item.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }

    try {
      await addToCartCtx(item._id, 1);
      await removeFromWishlistCtx(item._id);
      const updatedItems = wishlistItems.filter(p => p._id !== item._id);
      setWishlistItems(updatedItems);

      toast.success(`"${item.title}" moved to cart!`);
    } catch (err) {
      console.error('Error moving to cart:', err);
      toast.error('Failed to move to cart');
    }
  };

  // total calculation removed (not used)

  return (
    <div className={`min-h-screen flex flex-col ${currentTheme.appBg}`}>
      <UserHeader 
        onLogoClick={() => window.location.assign('/user/home')} 
        userProfile={userProfile}
        profileImage={profileImage}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button 
                onClick={() => window.location.assign('/user/home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    theme === 'dark' 
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
            >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back to Home</span>
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className={`text-lg ${currentTheme.secondaryTextColor}`}>Loading wishlist...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className={`text-center py-16 rounded-lg ${currentTheme.cardBg} border-2 border-dashed border-gray-300`}>
              <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className={`text-xl font-semibold ${currentTheme.textColor} mb-2`}>Your wishlist is empty</p>
              <p className={`${currentTheme.secondaryTextColor} mb-6`}>Start adding books you love!</p>
              <a
                href="/user/home"
                className={`inline-block px-6 py-3 ${currentTheme.accentButtonBg} text-white rounded-lg font-semibold`}
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <>
              {/* Wishlist Items */}
              {wishlistItems.map(item => (
                <WishlistItem
                  key={item._id}
                  item={item}
                  onRemove={handleRemoveFromWishlist}
                  onMoveToCart={handleMoveToCart}
                  theme={theme}
                />
              ))}

              {/* Summary Card */}
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="text-red-500" />
                  <h2 className={`${currentTheme.textColor} text-xl font-semibold`}>My Wishlist</h2>
                </div>
                <button
                  onClick={async () => {
                    const availableItems = wishlistItems.filter(item => item.stock > 0);
                    if (availableItems.length === 0) {
                      toast.error('No items available to add to cart');
                      return;
                    }
                    
                    for (const item of availableItems) {
                      await addToCartCtx(item._id, 1);
                    }
                    
                    setWishlistItems([]);
                    toast.success(`${availableItems.length} items added to cart!`);
                  }}
                  className={`w-full py-3 ${currentTheme.accentButtonBg} text-white rounded-lg font-semibold flex items-center justify-center gap-2 ${currentTheme.accentButtonHover} transition-colors`}
                >
                  <ShoppingCart size={20} />
                  Add All Available Items to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className={`flex-shrink-0 p-6 text-center text-sm ${currentTheme.secondaryTextColor} border-t`}>
        &copy; 2024 PaGify. All Rights Reserved.
      </footer>
    </div>
  );
}
