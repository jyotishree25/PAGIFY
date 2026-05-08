// frontend/src/utils/wishlistUtils.js

/**
 * Get wishlist items from localStorage
 */
const keyFor = (userId) => (userId ? `wishlist:${userId}` : 'wishlist');

export const getWishlistFromStorage = (userId) => {
  try {
    const storedWishlist = localStorage.getItem(keyFor(userId));
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (err) {
    console.error('Error reading wishlist from localStorage:', err);
    return [];
  }
};

/**
 * Save wishlist items to localStorage
 */
export const saveWishlistToStorage = (wishlistItems, userId) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(wishlistItems));
  } catch (err) {
    console.error('Error saving wishlist to localStorage:', err);
  }
};

/**
 * Add item to wishlist (or remove if already exists)
 */
export const toggleWishlist = (productId, userId) => {
  const currentWishlist = getWishlistFromStorage(userId);
  const existingItem = currentWishlist.find(item => item._id === productId);

  let updatedWishlist;
  if (existingItem) {
    // Remove from wishlist
    updatedWishlist = currentWishlist.filter(item => item._id !== productId);
  } else {
    // Add to wishlist
    updatedWishlist = [...currentWishlist, { _id: productId }];
  }

  saveWishlistToStorage(updatedWishlist, userId);
  return updatedWishlist;
};

/**
 * Check if item is in wishlist
 */
export const isInWishlist = (productId, userId) => {
  const currentWishlist = getWishlistFromStorage(userId);
  return currentWishlist.some(item => item._id === productId);
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = (productId, userId) => {
  const currentWishlist = getWishlistFromStorage(userId);
  const updatedWishlist = currentWishlist.filter(item => item._id !== productId);
  saveWishlistToStorage(updatedWishlist, userId);
  return updatedWishlist;
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = (userId) => {
  localStorage.removeItem(keyFor(userId));
  return [];
};

/**
 * Get total items in wishlist
 */
export const getWishlistItemCount = (userId) => {
  return getWishlistFromStorage(userId).length;
};
