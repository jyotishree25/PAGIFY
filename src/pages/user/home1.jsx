import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  ListFilter,
  Award,
  Settings,
  HelpCircle,
  Search,
  ShoppingCart,
  Heart,
  Trash2,
  X,
  Book,
  Brain,
  Rocket,
  Ghost,
  User,
  Sun,
  Moon,
  Menu,
  ShoppingBag,
  Camera,
  LogOut,
  MapPin,
  Monitor,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Popular");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Sabrina Aryan',
    email: 'SabrinaAry208@gmail.com',
    username: 'sabrina_ary',
    phoneNumber: '555-123-4567',
    birthdate: '1990-01-01',
    gender: 'Female',
    accountStatus: 'Active'
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    reEnterPassword: ''
  });
  const [addresses, setAddresses] = useState([{
    street: '123 Reading Lane',
    city: 'Bookville',
    state: 'Literature State',
    zip: '54321',
    country: 'USA',
    default: true
  }]);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [profileImage, setProfileImage] = useState("https://placehold.co/100x100/A3A3A3/FFFFFF?text=SA");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredHeaderItem, setHoveredHeaderItem] = useState(null);

  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
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

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    setShowProfilePopup(false);
    setShowLogoutMessage(true);
  };
  
  const showMessage = (message) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
  };

  const handleSaveChanges = () => {
    if (isChangingPassword) {
      if (passwords.newPassword !== passwords.reEnterPassword) {
        showMessage("Passwords do not match!");
        return;
      }
      // Here you would typically handle the password change logic
    }
    showMessage("Profile updated successfully!");
  };

  const startCamera = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing the camera: ", err);
      setIsCameraActive(false);
      showMessage("Could not access camera. Please check your permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      setProfileImage(imageDataUrl);
      stopCamera();
    }
  };

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
  
  const handleAddAddress = () => {
    setAddresses([...addresses, { ...newAddress, default: false }]);
    setIsAddingAddress(false);
    setNewAddress({
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    });
  };

  const handleDeleteAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };


  // Reusable modal for messages
  const MessageModal = ({ message, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center`}
      >
        <p className={`text-lg font-semibold ${currentTheme.textColor} text-center`}>{message}</p>
        <motion.button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const LogoutConfirmationModal = ({ onYes, onNo }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <p className={`text-lg font-semibold ${currentTheme.textColor}`}>Are you sure you want to log out?</p>
        <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>This will end your current session.</p>
        <div className="flex space-x-4 mt-4">
          <motion.button
            onClick={onYes}
            className={`px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Yes
          </motion.button>
          <motion.button
            onClick={onNo}
            className={`px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            No
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
  
  const HelpModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col w-full max-w-lg`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Help & Support</h2>
          <motion.button onClick={() => setShowHelpModal(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <X className={`h-6 w-6 ${currentTheme.textColor}`} />
          </motion.button>
        </div>
        <p className={`${currentTheme.secondaryTextColor} mb-4`}>
          Need assistance? We’re here to help you make the most of Pagify.
        </p>
        <ul className="space-y-4">
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Account Help</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Trouble signing in or creating an account? Click here.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Order & Payments</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Learn how to buy, sell, or donate books securely.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Community Guidelines</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Understand how to engage respectfully with fellow readers and sellers.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Donations & Contributions</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Find answers about supporting Pagify and where your donations go.</p>
          </li>
          <li>
            <h4 className={`font-semibold ${currentTheme.textColor}`}>Contact Support</h4>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Still need help? Reach out at support@pagify.com.</p>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
  
  const themeStyles = {
    light: {
      appBg: "bg-white",
      sidebarBg: "bg-neutral-100",
      headerBg: "bg-neutral-100",
      cardBg: "bg-white",
      cardHover: "bg-neutral-100",
      textColor: "text-gray-800",
      secondaryTextColor: "text-gray-500",
      accent: "text-emerald-700",
      accentButtonBg: "bg-emerald-700",
      accentButtonHover: "hover:bg-emerald-800",
      inputBorder: "border-emerald-300",
      inputBg: "bg-white",
      headerIconColor: "text-black",
      navTextColor: "text-gray-800",
      navIconColor: "text-gray-800",
      navHover: "hover:bg-neutral-200",
      pagify: {
        text1: "text-gray-800",
        text2: "text-emerald-700"
      },
      navMobileBg: "bg-emerald-700",
      navMobile: {
        active: "text-emerald-200",
        inactive: "text-white"
      }
    },
    dark: {
      appBg: "bg-gray-900",
      sidebarBg: "bg-gray-950",
      headerBg: "bg-gray-600",
      cardBg: "bg-gray-700",
      cardHover: "bg-gray-600",
      textColor: "text-gray-100",
      secondaryTextColor: "text-gray-400",
      accent: "text-emerald-400",
      accentButtonBg: "bg-emerald-700",
      accentButtonHover: "hover:bg-emerald-600",
      inputBorder: "border-emerald-500",
      inputBg: "bg-gray-200",
      inputTextColor: "text-gray-900",
      headerIconColor: "text-gray-100",
      navTextColor: "text-gray-300",
      navIconColor: "text-gray-300",
      iconHover: "hover:text-emerald-400",
      navHover: "hover:bg-gray-800",
      pagify: {
        text1: "text-white",
        text2: "text-emerald-400"
      },
      navMobileBg: "bg-emerald-800",
      navMobile: {
        active: "text-emerald-200",
        inactive: "text-white"
      }
    },
  };
  const currentTheme = themeStyles[theme];

  const handleAddToWishlist = (book) => {
    if (!wishlist.find(item => item.id === book.id)) {
      setWishlist([...wishlist, book]);
    }
  };
  const handleAddToCart = (book) => {
    setCart([...cart, book]);
  };
  const handleRemoveFromCart = (bookId) => {
    setCart(cart.filter(item => item.id !== bookId));
  };
  const handleRemoveFromWishlist = (bookId) => {
    setWishlist(wishlist.filter(item => item.id !== bookId));
  };

  const bookData = {
    "Popular": [
      { id: 1, title: "I owe you one", author: "Sophie Kinsella", progress: 85, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1539282361i/42369796.jpg", price: "₹350" },
      { id: 2, title: "Factfulness", author: "Hans Rosling", progress: 75, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1523450989i/34890015.jpg", price: "₹500" },
      { id: 3, title: "The Other Son", author: "Nick Alexander", progress: 92, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360183184i/17260533.jpg", price: "₹280" },
      { id: 4, title: "Can you keep a secret", author: "Sophie Kinsella", progress: 68, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1362040103i/6207.jpg", price: "₹399" },
      { id: 5, title: "Educated", author: "Tara Westover", progress: 55, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1505417436i/35619932.jpg", price: "₹450" },
    ],
    "Top Selling": [
      { id: 6, title: "The Alchemist", author: "Paulo Coelho", progress: 99, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1483415668i/18144590.jpg", price: "₹250" },
      { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", progress: 98, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg", price: "₹420" },
    ],
    "Following": [
      { id: 8, title: "Sapiens", author: "Yuval Noah Harari", progress: 70, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1458992095i/23692271.jpg", price: "₹600" },
    ],
    "New": [
      { id: 9, title: "The Midnight Library", author: "Matt Haig", progress: 10, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1585800040i/52578280.jpg", price: "₹480" },
      { id: 10, title: "Where the Crawdads Sing", author: "Delia Owens", progress: 15, cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1572979603i/36809135.jpg", price: "₹520" },
    ],
  };
  const trendingBooks = [
    { id: 11, title: "The Silent Patient", author: "Alex Michaelides", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1531741517i/40097951.jpg", price: "₹499" },
    { id: 12, title: "The Vanishing Half", author: "Brit Bennett", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1569477028i/51356897.jpg", price: "₹350" },
    { id: 13, title: "Project Hail Mary", author: "Andy Weir", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1601618304i/54471900.jpg", price: "₹620" },
    { id: 14, title: "Dune", author: "Frank Herbert", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555546505i/44767458.jpg", price: "₹480" },
    { id: 15, title: "Little Fires Everywhere", author: "Celeste Ng", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1500645681i/34273236.jpg", price: "₹299" },
  ];
  const newArrivals = [
    { id: 19, title: "The Echoing Silence", author: "Evelyn Reed", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1614050212i/55026903.jpg", price: "₹399" },
    { id: 20, title: "Beyond the Horizon", author: "Marcus Thorne", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1585250438i/51559139.jpg", price: "₹450" },
    { id: 21, title: "The Glass Key", author: "Serena Walsh", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388045330i/22718.jpg", price: "₹280" },
  ];
  const recommendedBooks = [
    { id: 16, title: "Circe", author: "Madeline Miller", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1520119842i/35959740.jpg", price: "₹550" },
    { id: 17, title: "The Song of Achilles", author: "Madeline Miller", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1529606001i/13623060.jpg", price: "₹580" },
    { id: 18, title: "Kafka on the Shore", author: "Haruki Murakami", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1531238495i/4929.jpg", price: "₹450" },
  ];
  const genres = [
    { id: 1, name: "Fiction", icon: <Book className={`h-10 w-10 ${currentTheme.accent}`} />, description: "Explore imaginary worlds and captivating stories." },
    { id: 2, name: "Non-fiction", icon: <Brain className={`h-10 w-10 ${currentTheme.accent}`} />, description: "Learn about real events and concepts." },
    { id: 3, name: "Sci-Fi", icon: <Rocket className={`h-10 w-10 ${currentTheme.accent}`} />, description: "Travel to the future with advanced technology and alien life." },
    { id: 4, name: "Fantasy", icon: <Ghost className={`h-10 w-10 ${currentTheme.accent}`} />, description: "Enter realms of magic, mythical creatures, and epic quests." },
    { id: 5, name: "Mystery", icon: <Search className={`h-10 w-10 ${currentTheme.accent}`} />, description: "Solve thrilling puzzles and uncover hidden secrets." },
    { id: 6, name: "Thriller", icon: <Award className={`h-10 w-10 ${currentTheme.accent}`} />, description: "Experience suspense and shocking plot twists." },
  ];
  const bestsellers = [
    { id: 20, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1465715974i/28257707.jpg", price: "₹380" },
    { id: 21, title: "Atomic Habits", author: "James Clear", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40121378.jpg", price: "₹450" },
    { id: 22, title: "The Da Vinci Code", author: "Dan Brown", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1594242661i/968.jpg", price: "₹500" },
    { id: 23, title: "Harry Potter", author: "J.K. Rowling", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1614050212i/55026903.jpg", price: "₹650" },
    { id: 24, title: "The Catcher in the Rye", author: "J.D. Salinger", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398240562i/5107.jpg", price: "₹280" },
  ];

  // Reusable tab component
  const Tab = ({ name }) => (
    <motion.button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
        activeTab === name
          ? `${currentTheme.accentButtonBg} text-white shadow-md`
          : `${currentTheme.secondaryTextColor} ${theme === 'light' ? 'hover:bg-neutral-100' : 'hover:bg-gray-600'}`
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {name}
    </motion.button>
  );

  // Reusable book card component
  const BookCard = ({ book, onAddToWishlist, onAddToCart, wishlist }) => {
    const isWished = wishlist.some(item => item.id === book.id);

    return (
      <motion.div
        className={`flex flex-col items-center text-center p-2 rounded-lg ${currentTheme.cardBg} shadow-md`}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <motion.img
          src={book.cover}
          alt={book.title}
          className="w-32 h-48 rounded-lg shadow-lg"
          whileHover={{ scale: 1.1 }}
        />
        <h3 className={`text-sm font-semibold mt-2 ${currentTheme.textColor}`}>{book.title}</h3>
        <p className={`text-xs ${currentTheme.secondaryTextColor}`}>{book.author}</p>
        {book.price && <p className={`text-sm font-bold ${currentTheme.textColor} mt-1`}>{book.price}</p>}
        <div className="flex space-x-2 mt-2">
          <motion.button onClick={() => onAddToWishlist(book)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Heart className={`h-6 w-6 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'} hover:text-red-500`} />
          </motion.button>
          <motion.button
            className={`w-full px-4 py-1 text-sm rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
            onClick={() => handleAddToCart(book)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render function for the wishlist view
  const renderWishlist = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Your Wishlist ({wishlist.length})</h2>
        <motion.button onClick={() => setView("dashboard")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <X className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
        </motion.button>
      </div>
      <div className="space-y-4">
        {wishlist.length > 0 ? wishlist.map(book => (
          <div key={book.id} className={`flex items-center space-x-4 p-4 rounded-lg ${currentTheme.cardBg}`}>
            <img src={book.cover} alt={book.title} className="w-16 h-24 rounded-lg shadow" />
            <div className="flex-1">
              <h4 className={`font-semibold ${currentTheme.textColor}`}>{book.title}</h4>
              <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{book.author}</p>
              <p className={`text-sm font-bold ${currentTheme.textColor} mt-1`}>{book.price || "Price not listed"}</p>
            </div>
            <motion.button onClick={() => handleRemoveFromWishlist(book.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Trash2 className={`h-5 w-5 ${currentTheme.iconColor} hover:text-red-500`} />
            </motion.button>
          </div>
        )) : (
          <p className={`text-center ${currentTheme.secondaryTextColor}`}>Your wishlist is empty. Add some books!</p>
        )}
      </div>
    </div>
  );

  // Render function for the cart view
  const renderCart = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Your Shopping Cart ({cart.length})</h2>
        <motion.button onClick={() => setView("dashboard")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <X className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
        </motion.button>
      </div>
      <div className="space-y-4">
        {cart.length > 0 ? cart.map(book => (
          <div key={book.id} className={`flex items-center space-x-4 p-4 rounded-lg ${currentTheme.cardBg}`}>
            <img src={book.cover} alt={book.title} className="w-16 h-24 rounded-lg shadow" />
            <div className="flex-1">
              <h4 className={`font-semibold ${currentTheme.textColor}`}>{book.title}</h4>
              <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{book.author}</p>
              <p className={`text-sm font-bold ${currentTheme.textColor} mt-1`}>{book.price || "Price not listed"}</p>
            </div>
            <motion.button onClick={() => handleRemoveFromCart(book.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Trash2 className={`h-5 w-5 ${currentTheme.iconColor} hover:text-red-500`} />
            </motion.button>
          </div>
        )) : (
          <p className={`text-center ${currentTheme.secondaryTextColor}`}>Your cart is empty.</p>
        )}
      </div>
    </div>
  );

  // Render function for the downloads modal
  const renderDownloadModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <p className={`text-lg font-semibold ${currentTheme.textColor}`}>Your downloads are empty!</p>
        <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>Get premium to read offline.</p>
        <motion.button
          onClick={() => {
            setShowDownloadModal(false);
            setView('premium');
          }}
          className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Premium
        </motion.button>
        <motion.button
          onClick={() => setShowDownloadModal(false)}
          className="mt-2 px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render function for the genres view
  const renderGenres = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor} mb-6`}>Explore Genres</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {genres.map(genre => (
          <motion.div
            key={genre.id}
            className={`flex flex-col items-center text-center p-6 rounded-xl ${currentTheme.cardBg} cursor-pointer`}
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            {genre.icon}
            <h3 className={`text-lg font-semibold mt-4 ${currentTheme.textColor}`}>{genre.name}</h3>
            <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>{genre.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render function for the bestsellers view
  const renderBestseller = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor} mb-6`}>Top Bestsellers</h2>
      <div className="grid grid-cols-1 gap-4">
        {bestsellers.map(book => (
          <div key={book.id} className={`flex items-center space-x-4 p-4 rounded-lg ${currentTheme.cardBg}`}>
            <img src={book.cover} alt={book.title} className="w-16 h-24 rounded-lg shadow" />
            <div className="flex-1">
              <h4 className={`font-semibold ${currentTheme.textColor}`}>{book.title}</h4>
              <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{book.author}</p>
              <p className={`text-sm font-bold ${currentTheme.textColor} mt-1`}>{book.price}</p>
            </div>
            <div className="flex space-x-2">
              <motion.button onClick={() => handleAddToWishlist(book)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Heart className={`h-5 w-5 ${wishlist.some(item => item.id === book.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} hover:text-red-500`} />
              </motion.button>
              <motion.button
                className={`px-3 py-1 text-xs rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
                onClick={() => handleAddToCart(book)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add to Cart
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render function for the orders view
  const renderOrders = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor} mb-6`}>Your Orders</h2>
      <div className="flex flex-col items-center justify-center h-full">
        <p className={`text-lg ${currentTheme.secondaryTextColor}`}>
          You haven't placed any orders yet.
        </p>
        <p className={`text-sm ${currentTheme.secondaryTextColor} mt-2`}>
          Start shopping to see your order history here!
        </p>
      </div>
    </div>
  );

  // Render function for the premium view
  const renderPremium = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Premium Membership</h2>
      <p className={`${currentTheme.secondaryTextColor} mt-2`}>This section is under development. Please check back later.</p>
    </div>
  );

  // Render function for the address modal
  const renderAddressModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <h3 className={`text-2xl font-bold ${currentTheme.textColor} mb-4`}>Address</h3>
        <div className={`w-full text-left p-4 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} mb-4`}>
          {addresses.map((addr, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
              <div className={`flex flex-col`}>
                <p className={`${currentTheme.textColor} font-semibold`}>{addr.default ? "Default Address" : `Address ${index + 1}`}</p>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{addr.street}, {addr.city}</p>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{addr.state} {addr.zip}, {addr.country}</p>
              </div>
              <motion.button onClick={() => handleDeleteAddress(index)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Trash2 className="h-5 w-5 text-red-500" />
              </motion.button>
            </div>
          ))}
        </div>
        <motion.button
          onClick={() => {
            setIsAddingAddress(true);
            setShowAddressModal(false);
            setView('edit-profile');
          }}
          className={`mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-semibold transition-colors`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add New Address
        </motion.button>
        <motion.button
          onClick={() => setShowAddressModal(false)}
          className="mt-2 px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render function for the display modal
  const renderDisplayModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-lg shadow-xl ${currentTheme.cardBg} flex flex-col items-center text-center`}
      >
        <h3 className={`text-2xl font-bold ${currentTheme.textColor} mb-4`}>Display Settings</h3>
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex justify-between items-center w-full">
            <label className={`text-lg font-medium ${currentTheme.textColor}`}>Theme</label>
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Sun className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Moon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
          <div className="flex justify-between items-center w-full">
            <label className={`text-lg font-medium ${currentTheme.textColor}`}>Sidebar</label>
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${isSidebarOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarOpen ? 'Collapse' : 'Expand'}
            </motion.button>
          </div>
        </div>
        <motion.button
          onClick={() => setShowDisplayModal(false)}
          className="mt-6 px-4 py-2 border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Render function for the my-profile view (static content)
  const ProfileListItem = ({ name, icon, onClick }) => (
    <motion.li
      onClick={onClick}
      className={`flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer ${currentTheme.navHover}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`${currentTheme.navIconColor}`}>
          {icon}
        </div>
        <span className={`text-lg ${currentTheme.textColor}`}>{name}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-right h-5 w-5 ${currentTheme.navIconColor}`}><path d="m9 18 6-6-6-6"/></svg>
    </motion.li>
  );

  const renderMyProfile = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg} flex flex-col`}>
      <div className="flex items-center space-x-4 mb-6">
        <motion.button onClick={() => setView('dashboard')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-left ${currentTheme.textColor}`}><path d="m15 18-6-6 6-6"/></svg>
        </motion.button>
        <h2 className={`text-2xl font-bold flex-1 ${currentTheme.textColor}`}>My Profile</h2>
      </div>
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="relative h-24 w-24 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="object-cover h-full w-full" />
          ) : (
            <span className={`text-4xl font-bold ${currentTheme.secondaryTextColor}`}>{getInitials(userProfile.name)}</span>
          )}
        </div>
        <h3 className={`text-xl font-semibold ${currentTheme.textColor}`}>{userProfile.name}</h3>
        <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{userProfile.email}</p>
        <motion.button
          onClick={() => setView('edit-profile')}
          className={`mt-4 px-4 py-2 text-sm rounded-full border-2 ${currentTheme.inputBorder} ${currentTheme.accent} font-semibold transition-colors duration-200`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit Profile
        </motion.button>
      </div>
      <div className="w-full">
        <ul className={`divide-y ${theme === 'light' ? 'divide-gray-200' : 'divide-gray-800'}`}>
          <ProfileListItem name="Favourites" icon={<Heart />} onClick={() => setView('wishlist')} />
          <ProfileListItem name="Downloads" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-download ${currentTheme.textColor}`}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>} onClick={() => setShowDownloadModal(true)} />
          <div className={`h-px my-4 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
          <ProfileListItem name="Address" icon={<MapPin />} onClick={() => setShowAddressModal(true)} />
          <ProfileListItem name="Display" icon={<Monitor />} onClick={() => setShowDisplayModal(true)} />
          <ProfileListItem name="Help" icon={<HelpCircle />} onClick={() => setShowHelpModal(true)} />
          <ProfileListItem name="Logout" icon={<LogOut />} onClick={() => setShowLogoutConfirmation(true)} />
        </ul>
      </div>
    </div>
  );

  // Render function for the edit profile view
  const renderEditProfile = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg} flex flex-col`}>
      <div className="flex items-center space-x-4 mb-6">
        <motion.button onClick={() => setView('my-profile')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-left ${currentTheme.textColor}`}><path d="m15 18-6-6 6-6"/></svg>
        </motion.button>
        <h2 className={`text-2xl font-bold flex-1 ${currentTheme.textColor}`}>{isChangingPassword ? 'Change Password' : 'Edit Profile'}</h2>
        {!isChangingPassword && (
          <motion.button
            onClick={() => setIsChangingPassword(true)}
            className={`text-sm font-semibold ${currentTheme.accent}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Change Password
          </motion.button>
        )}
      </div>
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="relative h-32 w-32 rounded-full flex items-center justify-center bg-emerald-500 text-white text-3xl font-bold overflow-hidden cursor-pointer">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="object-cover h-full w-full" />
          ) : isCameraActive ? (
            <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline />
          ) : (
            <span className="text-3xl font-bold">{getInitials(userProfile.name)}</span>
          )}
          <motion.button
            onClick={() => {
              if (!isCameraActive) startCamera();
            }}
            className="absolute bottom-0 right-0 p-1 rounded-full bg-gray-800 text-white"
          >
            <Camera className="h-5 w-5" />
          </motion.button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        <div className="mt-4">
          <h3 className={`text-lg font-semibold ${currentTheme.textColor}`}>{userProfile.name}</h3>
          <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{userProfile.email}</p>
        </div>
      </div>
      {isCameraActive && (
        <div className="flex space-x-2 mb-6">
          <motion.button
            onClick={takePhoto}
            className={`flex-1 px-4 py-2 rounded-full font-semibold ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Take Photo
          </motion.button>
          <motion.button
            onClick={stopCamera}
            className={`flex-1 px-4 py-2 rounded-full font-semibold border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        </div>
      )}
      <div className="space-y-6 mb-8">
        {!isChangingPassword ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div>
              <label className={`block text-sm font-medium ${currentTheme.secondaryTextColor} mb-1`}>Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${currentTheme.secondaryTextColor} mb-1`}>Email</label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${currentTheme.secondaryTextColor} mb-1`}>Username</label>
              <input
                type="text"
                value={userProfile.username}
                onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${currentTheme.secondaryTextColor} mb-1`}>Phone Number</label>
              <input
                type="text"
                value={userProfile.phoneNumber}
                onChange={(e) => setUserProfile({ ...userProfile, phoneNumber: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
              />
            </div>
            <div className="space-y-4 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
              <h3 className={`text-lg font-medium ${currentTheme.textColor}`}>Addresses</h3>
              {addresses.map((addr, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${currentTheme.cardHover}`}>
                  <div className={`flex flex-col`}>
                    <span className={`text-sm font-semibold ${currentTheme.textColor}`}>
                      {addr.default && "Default "}Address {index + 1}
                    </span>
                    <span className={`text-xs ${currentTheme.secondaryTextColor}`}>
                      {addr.street}, {addr.city}
                    </span>
                  </div>
                  <motion.button onClick={() => handleDeleteAddress(index)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Trash2 className={`h-5 w-5 text-red-500`} />
                  </motion.button>
                </div>
              ))}
              {isAddingAddress ? (
                <div className="space-y-2 mt-4">
                  <input type="text" placeholder="Street" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor}`} />
                  <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor}`} />
                  <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor}`} />
                  <input type="text" placeholder="Zip" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor}`} />
                  <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor}`} />
                  <div className="flex space-x-2 mt-2">
                    <motion.button onClick={handleAddAddress} className={`flex-1 px-4 py-2 rounded-full font-semibold ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Save Address</motion.button>
                    <motion.button onClick={() => setIsAddingAddress(false)} className={`flex-1 px-4 py-2 rounded-full font-semibold border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                  </div>
                </div>
              ) : (
                <motion.button onClick={() => setIsAddingAddress(true)} className={`w-full px-4 py-2 text-sm rounded-full border-2 ${currentTheme.inputBorder} ${currentTheme.accent} font-semibold transition-colors duration-200`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Add New Address</motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div>
              <label className={`block text-sm font-medium ${currentTheme.secondaryTextColor} mb-1`}>New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${currentTheme.secondaryTextColor} mb-1`}>Re-enter New Password</label>
              <input
                type="password"
                value={passwords.reEnterPassword}
                onChange={(e) => setPasswords({ ...passwords, reEnterPassword: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
              />
            </div>
            <motion.button
              onClick={() => setIsChangingPassword(false)}
              className={`w-full px-4 py-2 rounded-full font-semibold border-2 border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel Password Change
            </motion.button>
          </motion.div>
        )}
      </div>
      <div className="flex space-x-4">
        <motion.button
          className={`flex-1 px-6 py-2 rounded-full font-semibold ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveChanges}
        >
          Save Changes
        </motion.button>
        <motion.button
          className={`flex-1 px-6 py-2 rounded-full font-semibold border-2 border-red-500 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLogoutConfirmation(true)}
        >
          Logout
        </motion.button>
      </div>
    </div>
  );

  // Render function for the static settings view
  const renderSettings = () => (
    <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardBg}`}>
      <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>Settings Page Placeholder</h2>
      <p className={`${currentTheme.secondaryTextColor} mt-2`}>
        This is the internal view placeholder for the 'Settings' link. 
        It reflects the navigation to: 
        <span className="font-mono text-emerald-500"> /user/settings</span>
      </p>
    </div>
  );

  // Main content rendering logic based on the current view
  const renderContent = () => {
    switch (view) {
      case "dashboard":
      case "home":
        return (
          <>
            <div className={`flex-1 p-6 rounded-xl shadow-md ${currentTheme.cardHover}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  {["Popular", "Top Selling", "Following", "New"].map((tab) => (
                    <Tab key={tab} name={tab} />
                  ))}
                </div>
                <motion.button
                  className={`px-4 py-2 text-sm rounded-full border-2 ${currentTheme.inputBorder} ${currentTheme.accent} font-semibold transition-colors duration-200`}
                  onClick={() => setView('bestseller')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All
                </motion.button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {bookData[activeTab]?.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlist}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 mt-6">
              <div className={`flex-1 p-6 rounded-xl shadow-md ${currentTheme.cardHover}`}>
                <h3 className={`text-lg font-bold ${currentTheme.textColor} mb-4`}>Trending</h3>
                <ul className="space-y-4">
                  {trendingBooks.map((book) => (
                    <motion.li
                      key={book.id}
                      className="flex items-center justify-between"
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center space-x-4">
                        <img src={book.cover} alt={book.title} className="w-12 h-18 rounded-lg shadow" />
                        <div>
                          <p className={`font-semibold ${currentTheme.textColor}`}>{book.title}</p>
                          <p className={`text-xs ${currentTheme.secondaryTextColor}`}>{book.author}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button onClick={() => handleAddToWishlist(book)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Heart className={`h-5 w-5 ${wishlist.some(item => item.id === book.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} hover:text-red-500`} />
                        </motion.button>
                        <motion.button
                          className={`px-4 py-1 text-sm rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
                          onClick={() => handleAddToCart(book)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className={`flex-1 p-6 rounded-xl shadow-md ${currentTheme.cardHover}`}>
                <h3 className={`text-lg font-bold ${currentTheme.textColor} mb-4`}>New Arrivals</h3>
                <ul className="space-y-4">
                  {newArrivals.map((book) => (
                    <motion.li
                      key={book.id}
                      className="flex items-center justify-between"
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center space-x-4">
                        <img src={book.cover} alt={book.title} className="w-12 h-18 rounded-lg shadow" />
                        <div>
                          <p className={`font-semibold ${currentTheme.textColor}`}>{book.title}</p>
                          <p className={`text-xs ${currentTheme.secondaryTextColor}`}>{book.author}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button onClick={() => handleAddToWishlist(book)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Heart className={`h-5 w-5 ${wishlist.some(item => item.id === book.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} hover:text-red-500`} />
                        </motion.button>
                        <motion.button
                          className={`px-4 py-1 text-sm rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
                          onClick={() => handleAddToCart(book)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={`flex flex-col space-y-4 p-6 rounded-xl shadow-md mt-6 ${currentTheme.cardHover}`}>
              <h3 className={`text-lg font-bold ${currentTheme.textColor} mb-4`}>Recommended for You</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recommendedBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    className={`flex flex-col items-center text-center p-2 rounded-lg ${currentTheme.cardBg}`}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <motion.img
                      src={book.cover}
                      alt={book.title}
                      className="w-32 h-48 rounded-lg shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    />
                    <h3 className={`text-sm font-semibold mt-2 ${currentTheme.textColor}`}>{book.title}</h3>
                    <p className={`text-xs ${currentTheme.secondaryTextColor}`}>{book.author}</p>
                    <div className="flex space-x-2 mt-2">
                      <motion.button onClick={() => handleAddToWishlist(book)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Heart className={`h-6 w-6 ${wishlist.some(item => item.id === book.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} hover:text-red-500`} />
                      </motion.button>
                      <motion.button
                        className={`w-full px-4 py-1 text-sm rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white transition-colors duration-200`}
                        onClick={() => handleAddToCart(book)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        );
      case "wishlist":
        return renderWishlist();
      case "cart":
        return renderCart();
      case "filters":
        return renderGenres();
      case "bestseller":
        return renderBestseller();
      case "your-orders":
        return renderOrders();
      case "premium":
        return renderPremium();
      case "my-profile":
        return renderMyProfile();
      case "edit-profile":
        return renderEditProfile();
      case "settings":
        return renderSettings();
      default:
        return (
          <div className={`p-6 rounded-xl shadow-md w-full ${currentTheme.cardHover}`}>
            <h2 className={`text-2xl font-bold ${currentTheme.textColor}`}>404 - View Not Found</h2>
            <p className={`${currentTheme.secondaryTextColor} mt-2`}>The requested view could not be loaded.</p>
          </div>
        );
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="h-6 w-6" />, view: 'dashboard' },
    { name: 'Bestseller', icon: <Award className="h-6 w-6" />, view: 'bestseller' },
    // Genres now directly opens the category page
    { 
      name: 'Genres', 
      icon: <ListFilter className="h-6 w-6" />, 
      view: 'genres', 
      onClick: () => { window.location.href = '/user/category'; } 
    },
    { name: 'Premium', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card h-6 w-6"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>, view: 'premium' },
    { name: 'Your Orders', icon: <ShoppingBag className="h-6 w-6" />, view: 'your-orders' },
    // Settings now uses onClick to navigate to /user/settings
    { 
      name: 'Settings', 
      icon: <Settings className="h-6 w-6" />, 
      view: 'settings', 
      onClick: () => { window.location.href = '/user/settings'; } 
    },
    { name: 'Help', icon: <HelpCircle className="h-6 w-6" />, view: 'help', onClick: () => setShowHelpModal(true) },
  ];

  const ProfilePopup = () => (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`absolute top-16 right-4 w-72 p-4 rounded-lg shadow-xl z-50 ${currentTheme.cardBg}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-emerald-500 text-white text-3xl font-bold overflow-hidden">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="object-cover h-full w-full" />
          ) : (
            <span className="text-3xl font-bold">{getInitials(userProfile.name)}</span>
          )}
        </div>
        <div className="text-center">
          <h3 className={`text-lg font-semibold ${currentTheme.textColor}`}>{userProfile.name}</h3>
          <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{userProfile.email}</p>
        </div>
        <div className="flex w-full space-x-2">
          <motion.button
            onClick={() => {
              // Directs to My Profile view, which contains all profile options
              setView('my-profile');
              setShowProfilePopup(false);
            }}
            className={`flex-1 px-4 py-2 text-sm rounded-full ${currentTheme.accentButtonBg} ${currentTheme.accentButtonHover} text-white font-semibold transition-colors duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Profile
          </motion.button>
          <motion.button
            onClick={() => setShowLogoutConfirmation(true)}
            className={`flex-1 px-4 py-2 text-sm rounded-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.div>
  );


  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.appBg}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 256 : 72 }}
        animate={{ width: isSidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.2 }}
        className={`flex flex-col p-4 shadow-xl z-30 ${currentTheme.sidebarBg} transition-all duration-200`}
      >
        {/* Sidebar Header (Logo moved to main Header) */}
        <div className={`flex items-center ${isSidebarOpen ? 'justify-end' : 'justify-center'} mb-8 h-10`}>
          {/* Show a placeholder or the collapsed icon, since the full logo is now in the main header */}
          {!isSidebarOpen && (
            <motion.button
              onClick={() => setView('dashboard')}
              className="flex items-center justify-center bg-emerald-700 h-10 w-10 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Book className="h-6 w-6 text-white" />
            </motion.button>
          )}
          <motion.button onClick={() => setIsSidebarOpen(!isSidebarOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={isSidebarOpen ? '' : 'ml-2'}>
            <Menu className={`h-6 w-6 ${currentTheme.navIconColor} transition-transform duration-200 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
          </motion.button>
        </div>
        <nav className="flex-1 space-y-4 w-full">
          {menuItems.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => {
                // Use onClick if defined (for external navigation like Genres and Settings), otherwise use internal setView.
                if (item.onClick) {
                  item.onClick();
                } else {
                  setView(item.view);
                }
              }}
              className={`relative flex items-center w-full rounded-lg py-2 px-3 transition-colors duration-200 ${
                view === item.view
                  ? `${currentTheme.accentButtonBg} text-white shadow-md`
                  : `${currentTheme.navTextColor} ${currentTheme.navHover}`
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => !isSidebarOpen && setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`${view === item.view ? 'text-white' : currentTheme.navIconColor}`}>
                {item.icon}
              </div>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 font-semibold"
                >
                  {item.name}
                </motion.span>
              )}
              {!isSidebarOpen && hoveredItem === item.name && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-40"
                >
                  {item.name}
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>
        <div className="mt-8">
          <motion.button
            onClick={handleThemeToggle}
            className={`flex items-center w-full rounded-lg py-2 px-3 transition-colors duration-200 ${currentTheme.navTextColor} ${currentTheme.navHover}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => !isSidebarOpen && setHoveredItem('Theme')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {theme === 'light' ? <Sun className={`h-6 w-6 ${currentTheme.navIconColor}`} /> : <Moon className={`h-6 w-6 ${currentTheme.navIconColor}`} />}
            {isSidebarOpen && (
              <span className="ml-4 font-semibold">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
            {!isSidebarOpen && hoveredItem === 'Theme' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-40"
              >
                Toggle Theme
              </motion.div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header - MODIFIED LAYOUT */}
        <header className={`p-4 shadow-md flex items-center justify-between z-20 sticky top-0 ${currentTheme.headerBg}`}>
          
          {/* 1. Logo (Left Corner) - Same style kept */}
          <motion.button
              onClick={() => setView('dashboard')}
              className="flex items-center cursor-pointer shrink-0 min-w-[150px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
          >
              <span className={`text-3xl font-bold ${currentTheme.pagify.text1}`}> Pa </span>
              <span className={`text-5xl font-bold leading-none ${currentTheme.pagify.text2}`}> G </span>
              <span className={`text-3xl font-bold ${currentTheme.pagify.text1}`}> ify </span>
          </motion.button>
          
          {/* 2. Search Bar (Middle) - MAX-WIDTH INCREASED from max-w-xl to max-w-2xl */}
          <div className="relative flex-1 max-w-2xl mx-8">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${currentTheme.secondaryTextColor}`} />
            <input
              type="text"
              placeholder="Search for books, authors, or ISBN..."
              className={`w-full py-2 pl-10 pr-4 rounded-full border-2 ${currentTheme.inputBorder} ${currentTheme.inputBg} ${theme === 'dark' ? 'text-gray-900' : currentTheme.textColor} focus:outline-none focus:ring-2 focus:ring-emerald-300`}
            />
          </div>
          
          {/* 3. Icons (Right) */}
          <div className="flex items-center space-x-4 shrink-0">
            <motion.button
              onClick={() => { window.location.href = '/user/wishlist'; }} // Wishlist Link
              className="relative p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredHeaderItem('Wishlist')}
              onMouseLeave={() => setHoveredHeaderItem(null)}
            >
              <Heart className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                  {wishlist.length}
                </span>
              )}
              {hoveredHeaderItem === 'Wishlist' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Wishlist
                </motion.div>
              )}
            </motion.button>
            <motion.button
              onClick={() => { window.location.href = '/user/cart'; }} // Cart Link
              className="relative p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredHeaderItem('Cart')}
              onMouseLeave={() => setHoveredHeaderItem(null)}
            >
              <ShoppingCart className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white text-xs font-bold">
                  {cart.length}
                </span>
              )}
              {hoveredHeaderItem === 'Cart' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Cart
                </motion.div>
              )}
            </motion.button>
            <motion.button
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredHeaderItem('Profile')}
              onMouseLeave={() => setHoveredHeaderItem(null)}
            >
              <User className={`h-6 w-6 ${currentTheme.headerIconColor}`} />
              {hoveredHeaderItem === 'Profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Profile
                </motion.div>
              )}
            </motion.button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Popups and Modals */}
      {showProfilePopup && <ProfilePopup />}
      {showLogoutConfirmation && <LogoutConfirmationModal onYes={handleLogout} onNo={() => setShowLogoutConfirmation(false)} />}
      {showLogoutMessage && <MessageModal message="You have been successfully logged out!" onClose={() => setShowLogoutMessage(false)} />}
      {showConfirmation && <MessageModal message={confirmationMessage} onClose={() => setShowConfirmation(false)} />}
      {showDownloadModal && renderDownloadModal()}
      {showAddressModal && renderAddressModal()}
      {showDisplayModal && renderDisplayModal()}
      {showHelpModal && <HelpModal />}
    </div>
  );
}