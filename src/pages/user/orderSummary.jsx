import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, ArrowLeft, ChevronDown, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCartFromStorage, saveCartToStorage } from '../../utils/cartUtils';
import { fetchCart as fetchCartAPI, createOrder as createOrderAPI } from '../../services/inventoryApi';
import { useInventory } from '../../context/InventoryContext.jsx';
import UserHeader from "../../components/common/UserHeader.jsx";


const formatCurrency = (amount) => {
  const val = Number(amount) || 0;
  return `₹${val.toFixed(2)}`;
};


// Component for a single item in the order summary
const ProductItem = ({ product }) => {
  if (!product) return null;
  const { title, price, quantity, coverImage, categories, description, author } = product;

  const displayCategory = categories && Array.isArray(categories) ? categories.join(', ') : 'General';

  return (
    <div className="flex items-start justify-between py-6 border-b border-gray-100 last:border-b-0">
      
      {/* LEFT SIDE: Image + Details */}
      <div className="flex flex-col md:flex-row items-start md:items-center w-full pr-4">
        {/* Image Card */}
        <div className="w-24 h-32 flex-shrink-0 mr-6 rounded-lg overflow-hidden shadow-md">
          <img
            src={coverImage || "https://placehold.co/80x120/e5e7eb/4b5563?text=Book"}
            alt={title || "Book"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/80x120/e5e7eb/4b5563?text=Book";
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-grow mt-3 md:mt-0">
          <h3 className="text-gray-900 font-black text-xl mb-1">{title || "Untitled Book"}</h3>
          {author && <p className="text-emerald-700 text-base font-bold mb-2 italic underline decoration-emerald-200 underline-offset-4">by {author}</p>}
          <div className="flex flex-wrap gap-2 mb-3">
            {categories && Array.isArray(categories) ? categories.map((cat, index) => (
              <span key={index} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-tighter">
                {cat}
              </span>
            )) : (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-tighter">
                General
              </span>
            )}
          </div>
          {description && (
            <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-400">
              <p className="text-gray-600 text-sm leading-relaxed italic">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>
        
      {/* RIGHT SIDE: Price Only */}
      <div className="flex-shrink-0 mt-3 md:mt-0 text-right flex flex-col items-end justify-center self-stretch">
           <p className="text-gray-900 font-black text-2xl">{formatCurrency((Number(price) || 0) * (Number(quantity) || 0))}</p>
           <p className="text-emerald-700 font-bold text-sm mt-1">Qty: {quantity || 0}</p>
      </div>
      
    </div>
  );
};


// Component for delivery info
const DeliveryInfo = ({ cartItems, address }) => {
  const getDeliveryDateRange = () => {
    const today = new Date();
    
    // Logic based on stock:
    // If all items have high stock (>20), delivery is faster (4-5 days)
    // If any item has medium stock (5-20), delivery is 5-6 days
    // If any item has low stock (<=5), delivery is 6-7 days
    
    let minStock = Infinity;
    cartItems.forEach(item => {
      const stock = Number(item.stock);
      if (!isNaN(stock) && stock < minStock) {
        minStock = stock;
      }
    });

    let minDays = 4;
    let maxDays = 7;

    if (minStock > 20) {
      minDays = 4;
      maxDays = 5;
    } else if (minStock > 5) {
      minDays = 5;
      maxDays = 6;
    } else {
      minDays = 6;
      maxDays = 7;
    }
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
      <div className="flex items-center gap-3 text-emerald-800">
        <ShoppingBag size={20} />
        <div>
          <p className="font-bold text-sm">Estimated Delivery Date</p>
          <p className="text-lg font-semibold">{getDeliveryDateRange()}</p>
        </div>
      </div>
      
      {address && (
        <div className="flex items-start gap-3 text-emerald-800 pt-2 border-t border-emerald-200/50">
          <div className="mt-1">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <p className="font-bold text-xs uppercase tracking-wider opacity-70">Delivery Address</p>
            <p className="text-sm font-medium leading-relaxed">{address}</p>
          </div>
        </div>
      )}
    </div>
  );
};


// Component for the Final Order Summary & Calculations
const OrderSummaryCard = ({ subtotal, discount, onApplyCoupon, couponCode, setCouponCode, productsCount, cartItems, fetchCounts }) => {
    const SHIPPING_RATE = 40.00;
    const TAX_RATE = 0.05;
    
    const tax = subtotal * TAX_RATE;
    const delivery = subtotal > 0 ? SHIPPING_RATE : 0;
    const total = subtotal + tax + delivery - discount;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCODSuccess, setShowCODSuccess] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showQRSuccess, setShowQRSuccess] = useState(false);
    const [qrCountdown, setQrCountdown] = useState(20);
    const dropdownRef = useRef(null);
    const timerRef = useRef(null);
    const countdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle 20s timer for QR code success
    useEffect(() => {
      if (showQRModal && !showQRSuccess) {
        setQrCountdown(20);
        
        // Start 20s countdown for auto-success
        timerRef.current = setTimeout(async () => {
          // Get user details for order record
          let customerDetails = { name: "Guest User", email: "", phone: "", address: "" };
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const meResponse = await axios.get('http://localhost:8000/api/v1/users/me', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const userData = meResponse.data?.user;
              customerDetails = {
                name: userData?.name || userData?.fullname || "User",
                email: userData?.email || "",
                phone: userData?.phone || "",
                address: userData?.address || "",
                city: userData?.city || "",
                state: userData?.state || "",
                pincode: userData?.pincode || ""
              };

              // ✅ Save order to Database for logged-in user
              await createOrderAPI({
                items: cartItems.map(item => ({
                  product: item._id,
                  quantity: item.quantity,
                  price: item.price,
                  title: item.title,
                  sellerId: item.createdBy?._id || item.createdBy || item.sellerId || item.seller?._id || item.seller
                })),
                totalAmount: total,
                paymentMethod: 'QR',
                customerDetails: customerDetails
              });
              
              // ✅ Refresh counts (to show empty cart)
              if (fetchCounts) fetchCounts();
            }
          } catch (err) {
            console.error("Error creating order (QR):", err);
          }

          // Legacy: Save order to localStorage for Admin/Seller panels (until they are updated)
          const legacyOrder = {
            id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
            customer: customerDetails.name,
            customerDetails: customerDetails,
            date: new Date().toISOString().split('T')[0],
            amount: total,
            status: "Pending",
            items: cartItems.map(item => ({ 
              title: item.title, 
              quantity: item.quantity, 
              price: item.price,
              sellerId: item.createdBy?._id || item.createdBy || item.sellerId || item.seller?._id || item.seller
            })),
            timestamp: new Date().getTime()
          };
          const existingOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
          localStorage.setItem('all_orders', JSON.stringify([legacyOrder, ...existingOrders]));

          setShowQRModal(false);
          setShowQRSuccess(true);
        }, 20000);

        // Update countdown UI every second
        countdownRef.current = setInterval(() => {
          setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }, [showQRModal, showQRSuccess, total, cartItems]);

    const handleCOD = async () => {
      setIsDropdownOpen(false);
      
      // Get user details for order record
      let customerDetails = { name: "Guest User", email: "", phone: "", address: "" };
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const meResponse = await axios.get('http://localhost:8000/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = meResponse.data?.user;
          customerDetails = {
            name: userData?.name || userData?.fullname || "User",
            email: userData?.email || "",
            phone: userData?.phone || "",
            address: userData?.address || "",
            city: userData?.city || "",
            state: userData?.state || "",
            pincode: userData?.pincode || ""
          };

          // ✅ Save order to Database for logged-in user
          await createOrderAPI({
            items: cartItems.map(item => ({
              product: item._id,
              quantity: item.quantity,
              price: item.price,
              title: item.title,
              sellerId: item.createdBy?._id || item.createdBy || item.sellerId || item.seller?._id || item.seller
            })),
            totalAmount: total,
            paymentMethod: 'COD',
            customerDetails: customerDetails
          });

          // ✅ Refresh counts (to show empty cart)
          if (fetchCounts) fetchCounts();
        }
      } catch (err) {
        console.error("Error creating order (COD):", err);
      }

      // Legacy: Save order to localStorage for Admin/Seller panels (until they are updated)
      const legacyOrder = {
        id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
        customer: customerDetails.name,
        customerDetails: customerDetails,
        date: new Date().toISOString().split('T')[0],
        amount: total,
        status: "Pending",
        items: cartItems.map(item => ({ 
          title: item.title, 
          quantity: item.quantity, 
          price: item.price,
          sellerId: item.createdBy?._id || item.createdBy || item.sellerId || item.seller?._id || item.seller
        })),
        timestamp: new Date().getTime()
      };
      const existingOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
      localStorage.setItem('all_orders', JSON.stringify([legacyOrder, ...existingOrders]));

      setShowCODSuccess(true);
    };

    const handleQR = () => {
      setIsDropdownOpen(false);
      setShowQRModal(true);
      setShowQRSuccess(false);
    };

    const qrData = `upi://pay?pa=demo@void.example.com&pn=TEST%20MERCHANT%20(SAMPLE%20ONLY)&am=${total}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b">Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="mb-4 pb-4 border-b border-gray-100 relative group">
                <p className="text-sm font-semibold text-gray-800 mb-2">Have a coupon code?</p>
                <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-emerald-400 transition-colors"
                    />
                    <button
                      onClick={onApplyCoupon}
                      className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                      Apply
                    </button>
                </div>
                {/* Tooltip */}
                <div className="absolute left-0 -bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg z-10">
                  No coupon code is available now
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-gray-700 text-lg">
                    <span>Subtotal ({productsCount} items)</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                    <span>Tax (5%)</span>
                    <span className="font-bold">
                      {formatCurrency(tax)}
                    </span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                    <span>Delivery Charge (Fixed)</span>
                    <span className="font-bold">{formatCurrency(delivery)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-lg">
                      <span>Discount</span>
                      <span className="font-bold">-{formatCurrency(discount)}</span>
                  </div>
                )}
            </div>

            {/* Total */}
            <div className="flex flex-col mb-8 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-gray-900">Total Price</span>
                    <span className="text-3xl font-black text-emerald-600">{formatCurrency(total)}</span>
                </div>
                <p className="text-xs text-emerald-700 mt-2 text-right font-medium italic">
                  Calculated as: {formatCurrency(subtotal)} (Subtotal) + {formatCurrency(tax)} (Tax) + {formatCurrency(delivery)} (Delivery) {discount > 0 ? `- ${formatCurrency(discount)} (Discount)` : ''}
                </p>
            </div>

            {/* Proceed to Pay with Dropdown and Tooltip */}
            <div className="relative group" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={subtotal === 0}
                className="w-full py-4 bg-emerald-600 text-white font-black text-lg rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                Proceed to Pay
                <ChevronDown size={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Hover Tooltip for Proceed to Pay */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs py-2 px-3 rounded-lg shadow-2xl z-20 whitespace-nowrap border border-gray-700">
                Please kindly complete your profile before payment
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
              </div>

              {/* Payment Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={handleCOD}
                    className="w-full px-4 py-4 text-left hover:bg-emerald-50 text-gray-800 font-bold flex items-center gap-3 transition-colors border-b border-gray-50"
                  >
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      ₹
                    </div>
                    <div>
                      <p className="text-base">Cash on Delivery</p>
                      <p className="text-xs text-gray-500 font-normal">Pay when you receive</p>
                    </div>
                  </button>
                  <button
                    onClick={handleQR}
                    className="w-full px-4 py-4 text-left hover:bg-emerald-50 text-gray-800 font-bold flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <p className="text-base">Open QR Code</p>
                      <p className="text-xs text-gray-500 font-normal">Scan and pay instantly</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* COD Success Popup */}
            {showCODSuccess && (
              <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm px-4">
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100 text-center max-w-sm w-full animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h3>
                  <p className="text-gray-600 font-medium">Your order has been placed successfully. Thank you for shopping!</p>
                  <button 
                    onClick={() => {
                      setShowCODSuccess(false);
                      window.location.href = '/user/ordersummary';
                    }}
                    className="mt-6 w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && (
              <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full relative animate-in zoom-in duration-300 p-8 flex flex-col items-center">
                  <button 
                    onClick={() => setShowQRModal(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                  >
                    <XCircle size={24} />
                  </button>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-2">Scan to Pay</h3>
                  <p className="text-emerald-600 font-bold text-lg mb-6">Total: {formatCurrency(total)}</p>

                  <div className="w-full aspect-square bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center overflow-hidden shadow-inner relative p-4">
                    <img 
                      src={qrUrl} 
                      alt="Payment QR Code" 
                      className="w-full h-full object-contain"
                    />
                    <div className="mt-4 text-center">
                      <p className="text-sm font-bold text-gray-700">UPI ID: demo@void.example.com</p>
                      <p className="text-sm font-bold text-gray-700">Payee: TEST MERCHANT (SAMPLE ONLY)</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-gray-500 font-bold text-lg">
                      Scan with any UPI app
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm animate-pulse">
                      <LoaderCircle size={16} className="animate-spin" />
                      Waiting for payment... ({qrCountdown}s)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Success Popup */}
            {showQRSuccess && (
              <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm px-4">
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100 text-center max-w-sm w-full animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Payment Successful</h3>
                  <p className="text-gray-600 font-bold text-xl uppercase tracking-wider">Order Placed</p>
                  <p className="text-gray-500 mt-4 text-sm font-medium">Thank you for your purchase! Your order is being processed.</p>
                  <button 
                    onClick={() => {
                      setShowQRSuccess(false);
                      window.location.href = '/user/ordersummary';
                    }}
                    className="mt-8 w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
        </div>
    );
};


// Main App component
const OrderSummary = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const { fetchCounts } = useInventory();

  // Load cart items on mount
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const token = localStorage.getItem('token');
        let currentUserId = null;
        if (token) {
          try {
            const meResponse = await axios.get('http://localhost:8000/api/v1/users/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const userData = meResponse.data?.user;
            currentUserId = userData?._id || userData?.id;
            setUserId(currentUserId);
            setUserProfile(userData);
            setProfileImage(userData?.profilePicture);
          } catch (meErr) {
            console.error('Error fetching user info, proceeding as guest:', meErr);
          }
        }
        await loadOrderData(currentUserId);
      } catch (err) {
        console.error('Error in fetchUserAndCart:', err);
        setIsLoading(false);
      }
    };
    fetchUserAndCart();
  }, []);

  const loadOrderData = async (uid) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      let storedCart = [];

      // Step 1: Try fetching from Server if token exists
      if (token) {
        try {
          const items = await fetchCartAPI();
          if (items && items.length > 0) {
            storedCart = items.map(it => {
              const p = it.product || {};
              return {
                _id: p._id || p.id || String(it.product),
                quantity: it.quantity || 1,
                title: p.title || 'Untitled',
                price: Number(p.price) || 0,
                author: p.author || 'Unknown',
                coverImage: p.coverImage || '',
                categories: p.categories || ['General'],
                description: p.description || '',
                stock: p.stock || 0,
                createdBy: p.createdBy || p.sellerId || p.seller
              };
            });
            console.log('OrderSummary: Loaded from server', storedCart);
          }
        } catch (err) {
          console.error('OrderSummary: Server fetch failed', err);
        }
      }

      // Step 2: Fallback to local storage (User-specific then Guest) if still empty
      if (storedCart.length === 0) {
        // Try user-specific local storage first
        storedCart = getCartFromStorage(uid);
        
        // If still empty and uid exists, try guest local storage as last resort
        if (storedCart.length === 0 && uid) {
          storedCart = getCartFromStorage(null);
        }
        console.log('OrderSummary: Loaded from local storage', storedCart);
      }

      if (storedCart.length === 0) {
        console.warn('OrderSummary: No items found anywhere');
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      // Step 3: Fetch full details for items that only have IDs (mostly for local storage items)
      const needsDetails = storedCart.some(item => !item.title || item.title === 'Untitled' || !item.price);
      
      if (needsDetails) {
        try {
          const productIds = storedCart.map(item => item._id || item.id);
          const response = await axios.post('http://localhost:8000/api/v1/cart', {
            productIds
          });

          if (response.data && response.data.status === 'success' && response.data.products) {
            const enrichedItems = response.data.products.map(product => {
              const cartItem = storedCart.find(item => (item._id || item.id) === product._id);
              return {
                ...product,
                price: Number(product.price) || 0,
                quantity: Number(cartItem?.quantity) || 1
              };
            });
            setCartItems(enrichedItems);
          } else {
            setCartItems(storedCart);
          }
        } catch (err) {
          console.error('OrderSummary: Error fetching product details', err);
          setCartItems(storedCart);
        }
      } else {
        setCartItems(storedCart);
      }
    } catch (err) {
      console.error('OrderSummary: Global load error', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  // Handle apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    // Placeholder: Add actual coupon validation logic
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscount(subtotal * 0.10);
      toast.success('Coupon applied!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading order details...</p>
      </div>
    );
  }

  const productsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <UserHeader 
        onLogoClick={() => window.location.assign('/user/home')} 
        userProfile={userProfile}
        profileImage={profileImage}
      />
      
      <div className="flex-1 flex justify-center p-4 sm:p-8 md:p-12 font-[Inter]">
        {/* Main Grid Container for Left (Cart) and Right (Summary) */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Cart Details (Takes 2/3 width on large screens) */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Go back"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 border-b pb-4 flex-1">
                Order Summary
              </h1>
            </div>

            {/* Product List */}
            <div className="divide-y divide-gray-100">
              {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((product) => (
                        <ProductItem
                          key={product._id}
                          product={product}
                        />
                    ))}
                    <DeliveryInfo cartItems={cartItems} address={userProfile?.address} />
                  </>
              ) : (
                  <p className="py-8 text-center text-gray-500">Your cart is empty!</p>
              )}
            </div>
          </div>
          
          {/* RIGHT COLUMN: Order Summary (Takes 1/3 width on large screens) */}
          <div className="lg:col-span-1">
              <OrderSummaryCard 
                  subtotal={subtotal}
                  discount={discount}
                  onApplyCoupon={handleApplyCoupon}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  productsCount={productsCount}
                  cartItems={cartItems}
                  fetchCounts={fetchCounts}
              />
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
