import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCartCount as getCartCountAPI,
  getWishlistCount as getWishlistCountAPI,
  fetchWishlist as fetchWishlistAPI,
  addCart as addCartAPI,
  removeCart as removeCartAPI,
  updateCartItem as updateCartItemAPI,
  addWishlist as addWishlistAPI,
  removeWishlist as removeWishlistAPI,
} from '../services/inventoryApi';
import { addToCart as addToCartLocal, removeFromCart as removeFromCartLocal, updateCartItemQuantity, getCartFromStorage } from '../utils/cartUtils';
import { toggleWishlist as toggleWishlistLocal, removeFromWishlist as removeFromWishlistLocal, getWishlistFromStorage, saveWishlistToStorage } from '../utils/wishlistUtils';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appTheme') {
        setTheme(e.newValue || 'light');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    // Dispatch a storage event manually for the same window to react
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const token = localStorage.getItem('token');
    try {
      const [c, wItems] = await Promise.all([getCartCountAPI(), fetchWishlistAPI()]);
      setCartCount(c);
      setWishlistCount(wItems.length);
      setWishlistItems(wItems);
    } catch (err) {
      // Only fallback to local storage if NOT logged in or if API fails
      if (!token) {
        const uid = userId;
        const cartLocal = getCartFromStorage(uid);
        const wishLocal = getWishlistFromStorage(uid);
        const localCount = cartLocal.reduce((s, it) => s + (it.quantity || 0), 0);
        setCartCount(localCount);
        setWishlistCount(wishLocal.length);
        setWishlistItems(wishLocal);
      } else {
        console.error('Error fetching counts from API:', err);
      }
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem('token');
    try {
      const items = await addCartAPI(productId, quantity);
      const c = items.reduce((s, it) => s + (it.quantity || 0), 0);
      setCartCount(c);
    } catch (err) {
      if (!token) {
        const updated = addToCartLocal(productId, quantity, userId);
        const c = updated.reduce((s, it) => s + (it.quantity || 0), 0);
        setCartCount(c);
      } else {
        console.error('Error adding to cart API:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const items = await removeCartAPI(productId);
      const c = items.reduce((s, it) => s + (it.quantity || 0), 0);
      setCartCount(c);
    } catch (err) {
      if (!token) {
        const updated = removeFromCartLocal(productId, userId);
        const c = updated.reduce((s, it) => s + (it.quantity || 0), 0);
        setCartCount(c);
      } else {
        console.error('Error removing from cart API:', err);
      }
    }
  };

  const setCartItemQuantity = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    try {
      const items = await updateCartItemAPI(productId, quantity);
      const c = items.reduce((s, it) => s + (it.quantity || 0), 0);
      setCartCount(c);
    } catch (err) {
      if (!token) {
        const updated = updateCartItemQuantity(productId, quantity, userId);
        const c = updated.reduce((s, it) => s + (it.quantity || 0), 0);
        setCartCount(c);
      } else {
        console.error('Error updating cart item quantity API:', err);
      }
    }
  };

  const addToWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const items = await addWishlistAPI(productId);
      setWishlistCount(items.length);
      setWishlistItems(items);
    } catch (err) {
      if (!token) {
        const current = getWishlistFromStorage(userId);
        if (!current.some(item => item._id === productId)) {
          const updated = [...current, { _id: productId }];
          saveWishlistToStorage(updated, userId);
          setWishlistCount(updated.length);
          setWishlistItems(updated);
        }
      } else {
        console.error('Error adding to wishlist API:', err);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const items = await removeWishlistAPI(productId);
      setWishlistCount(items.length);
      setWishlistItems(items);
    } catch (err) {
      if (!token) {
        const updated = removeFromWishlistLocal(productId, userId);
        setWishlistCount(updated.length);
        setWishlistItems(updated);
      } else {
        console.error('Error removing from wishlist API:', err);
      }
    }
  };

  const syncLocalDataWithServer = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Sync Cart
      const localCart = getCartFromStorage(null);
      if (localCart.length > 0) {
        for (const item of localCart) {
          await addCartAPI(item._id, item.quantity);
        }
        // Clear guest cart
        localStorage.removeItem('cart');
      }

      // Sync Wishlist
      const localWishlist = getWishlistFromStorage(null);
      if (localWishlist.length > 0) {
        for (const item of localWishlist) {
          await addWishlistAPI(item._id);
        }
        // Clear guest wishlist
        localStorage.removeItem('wishlist');
      }

      await fetchCounts();
    } catch (err) {
      console.error('Error syncing local data with server:', err);
    }
  };

  const value = useMemo(
    () => ({
      cartCount,
      wishlistCount,
      wishlistItems,
      fetchCounts,
      addToCart,
      removeFromCart,
      setCartItemQuantity,
      addToWishlist,
      removeFromWishlist,
      syncLocalDataWithServer,
      setUserId,
      userId,
      theme,
      updateTheme,
    }),
    [cartCount, wishlistCount, wishlistItems, userId, theme]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => useContext(InventoryContext);
