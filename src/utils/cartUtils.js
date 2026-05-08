// frontend/src/utils/cartUtils.js

/**
 * Get cart items from localStorage
 */
const keyFor = (userId) => (userId ? `cart:${userId}` : 'cart');

export const getCartFromStorage = (userId) => {
  try {
    const storedCart = localStorage.getItem(keyFor(userId));
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (err) {
    console.error('Error reading cart from localStorage:', err);
    return [];
  }
};

/**
 * Save cart items to localStorage
 */
export const saveCartToStorage = (cartItems, userId) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(cartItems));
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
};

/**
 * Add item to cart (or increase quantity if exists)
 */
export const addToCart = (productId, quantity = 1, userId) => {
  const currentCart = getCartFromStorage(userId);
  const existingItem = currentCart.find(item => item._id === productId);

  let updatedCart;
  if (existingItem) {
    updatedCart = currentCart.map(item =>
      item._id === productId
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    updatedCart = [...currentCart, { _id: productId, quantity }];
  }

  saveCartToStorage(updatedCart, userId);
  return updatedCart;
};

/**
 * Remove item from cart
 */
export const removeFromCart = (productId, userId) => {
  const currentCart = getCartFromStorage(userId);
  const updatedCart = currentCart.filter(item => item._id !== productId);
  saveCartToStorage(updatedCart, userId);
  return updatedCart;
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = (productId, quantity, userId) => {
  const currentCart = getCartFromStorage(userId);
  
  if (quantity <= 0) {
    return removeFromCart(productId, userId);
  }

  const updatedCart = currentCart.map(item =>
    item._id === productId
      ? { ...item, quantity }
      : item
  );

  saveCartToStorage(updatedCart, userId);
  return updatedCart;
};

/**
 * Get total number of items in cart
 */
export const getCartItemCount = (userId) => {
  const cart = getCartFromStorage(userId);
  return cart.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Clear entire cart
 */
export const clearCart = (userId) => {
  localStorage.setItem(keyFor(userId), JSON.stringify([]));
};
