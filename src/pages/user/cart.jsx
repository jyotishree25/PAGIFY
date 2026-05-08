import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowLeft, LoaderCircle, BadgeDollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCartFromStorage, saveCartToStorage } from '../../utils/cartUtils';
import { useInventory } from '../../context/InventoryContext.jsx';
import { fetchCart as fetchCartAPI } from '../../services/inventoryApi';
import UserHeader from "../../components/common/UserHeader.jsx";

// Theme styles configuration
const themeStyles = {
  light: {
    appBg: "bg-white",
    cardBg: "bg-white",
    cardItemBg: "bg-white",
    cardItemHover: "hover:shadow-md",
    textColor: "text-gray-800",
    textColorPrimary: "text-gray-900",
    secondaryTextColor: "text-gray-500",
    borderColor: "border-gray-200",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
    buttonBgDanger: "bg-red-50 hover:bg-red-100",
    buttonTextDanger: "text-red-500",
    inputBorder: "border-gray-300",
  },
  dark: {
    appBg: "bg-gray-900",
    cardBg: "bg-gray-800",
    cardItemBg: "bg-gray-800",
    cardItemHover: "hover:shadow-lg hover:bg-gray-700",
    textColor: "text-gray-100",
    textColorPrimary: "text-gray-100",
    secondaryTextColor: "text-gray-400",
    borderColor: "border-gray-700",
    buttonBg: "bg-emerald-700 hover:bg-emerald-600",
    buttonBgDanger: "bg-red-900/20 hover:bg-red-900/30",
    buttonTextDanger: "text-red-400",
    inputBorder: "border-gray-600",
  },
};

// --- Book Data Definitions (Reusing from category.jsx context) ---

const allGenres = [
    "horror", "romance", "mystery", "sci-fi", "autobiography",
    "business", "self-help", "study", "politics", "travel",
    "art", "bengali", "children", "cooking", "manga", "poetry",
    "religion"
];

const pretty = {
    "horror": "Horror", "romance": "Romance", "mystery": "Mystery & Thriller",
    "sci-fi": "Science Fiction", "autobiography": "Autobiography", "business": "Business & Economy",
    "self-help": "Self Help", "study": "Study Materials", "politics": "Current Affairs & Politics",
    "travel": "Travel", "art": "Art & Photography", "bengali": "Bengali Books & Covers",
    "children": "Children's Book", "cooking": "Cooking", "manga": "Manga", "poetry": "Poetry",
    "religion": "Religion & Spirituality"
};

// --- Constants (Still needed for total cost calculation) ---
const SHIPPING_RATE = 40.00;
const TAX_RATE = 0.05; // 5% tax

// Currency formatting helper: Changed to Indian Rupee (₹)
const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

// --- Cart Item Component ---
const CartItem = ({ item, onQuantityChange, onRemove, theme = 'light' }) => {
    const currentTheme = themeStyles[theme];
    const category = item.category || 'general';
    const categoryName = pretty[category] || category;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start ${currentTheme.cardItemBg} p-4 sm:p-6 rounded-xl border ${currentTheme.borderColor} shadow-sm mb-4 ${currentTheme.cardItemHover} transition-all duration-300`}
        >
            {/* Image */}
            <div className={`flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 mr-4 rounded-lg overflow-hidden border ${currentTheme.borderColor}`}>
                <img
                    src={item.coverImage || `https://placehold.co/100x130/cfcfcf/333333?text=Book`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = `https://placehold.co/100x130/cfcfcf/333333?text=${encodeURIComponent(item.title.split(' ').slice(0, 2).join('\n'))}`;
                    }}
                />
            </div>

            <div className="flex-1 min-w-0">
                {/* Title & Info */}
                <h3 className={`text-lg font-semibold ${currentTheme.textColorPrimary} line-clamp-2 mb-1`}>
                    {item.title}
                </h3>
                <p className={`text-sm ${currentTheme.secondaryTextColor} mb-2`}>
                    {categoryName} {item.author && `| ${item.author}`}
                </p>

                {/* Price and Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                    {/* Item Price */}
                    <div className={`text-lg font-bold ${currentTheme.textColorPrimary}`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className={`flex items-center border ${currentTheme.inputBorder} rounded-lg p-1 transition-all duration-300`}>
                        <button
                            onClick={() => onQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`p-1 ${currentTheme.secondaryTextColor} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            aria-label="Decrease quantity"
                        >
                            <Minus size={16} />
                        </button>
                        <span className={`w-8 text-center font-medium ${currentTheme.textColor} select-none`}>
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onQuantityChange(item._id, item.quantity + 1)}
                            className={`p-1 ${currentTheme.secondaryTextColor} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors`}
                            aria-label="Increase quantity"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(item._id)}
                className={`ml-4 p-2 ${currentTheme.buttonTextDanger} ${currentTheme.buttonBgDanger} rounded-full transition-colors self-start`}
                aria-label="Remove item"
                title="Remove Item"
            >
                <Trash2 size={20} />
            </button>
        </motion.div>
    );
};

// --- Main Cart Component ---
const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('light');
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const { setUserId: setCtxUser, setCartItemQuantity, removeFromCart, theme: globalTheme } = useInventory();

    // Sync local theme state with global theme
    useEffect(() => {
        setTheme(globalTheme);
    }, [globalTheme]);

    // Load theme from localStorage and cart items on mount
    useEffect(() => {
        initAndLoad();
    }, []);

    const initAndLoad = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            let storedCart = [];
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
                } catch (err) {
                    console.error('Error fetching user for cart:', err);
                }
                try {
                    const items = await fetchCartAPI();
                    // items is an array of { product: { ... }, quantity: N }
                    storedCart = items.map(it => {
                        const p = it.product || {};
                        return {
                            _id: p._id || p.id || String(it.product),
                            quantity: it.quantity || 1,
                            title: p.title || 'Untitled',
                            price: Number(p.price) || 0,
                            author: p.author || 'Unknown',
                            coverImage: p.coverImage || '',
                            category: (p.categories && p.categories[0]) || 'general',
                            stock: p.stock || 0
                        };
                    });
                    console.log('Processed server cart:', storedCart);
                } catch (err) {
                    console.error('Error fetching server cart:', err);
                    storedCart = [];
                }
            } else {
                // If NOT logged in, use local storage
                storedCart = getCartFromStorage(uid);
            }

            if (storedCart.length === 0) {
                setCartItems([]);
                setIsLoading(false);
                return;
            }

            // If we already have the product details (from server fetch), we can skip the extra call
            const hasDetails = storedCart.every(item => item.title !== 'Untitled' && item.price > 0);

            if (hasDetails) {
                setCartItems(storedCart);
                setIsLoading(false);
                setError(null);
                return;
            }

            // Otherwise fetch product details from backend (for local storage items)
            try {
                const productIds = storedCart.map(item => item._id);
                console.log('Fetching products for IDs:', productIds);
                
                const response = await axios.post('https://pagify-g5g5.onrender.com/api/v1/cart', {
                    productIds: productIds
                });

                if (response.data && response.data.status === 'success' && response.data.products) {
                    // Merge cart items with their quantities
                    const enrichedCartItems = response.data.products.map(product => {
                        const cartItem = storedCart.find(item => item._id === product._id);
                        return {
                            ...product,
                            _id: product._id,
                            price: Number(product.price) || 0,
                            quantity: cartItem?.quantity || 1,
                            category: (product.categories && product.categories[0]) || 'general'
                        };
                    });
                    setCartItems(enrichedCartItems);
                    setError(null);
                } else {
                    setCartItems(storedCart);
                }
            } catch (apiError) {
                console.error('Error fetching products:', apiError);
                setCartItems(storedCart);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Error loading cart');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Calculations ---
    const { subtotal, totalItems, totalCost, tax, delivery } = useMemo(() => {
        const initialValue = { subtotal: 0, totalItems: 0 };
        const result = cartItems.reduce((acc, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            acc.subtotal += price * quantity;
            acc.totalItems += quantity;
            return acc;
        }, initialValue);

        const sub = Number(result.subtotal) || 0;
        const tax = sub * TAX_RATE;
        const delivery = sub > 0 ? SHIPPING_RATE : 0;
        const total = sub + tax + delivery;

        return {
            subtotal: sub,
            totalItems: result.totalItems,
            totalCost: total,
            tax,
            delivery
        };
    }, [cartItems]);

    const isCartEmpty = cartItems.length === 0;

    // --- Handlers ---
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        // Update cart items in state
        const updatedItems = cartItems.map(item =>
            item._id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);

        // Update localStorage
        const updatedStorageCart = updatedItems.map(item => ({
            _id: item._id,
            quantity: item.quantity
        }));
        saveCartToStorage(updatedStorageCart, userId);
        setCartItemQuantity(productId, newQuantity);
    };

    const handleRemoveItem = (productId) => {
        const updatedItems = cartItems.filter(item => item._id !== productId);
        setCartItems(updatedItems);

        // Update localStorage
        const updatedStorageCart = updatedItems.map(item => ({
            _id: item._id,
            quantity: item.quantity
        }));
        saveCartToStorage(updatedStorageCart, userId);
        removeFromCart(productId);
    };

    const handleCheckout = () => {
        if (isCartEmpty) return;

        // ✅ STRICT CHECK: All three (Email, Phone, Address) must be present and not blank
        const email = userProfile?.email?.toString().trim();
        const phone = userProfile?.phone?.toString().trim();
        const address = userProfile?.address?.toString().trim();

        // If any of the required fields are missing, block the button and show warning
        if (!email || !phone || !address) {
            toast.error("⛔ PROCEED BLOCKED: You must provide your Email, Phone Number, and Address in your profile to place an order.", {
                position: "top-center",
                autoClose: 6000,
                theme: "colored"
            });
            
            // Highlight the missing info for the user
            const missing = [];
            if (!email) missing.push("Email");
            if (!phone) missing.push("Phone Number");
            if (!address) missing.push("Address");
            
            toast.info(`Missing fields: ${missing.join(", ")}`, {
                position: "top-center",
                autoClose: 8000
            });
            return;
        }

        // Only redirect if all checks pass
        window.location.assign('/user/ordersummary');
    };

    // --- Rendering Components ---
    const renderOrderSummary = () => {
        const isProfileIncomplete = !userProfile?.email || !userProfile?.phone || !userProfile?.address;
        
        return (
            <div className="sticky top-24 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Order Total</h3>
                
                {isProfileIncomplete && !isCartEmpty && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                        <div className="mt-0.5">⚠️</div>
                        <p>Your profile is incomplete. Please add your email, phone, and address in settings to enable payment.</p>
                    </div>
                )}

                <div className="space-y-3 text-gray-700">
                    {/* Only showing the final total cost */}
                    <div className="flex justify-between items-center text-4xl font-black text-gray-900">
                        <span>Total Price</span>
                        <span>₹{totalCost.toFixed(2)}</span>
                    </div>
                </div>
                <motion.button
                    onClick={handleCheckout}
                    disabled={isCartEmpty}
                    className={`mt-6 w-full py-3 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                        isCartEmpty
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isProfileIncomplete 
                                ? 'bg-orange-500 hover:bg-orange-600' // Different color to indicate something is missing
                                : 'bg-emerald-600 hover:bg-emerald-700 active:ring-4 active:ring-emerald-300'
                    }`}
                    whileHover={{ scale: isCartEmpty ? 1 : 1.01 }}
                    whileTap={{ scale: isCartEmpty ? 1 : 0.98 }}
                >
                    
                    {isProfileIncomplete && !isCartEmpty ? "Complete Profile to Pay" : "Proceed to Pay"}
                </motion.button>
            </div>
        );
    };

    const renderEmptyCart = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full bg-white p-12 rounded-xl shadow-lg text-center border border-gray-200"
        >
            <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-6">
                Looks like you haven't added any books yet. Start exploring our categories!
            </p>
            <button
                onClick={() => window.history.back()}
                className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md gap-2"
            >
                <ArrowLeft size={20} />
                Continue Shopping
            </button>
        </motion.div>
    );

    const renderLoading = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full bg-white p-12 rounded-xl shadow-lg text-center border border-gray-200"
        >
            <LoaderCircle size={48} className="text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-700">Loading your cart...</h2>
        </motion.div>
    );

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen flex flex-col font-inter`}>
            <UserHeader 
                onLogoClick={() => window.location.assign('/user/home')} 
                userProfile={userProfile}
                profileImage={profileImage}
            />

            {/* Main Content */}
            <main className="container mx-auto max-w-screen-2xl px-4 md:px-12 py-10 flex-1">
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

                <div className="flex items-center justify-between mb-8">
                    <h1 className={`text-3xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        <ShoppingCart size={28} className="text-blue-600" />
                        Shopping Cart ({totalItems} items)
                    </h1>
                </div>

                <div className="md:grid md:grid-cols-3 md:gap-8">
                    {/* Cart Items List - Takes 2/3 column space */}
                    <div className="md:col-span-2">
                        {isLoading ? (
                            renderLoading()
                        ) : isCartEmpty ? (
                            renderEmptyCart()
                        ) : (
                            <div className="cart-list">
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map(item => (
                                        <CartItem
                                            key={item._id}
                                            item={item}
                                            onQuantityChange={handleQuantityChange}
                                            onRemove={handleRemoveItem}
                                            theme={theme}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                        {!isLoading && !isCartEmpty && (
                            <button
                                onClick={() => window.history.back()}
                                className={`inline-flex items-center mt-6 font-semibold transition-colors ${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                                <ArrowLeft size={18} className="mr-2" /> Continue Shopping
                            </button>
                        )}
                    </div>

                    {/* Order Summary - Takes 1/3 column space */}
                    <div className="md:col-span-1 mt-8 md:mt-0">
                        {renderOrderSummary()}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t py-6 mt-8 shadow-inner`}>
                <div className={`container mx-auto max-w-screen-2xl px-4 md:px-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    &copy; 2024 PaGify. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default CartPage;
