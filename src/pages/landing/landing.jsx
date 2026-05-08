'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {  Link, useNavigate } from "react-router-dom";
import TrendingBooks from "../../components/books/trending";
import BestsellerComponent from "../../components/books/bestseller";
import { Lock, Mail, Key, X, AlertTriangle, ShieldCheck } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const menuVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.3 } },
  exit: { x: "100%", transition: { duration: 0.3 } },
};

const popupVariants = {
  hidden: { scale: 0.8, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { scale: 0.8, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const books = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    image: "https://images.unsplash.com/photo-1544937950-fa07a98d237f?w=500"
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500"
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500"
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?w=500"
  },
  {
    id: 5,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500"
  },
  {
    id: 6,
    title: "Harry Potter",
    author: "J.K. Rowling",
    image: "https://images.unsplash.com/photo-1544937950-fa07a98d237f?w=500"
  }
];

export default function PagifyLanding() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPremiumPopupOpen, setIsPremiumPopupOpen] = useState(false);
  const [isDonatePopupOpen, setIsDonatePopupOpen] = useState(false);
  const [isAdminPopupOpen, setIsAdminPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState(null);

  // Admin Login States
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    
    localStorage.removeItem("adminLockoutUntil");
    localStorage.removeItem("adminFailedAttempts");
    setFailedAttempts(0);
    setLockoutUntil(null);
    setLoginError("");
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    
    if (adminEmail === "pagify@gmail.com" && adminPassword === "PagifyAJS") {
      setFailedAttempts(0);
      localStorage.removeItem("adminFailedAttempts");
      localStorage.removeItem("adminLockoutUntil");
      navigate("/admin/dashboard");
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem("adminFailedAttempts", newAttempts.toString());

      if (newAttempts >= 3) {
        const thirtyMinsFromNow = Date.now() + 30 * 60 * 1000;
        setLockoutUntil(thirtyMinsFromNow);
        localStorage.setItem("adminLockoutUntil", thirtyMinsFromNow.toString());
        setLoginError("Too many failed attempts. Admin access has been locked for 30 minutes.");
      } else {
        setLoginError(`Invalid credentials. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const themeClasses = darkMode ? {
    bg: "bg-slate-900",
    text: "text-slate-200",
    headerBg: "bg-slate-800",
    headerText: "text-white",
    logoText: "text-white",
    logoG: "text-emerald-500",
    cardBg: "bg-slate-700",
    shadow: "shadow-2xl",
    heroBg: "bg-slate-800",
    sectionBg: "bg-slate-800",
    buttonBg: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-500",
    textPrimary: "text-emerald-400",
    textSecondary: "text-slate-400",
    border: "border-slate-600",
    backdrop: "backdrop-blur-sm bg-slate-900/50"
  } : {
    bg: "bg-neutral-50",
    text: "text-gray-800",
    headerBg: "bg-white",
    headerText: "text-gray-900",
    logoText: "text-black",
    logoG: "text-emerald-500",
    cardBg: "bg-white",
    shadow: "shadow-md",
    heroBg: "bg-neutral-50",
    sectionBg: "bg-neutral-100",
    buttonBg: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-700",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-600",
    border: "border-gray-300",
    backdrop: "backdrop-blur-sm bg-neutral-50/50"
  };

  const openPopup = (type) => {
    setPopupType(type);
    setIsPopupOpen(true);
  };
  
  const openDonatePopup = () => {
    setIsDonatePopupOpen(true);
  };

  return (
    <div className={`font-sans ${themeClasses.bg} ${themeClasses.text} min-h-screen transition-colors duration-500`}>
      {/* Navbar */}
      <header className={`flex justify-between items-center px-4 md:px-8 py-4 ${themeClasses.shadow} ${themeClasses.headerBg} transition-colors duration-500 sticky top-0 z-50 backdrop-blur-md bg-opacity-80`}>
        <h1 className="text-xl md:text-3xl font-bold flex items-end">
          <span className={themeClasses.logoText}>Pa</span>
          <span className={`${themeClasses.logoG} text-3xl md:text-5xl`}>G</span>
          <span className={themeClasses.logoText}>ify</span>
        </h1>
        <nav className="hidden lg:flex space-x-4 md:space-x-8 items-center flex-grow justify-center">
          <Link to="/user/signup" className={`${themeClasses.headerText} hover:text-emerald-600 transition-colors duration-300 font-medium`}>Home</Link>
          <button onClick={() => openPopup('about')} className={`${themeClasses.headerText} hover:text-emerald-600 transition-colors duration-300 font-medium`}>About us</button>
          <button onClick={openDonatePopup} className={`${themeClasses.headerText} hover:text-emerald-600 transition-colors duration-300 font-medium`}>Donate</button>
          <button onClick={() => openPopup('contact')} className={`${themeClasses.headerText} hover:text-emerald-600 transition-colors duration-300 font-medium`}>Contact us</button>
        </nav>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden md:block">
            <form
  onSubmit={(e) => {
    e.preventDefault(); 

    if (!searchQuery.trim()) return; 

    navigate("/user/login"); 
  }}
>
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search books..."
    className={`pl-10 pr-4 py-2 rounded-full border ${themeClasses.border} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 w-32 md:w-48 text-sm ${themeClasses.cardBg} ${themeClasses.text}`}
  />
</form>

            <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300">
            <svg className={`w-5 h-5 ${themeClasses.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <div className="flex items-center space-x-2 hidden sm:flex">
            <button onClick={() => setIsPremiumPopupOpen(true)} className={`text-sm font-bold px-4 md:px-6 py-2 rounded-full transition duration-300 ${themeClasses.headerText} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-neutral-100'}`}>
              Premium
            </button>
            <Link to="/user/login" className={`text-sm font-bold px-4 md:px-6 py-2 rounded-full transition duration-300 ${themeClasses.headerText} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-neutral-100'}`}>
              Log In
            </Link>
            <Link to="/user/signup" className={`text-white px-4 md:px-6 py-2 rounded-full font-bold ${themeClasses.buttonBg} ${themeClasses.buttonHover} transition duration-300`}>
              Sign Up
            </Link>
          </div>
        </div>
        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300">
          <svg className={`w-6 h-6 ${themeClasses.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </header>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`fixed top-0 right-0 h-full w-full max-w-sm ${themeClasses.bg} p-6 z-50 lg:hidden transform ${themeClasses.backdrop}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold ${themeClasses.headerText}`}>Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                <svg className={`w-6 h-6 ${themeClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search books..."
                  className={`w-full pl-10 pr-4 py-3 rounded-full border ${themeClasses.border} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 text-sm ${themeClasses.cardBg} ${themeClasses.text}`}
                />
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <a href="/" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium py-3 border-b ${themeClasses.border} ${themeClasses.text}`}>Home</a>
              <a href="/categories" onClick={() => setIsMenuOpen(false)} className={`text-lg font-medium py-3 border-b ${themeClasses.border} ${themeClasses.text}`}>Categories</a>
              <button onClick={() => { openPopup('about'); setIsMenuOpen(false); }} className={`text-lg font-medium py-3 border-b text-left ${themeClasses.border} ${themeClasses.text}`}>About us</button>
              <button onClick={() => { openDonatePopup(); setIsMenuOpen(false); }} className={`text-lg font-medium py-3 border-b text-left ${themeClasses.border} ${themeClasses.text}`}>Donate</button>
              <button onClick={() => { openPopup('contact'); setIsMenuOpen(false); }} className={`text-lg font-medium py-3 border-b text-left ${themeClasses.border} ${themeClasses.text}`}>Contact us</button>
              <div className="pt-4 flex flex-col space-y-4">
                <button onClick={() => { setIsPremiumPopupOpen(true); setIsMenuOpen(false); }} className={`text-sm font-bold text-center px-4 py-3 rounded-full transition duration-300 ${themeClasses.text} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-neutral-100'}`}>
                  Get Premium
                </button>
                <a href="/user/login" className={`text-sm font-bold text-center px-4 py-3 rounded-full transition duration-300 ${themeClasses.text} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-neutral-100'}`}>
                  Log In
                </a>
                <a href="/user/signup" onClick={() => setIsMenuOpen(false)} className={`text-white text-center px-4 py-3 rounded-full font-bold ${themeClasses.buttonBg} ${themeClasses.buttonHover} transition duration-300`}>
                  Sign Up
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto max-w-7xl px-4 mt-8 md:mt-12">
        {/* Hero Section */}
        <section className={`relative flex flex-col-reverse md:flex-row items-center justify-between py-8 md:py-16 rounded-lg shadow-md overflow-hidden ${themeClasses.heroBg} transition-colors duration-500`}>
          <motion.div
            className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left p-4 md:p-8 z-10 relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className={`text-3xl md:text-5xl font-extrabold leading-tight mb-2 md:mb-4 ${themeClasses.textPrimary}`}>
              Discover your next <br className="hidden md:block" />favorite book here!
            </motion.h2>
            <motion.p variants={itemVariants} className={`text-sm md:text-lg mb-4 md:mb-8 ${themeClasses.textSecondary}`}>
              “A room without books is like a body without a soul.”
            </motion.p>
            <motion.div variants={itemVariants} className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/user/login'}
                className={`${themeClasses.buttonBg} text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold ${themeClasses.buttonHover} transition duration-300 shadow-lg hover:shadow-xl`}>
                Shop Now
              </button>
              <button
                onClick={() => openPopup('about')}
                className={`bg-transparent border border-emerald-600 ${themeClasses.text} px-6 md:px-8 py-2 md:py-3 rounded-full font-bold hover:bg-emerald-600 hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl`}>
                Learn More
              </button>
            </motion.div>
          </motion.div>
          <motion.div
            className="md:w-1/2 flex justify-center mt-8 md:mt-0 z-10 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
          >
            <div className={`${darkMode ? 'bg-emerald-700' : 'bg-emerald-500'} w-48 h-48 md:w-80 md:h-80 rounded-full flex items-center justify-center animate-pulse-slow overflow-hidden`}>
              <img src="/icon.png" alt="Pagify Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </motion.div>
        </section>

        ---

        {/* Trending Books */}
        <section className="py-8 md:py-16">
          <TrendingBooks theme={darkMode ? 'dark' : 'light'} />
        </section>

        ---

        {/* Top Sellers */}
        <section className={`py-8 md:py-16 ${themeClasses.sectionBg} rounded-xl transition-colors duration-500`}>
          <div className="container mx-auto px-4">
             <BestsellerComponent theme={darkMode ? 'dark' : 'light'} />
          </div>
        </section>

        ---

        {/* What our readers say... */}
        <section className="py-8 md:py-16">
          <h3 className={`text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center ${themeClasses.textPrimary}`}>What Our Readers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`p-6 md:p-8 ${themeClasses.cardBg} rounded-lg ${themeClasses.shadow} hover:shadow-xl transition-shadow duration-300`}>
                <p className={`italic mb-2 md:mb-4 text-sm md:text-base ${themeClasses.textSecondary}`}>“This is an amazing bookstore with a fantastic collection. I found my favorite novel here and the delivery was incredibly fast!”</p>
                <p className={`font-semibold text-sm md:text-base ${themeClasses.textPrimary}`}>— Satisfied Reader</p>
              </div>
            ))}
          </div>
        </section>

        ---

        {/* Contact section */}
        <section className="py-8 md:py-16">
          <div className={`p-6 md:p-10 ${themeClasses.cardBg} rounded-lg ${themeClasses.shadow} grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10`}>
            <div className="flex flex-col justify-between">
              <div>
                <h4 className={`text-lg md:text-xl font-bold mb-2 md:mb-4 ${themeClasses.textPrimary}`}>Contact Us</h4>
                <p className={`mb-1 md:mb-2 text-sm md:text-base ${themeClasses.textSecondary}`}>123 Bookworm Lane, Kolkata, 777777</p>
                <p className={`mb-1 md:mb-2 text-sm md:text-base ${themeClasses.textSecondary}`}>pagify@gmail.com</p>
                <p className={`mb-1 md:mb-2 text-sm md:text-base ${themeClasses.textSecondary}`}>+1 (123) 5577993311</p>
              </div>
            </div>
            <div>
              <h4 className={`text-lg md:text-xl font-bold mb-2 md:mb-4 ${themeClasses.textPrimary}`}>Join Us!</h4>
              <p className={`mb-2 md:mb-4 text-sm md:text-base ${themeClasses.textSecondary}`}>Join our book community and connect with passionate readers eager to discover and support your collection!</p>
              <form
  className="flex flex-col sm:flex-row"
  onSubmit={(e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(joinEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    navigate("/seller/signup"); 
  }}
>
  <input
    type="email"
    value={joinEmail}
    onChange={(e) => setJoinEmail(e.target.value)}
    placeholder="Enter your email"
    required
    className={`flex-grow rounded-full sm:rounded-l-full sm:rounded-r-none border ${themeClasses.border} px-4 py-2 focus:outline-none ${themeClasses.cardBg} ${themeClasses.text} mb-2 sm:mb-0`}
  />

  <button
    type="submit"
    className={`${themeClasses.buttonBg} text-white rounded-full sm:rounded-r-full sm:rounded-l-none px-6 py-2 font-bold ${themeClasses.buttonHover} transition duration-300`}
  >
    Join
  </button>
</form>

<div className="mt-4">
  <button
    onClick={() => setIsAdminPopupOpen(true)}
    className={`text-sm font-medium ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} transition-colors duration-300 flex items-center space-x-1`}
  >
    <Lock className="w-4 h-4" />
    <span>Admin user's only</span>
  </button>
</div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${themeClasses.headerBg} ${themeClasses.textSecondary} py-6 text-center shadow-inner mt-4 md:mt-8 transition-colors duration-500`}>
        <p className="text-sm md:text-base">© 2026 Pagify. All rights reserved.</p>
      </footer>

      {/* Dark/Light Mode Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-emerald-600 text-white shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {darkMode ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        )}
      </button>

      {/* Popup for "About us" and "Contact us" */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center p-4 z-[9999] ${themeClasses.backdrop}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.div
              className={`relative p-8 rounded-xl max-w-lg w-full ${themeClasses.cardBg} ${themeClasses.shadow} transform-gpu`}
              onClick={(e) => e.stopPropagation()}
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setIsPopupOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full ${themeClasses.cardBg} transition-colors duration-300`}
              >
                <svg className={`w-5 h-5 ${themeClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              {popupType === 'contact' ? (
                <>
                  <h2 className={`text-2xl font-bold mb-4 ${themeClasses.textPrimary}`}>Contact Us</h2>
                  <div className={`text-sm md:text-base leading-relaxed ${themeClasses.textSecondary}`}>
                    <p>123 Bookworm Lane, Kolkata, 777777</p>
                    <p className="mt-2">pagify@gmail.com</p>
                    <p className="mt-2">+91 5577993311</p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className={`text-2xl font-bold mb-4 ${themeClasses.textPrimary}`}>About Pagify</h2>
                  <div className={`text-sm md:text-base leading-relaxed ${themeClasses.textSecondary}`}>
                    <p>"At Pagify, we believe every book opens a new world. Our mission is to bring together readers, writers, and sellers in one vibrant community built around the love of stories. Whether you’re searching for timeless classics, the latest bestsellers, or hidden gems from independent authors, Pagify is your gateway to endless discovery. We’re more than just a bookstore—we’re a space where book lovers connect, share recommendations, and celebrate the magic of reading. By supporting local sellers and publishers, we aim to keep the joy of books alive for generations to come. At Pagify, every page matters, and so does every reader. Welcome to your new literary home."</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      
      <AnimatePresence>
        {isPremiumPopupOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center p-4 z-[9999] ${themeClasses.backdrop}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPremiumPopupOpen(false)}
          >
            <motion.div
              className={`relative p-8 rounded-xl max-w-lg w-full ${themeClasses.cardBg} ${themeClasses.shadow} transform-gpu`}
              onClick={(e) => e.stopPropagation()}
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setIsPremiumPopupOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full ${themeClasses.cardBg} transition-colors duration-300`}
              >
                <svg className={`w-5 h-5 ${themeClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className={`text-2xl font-bold mb-4 text-center ${themeClasses.textPrimary}`}>Unlock Premium</h2>
              <p className={`text-center mb-6 ${themeClasses.textSecondary}`}>Sign up to get access to exclusive features.</p>
<form
  className="flex flex-col sm:flex-row"
  onSubmit={(e) => {
    e.preventDefault(); 

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(joinEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    navigate("/user/signup"); 
  }}
>
  <input
    type="email"
    value={joinEmail}
    onChange={(e) => setJoinEmail(e.target.value)}
    placeholder="Enter your email"
    required
    className={`flex-grow rounded-full sm:rounded-l-full sm:rounded-r-none border ${themeClasses.border} px-4 py-2 focus:outline-none ${themeClasses.cardBg} ${themeClasses.text} mb-2 sm:mb-0`}
  />

  <button
    type="submit"
    className={`${themeClasses.buttonBg} text-white rounded-full sm:rounded-r-full sm:rounded-l-none px-6 py-2 font-bold ${themeClasses.buttonHover} transition duration-300`}
  >
    Join
  </button>
</form>




   </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donate Popup */}
      <AnimatePresence>
        {isDonatePopupOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center p-4 z-[9999] ${themeClasses.backdrop}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDonatePopupOpen(false)}
          >
            <motion.div
              className={`relative p-8 rounded-xl max-w-lg w-full ${themeClasses.cardBg} ${themeClasses.shadow} transform-gpu`}
              onClick={(e) => e.stopPropagation()}
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setIsDonatePopupOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full ${themeClasses.cardBg} transition-colors duration-300`}
              >
                <svg className={`w-5 h-5 ${themeClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className={`text-2xl font-bold mb-4 ${themeClasses.textPrimary}`}>Support Pagify</h2>
              <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeClasses.textSecondary}`}>
                At Pagify, we’re committed to keeping stories alive and accessible for everyone. By donating, you help us:
              </p>
              <ul className={`list-disc list-inside space-y-2 mb-6 ${themeClasses.textSecondary}`}>
                <li>Support independent authors and small publishers</li>
                <li>Build a stronger community for readers and book sellers</li>
                <li>Keep our platform free and welcoming for all</li>
              </ul>
              <p className={`text-sm md:text-base leading-relaxed mb-6 ${themeClasses.textSecondary}`}>
                Every contribution, big or small, fuels our mission to spread the joy of reading.
                <br /><span className="font-bold text-lg mt-2 inline-block">👉 Donate today and be part of the story!</span>
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className={`font-bold text-lg ${themeClasses.textPrimary}`}>Contact Us</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    <span className="font-semibold">📩 Email:</span> <a href="pagify@gmail.com" className="text-emerald-500 hover:underline">pagify@gmail.com</a>
                  </p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    <span className="font-semibold">📞 Phone:</span> <a href="tel:+91 5577993311" className="text-emerald-500 hover:underline">+91 5577993311</a>
                  </p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    <span className="font-semibold">🌐 Website:</span> <a href="https://www.pagify.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">www.pagify.com</a>
                  </p>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${themeClasses.textPrimary}`}>Connect with Us</h3>
                  <div className="flex space-x-4 mt-2">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.455v-9.294h-3.13v-3.626h3.13V8.414c0-3.101 1.89-4.789 4.654-4.789 1.325 0 2.464.099 2.793.143v3.24h-1.92c-1.503 0-1.8.715-1.8 1.764v2.313h3.587l-.466 3.626h-3.121V24h6.113c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z"></path></svg>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.795-1.574 2.16-2.72-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.415 0-6.178 2.764-6.178 6.178 0 .484.053.957.147 1.412-5.145-.256-9.697-2.725-12.744-6.47-.525.908-.827 1.966-.827 3.102 0 2.146 1.093 4.045 2.756 5.143-.805-.025-1.564-.247-2.22-.614v.078c0 2.99 2.13 5.474 4.965 6.04-.51.138-1.045.213-1.594.213-.39 0-.768-.038-1.138-.108.79 2.463 3.067 4.267 5.766 4.317-2.112 1.65-4.776 2.639-7.697 2.639-.5 0-.994-.03-1.48-.087 2.73 1.75 5.975 2.77 9.479 2.77 11.369 0 17.58-9.98 17.58-18.68 0-.285-.006-.568-.018-.85.762-.551 1.427-1.244 1.956-2.016z"></path></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.145 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.148 3.229-1.668 4.748-4.919 4.919-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.145-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.584.07-4.85c.149-3.229 1.668-4.748 4.919-4.919 1.266-.058 1.645-.07 4.85-.07zm0-2.163c-3.79 0-4.271.014-5.776.082-4.35 0-6.177 1.827-6.257 6.257-.068 1.505-.082 1.987-.082 5.776s.014 4.271.082 5.776c.08 4.43 1.827 6.257 6.257 6.257 1.505.068 1.987.082 5.776.082s4.271-.014 5.776-.082c4.43-.08 6.257-1.827 6.257-6.257.068-1.505.082-1.987.082-5.776s-.014-4.271-.082-5.776c-.08-4.43-1.827-6.257-6.257-6.257-1.505-.068-1.987-.082-5.776-.082zm0 5.838c-3.41 0-6.178 2.764-6.178 6.178s2.764 6.178 6.178 6.178 6.178-2.764 6.178-6.178c0-3.415-2.764-6.178-6.178-6.178zm0 10.165c-2.2 0-3.987-1.787-3.987-3.987s1.787-3.987 3.987-3.987 3.987 1.787 3.987 3.987-1.787 3.987-3.987 3.987zm6.406-11.845c-.815 0-1.48.665-1.48 1.48s.665 1.48 1.48 1.48 1.48-.665 1.48-1.48-.665-1.48-1.48-1.48z"></path></svg>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.765s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.765-1.75 1.765zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Admin Verification Popup */}
      <AnimatePresence>
        {isAdminPopupOpen && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center p-4 z-[9999] ${themeClasses.backdrop}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsAdminPopupOpen(false);
              setLoginError("");
            }}
          >
            <motion.div
              className={`relative p-8 rounded-2xl max-w-md w-full ${themeClasses.cardBg} ${themeClasses.shadow} border ${themeClasses.border} overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Decorative background element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

              <button
                onClick={() => {
                  setIsAdminPopupOpen(false);
                  setLoginError("");
                }}
                className={`absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300`}
              >
                <X className={`w-5 h-5 ${themeClasses.text}`} />
              </button>

              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center p-3 rounded-xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'} mb-4`}>
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className={`text-2xl font-bold ${themeClasses.headerText}`}>Admin Verification</h2>
                <p className={`text-sm mt-2 ${themeClasses.textSecondary}`}>Please verify your credentials to access the portal</p>
              </div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-start space-x-3 ${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-600'} border ${darkMode ? 'border-red-800' : 'border-red-100'}`}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{loginError}</p>
                </motion.div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className={`text-sm font-semibold ml-1 ${themeClasses.textPrimary}`}>Admin Email</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@pagify.com"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${themeClasses.border} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${themeClasses.cardBg} ${themeClasses.text}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold ml-1 ${themeClasses.textPrimary}`}>Access Key</label>
                  <div className="relative">
                    <Key className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${themeClasses.border} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${themeClasses.cardBg} ${themeClasses.text}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 flex items-center justify-center space-x-2 ${themeClasses.buttonBg} ${themeClasses.buttonHover} hover:scale-[1.02] active:scale-[0.98] mt-4`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Verify Identity</span>
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
                <p className={`text-xs ${themeClasses.textSecondary}`}>
                  This is a restricted area. Unauthorized access is prohibited and monitored.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
