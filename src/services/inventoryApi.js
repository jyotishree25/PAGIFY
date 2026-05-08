import axios from 'axios';

const API = 'http://localhost:8000/api/v1';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWishlist = async () => {
  const res = await axios.get(`${API}/inventory/wishlist`, { headers: authHeaders() });
  return res.data?.items || [];
};

export const addWishlist = async (productId) => {
  const res = await axios.post(`${API}/inventory/wishlist`, { productId }, { headers: authHeaders() });
  return res.data?.items || [];
};

export const removeWishlist = async (productId) => {
  const res = await axios.delete(`${API}/inventory/wishlist/${productId}`, { headers: authHeaders() });
  return res.data?.items || [];
};

export const getWishlistCount = async () => {
  const res = await axios.get(`${API}/inventory/wishlist/count`, { headers: authHeaders() });
  return res.data?.count || 0;
};

export const fetchCart = async () => {
  const res = await axios.get(`${API}/inventory/cart`, { headers: authHeaders() });
  return res.data?.items || [];
};

export const addCart = async (productId, quantity = 1) => {
  const res = await axios.post(`${API}/inventory/cart/add`, { productId, quantity }, { headers: authHeaders() });
  return res.data?.items || [];
};

export const updateCartItem = async (productId, quantity) => {
  const res = await axios.patch(`${API}/inventory/cart`, { productId, quantity }, { headers: authHeaders() });
  return res.data?.items || [];
};

export const removeCart = async (productId) => {
  const res = await axios.delete(`${API}/inventory/cart/${productId}`, { headers: authHeaders() });
  return res.data?.items || [];
};

export const getCartCount = async () => {
  const res = await axios.get(`${API}/inventory/cart/count`, { headers: authHeaders() });
  return res.data?.count || 0;
};

export const createOrder = async (orderData) => {
  const res = await axios.post(`${API}/orders`, orderData, { headers: authHeaders() });
  return res.data;
};

export const fetchMyOrders = async () => {
   const res = await axios.get(`${API}/orders/my-orders`, { headers: authHeaders() });
   return res.data?.orders || [];
 };
