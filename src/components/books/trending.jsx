import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Flame, Star, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext.jsx';

export default function TrendingBooks({ theme = 'light' }) {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const navigate = useNavigate();
  const { wishlistItems, addToCart: addToCartCtx, addToWishlist: addToWishlistCtx, removeFromWishlistCtx } = useInventory();

  const themeStyles = {
    light: {
      containerBg: 'bg-white',
      cardBg: 'bg-white border border-gray-100',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'text-emerald-600',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      navBtn: 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50',
    },
    dark: {
      containerBg: 'bg-gray-900',
      cardBg: 'bg-gray-800 border border-gray-700',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-gray-400',
      accent: 'text-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
      navBtn: 'bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700',
    }
  };

  const currentTheme = themeStyles[theme];

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/products/public');
      if (response.data.products) {
        setTrendingBooks(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching trending books:', error);
      toast.error('Failed to load trending books');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (startIndex + 5 < trendingBooks.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info("Please login to add to cart");
      navigate('/user/login');
      return;
    }
    try {
      await addToCartCtx(product._id, 1);
      toast.success(`"${product.title}" added to cart!`);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async (e, product) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info("Please login to manage wishlist");
      navigate('/user/login');
      return;
    }
    const isWished = wishlistItems.some(item => (item._id || item.id) === product._id);
    try {
      if (isWished) {
        await removeFromWishlistCtx(product._id);
        toast.info(`"${product.title}" removed from wishlist`);
      } else {
        await addToWishlistCtx(product._id);
        toast.success(`"${product.title}" added to wishlist!`);
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  const visibleBooks = trendingBooks.slice(startIndex, startIndex + 5);

  return (
    <div className={`w-full py-12 px-4 ${currentTheme.containerBg}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-500 w-8 h-8" />
            <h2 className={`text-3xl font-bold ${currentTheme.textPrimary}`}>Trending Now</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              disabled={startIndex === 0}
              className={`p-2 rounded-full border shadow-sm transition-all disabled:opacity-30 ${currentTheme.navBtn}`}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              disabled={startIndex + 5 >= trendingBooks.length}
              className={`p-2 rounded-full border shadow-sm transition-all disabled:opacity-30 ${currentTheme.navBtn}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <AnimatePresence mode='popLayout'>
            {visibleBooks.map((book) => (
              <motion.div
                key={book._id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className={`group relative flex flex-col p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${currentTheme.cardBg}`}
                onClick={() => navigate(`/user/product/${book._id}`)}
              >
                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl">
                  <img 
                    src={book.coverImage || 'https://placehold.co/200x300?text=Book'} 
                    alt={book.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={(e) => handleWishlistToggle(e, book)}
                      className="p-2 bg-white rounded-full text-gray-800 hover:text-red-500 transition-colors"
                    >
                      <Heart size={20} className={wishlistItems.some(item => (item._id || item.id) === book._id) ? 'fill-red-500 text-red-500' : ''} />
                    </button>
                    <button 
                      onClick={(e) => handleAddToCart(e, book)}
                      className="p-2 bg-white rounded-full text-gray-800 hover:text-emerald-600 transition-colors"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>

                <h3 className={`font-bold ${currentTheme.textPrimary} line-clamp-1 text-base`}>{book.title}</h3>
                <p className={`text-sm ${currentTheme.textSecondary} mb-2`}>{book.author}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-lg font-bold ${currentTheme.accent}`}>₹{book.price}</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className={`text-xs ${currentTheme.textSecondary}`}>4.5</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
