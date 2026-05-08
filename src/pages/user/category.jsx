import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BadgeDollarSign, LoaderCircle, Filter, Heart, ShoppingCart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { useInventory } from '../../context/InventoryContext.jsx';
import UserHeader from "../../components/common/UserHeader.jsx";
import { fetchWishlist as fetchWishlistAPI, fetchCart as fetchCartAPI } from '../../services/inventoryApi';
import { getWishlistFromStorage } from '../../utils/wishlistUtils';
import { getCartFromStorage } from '../../utils/cartUtils';

// --- Book data simulation & definitions ---
const allGenres = [
    "horror", "romance", "mystery thriller", "science", "fiction", "non fiction", "autobiography",
    "business & economy", "self help", "study materials", "current affairs & politics", "travel",
    "art & photography", "bengali", "children's book", "cooking", "manga", "poetry",
    "religion & spirituality"
];

const pretty = {
    "horror": "Horror", 
    "romance": "Romance", 
    "mystery thriller": "Mystery Thriller",
    "science": "Science",
    "fiction": "Fiction",
    "non fiction": "Non Fiction",
    "autobiography": "Autobiography", 
    "business & economy": "Business & Economy",
    "self help": "Self Help", 
    "study materials": "Study Materials", 
    "current affairs & politics": "Current Affairs & Politics",
    "travel": "Travel", 
    "art & photography": "Art & Photography", 
    "bengali": "Bengali",
    "children's book": "Children's Book", 
    "cooking": "Cooking", 
    "manga": "Manga", 
    "poetry": "Poetry",
    "religion & spirituality": "Religion & Spirituality"
};

const generateId = (() => {
    let idCounter = 1;
    return () => `b${idCounter++}`;
})();

const generateBooks = () => {
    const forms = ['e-read', 'hard-copy'];
    const generatedBooks = [];
    allGenres.forEach(sub => {
        const premiumIndices = new Set();
        while (premiumIndices.size < 2) premiumIndices.add(Math.floor(Math.random() * 7));
        for (let i = 0; i < 7; i++) {
            const id = generateId();
            const isPremium = premiumIndices.has(i);
            const title = `${pretty[sub]} Book ${i + 1}`;
            const price = (Math.floor(Math.random() * 30) + 10);
            generatedBooks.push({
                id,
                subcategory: sub,
                title,
                price,
                premium: isPremium,
                form: forms[Math.floor(Math.random() * forms.length)],
                image: `https://placehold.co/200x260/${(isPremium ? 'd1d1d1' : 'cfcfcf')}/333333?text=${encodeURIComponent(title.replace(' ', '\n'))}`,
            });
        }
    });
    return generatedBooks;
};

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto p-6 relative"
                    initial={{ scale: 0.9, y: -50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                    <h2 className="text-2xl font-bold mb-4">{title}</h2>
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Book Card Component (Moved outside App for better performance) ---
const BookCard = ({ book, onWishlistClick, onCartClick, onPremiumClick, isWishlisted }) => (
    <div className="bg-white rounded-xl p-4 text-center book-card relative flex flex-col items-center shadow-lg hover:shadow-xl transition-all duration-300">
        <img
            src={book.image}
            alt={book.title}
            className="w-full h-auto rounded-lg object-cover mb-4 shadow-md"
        />
        <div className="flex-1 w-full text-left">
            <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{book.title}</h3>
            <div className="text-sm font-medium text-gray-600 mt-1">₹{book.price.toFixed(2)}</div>
            <div className="text-xs text-gray-400 mt-1">{pretty[book.subcategory]}</div>
        </div>
        <div className="mt-4 w-full flex justify-between items-center gap-2">
            {book.premium ? (
                <button
                    className="w-full bg-yellow-500 text-white px-3 py-2 rounded-full text-sm font-bold hover:bg-yellow-600 transition-colors shadow-md flex items-center justify-center gap-1.5"
                    onClick={() => onPremiumClick()}
                >
                    <BadgeDollarSign size={16} /> Premium
                </button>
            ) : (
                <button
                    className="w-full bg-emerald-500 text-white px-3 py-2 rounded-full text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-1.5"
                    onClick={() => onCartClick(book.id)}
                >
                    <ShoppingCart size={16} />
                    Add to Cart
                </button>
            )}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
                className={`wish-btn p-2 rounded-full transition-all duration-200 hover:bg-gray-100 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
                onClick={() => onWishlistClick(book.id)}
                title="Add to wishlist"
            >
                <Heart size={20} className={`${isWishlisted ? 'fill-current' : ''}`} />
            </button>
        </div>
    </div>
)

// --- Main App Component ---
export const App = () => {
    const API = 'https://pagify-g5g5.onrender.com/api/v1'
    const PRICE_SLIDER_MAX = 10000
    const [books, setBooks] = useState([])
    const [wishlist, setWishlist] = useState(new Set())
    const [cart, setCart] = useState(new Set())
    const [searchTerm, setSearchTerm] = useState('')
    const [userId, setUserId] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [profileImage, setProfileImage] = useState(null)
    const { cartCount, wishlistCount, setUserId: setCtxUser, fetchCounts, addToWishlist, removeFromWishlist, addToCart } = useInventory()

    // Active filter state
    const [selectedSubcategories, setSelectedSubcategories] = useState([])
    const [selectedForms, setSelectedForms] = useState([])
    const [minPrice, setMinPrice] = useState(0)
    const [maxPrice, setMaxPrice] = useState(PRICE_SLIDER_MAX)

    // Sorting state
    const [sortOption, setSortOption] = useState('relevance')

    // Kept for Premium Modal only
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    // Removed wishlistPop and cartPop states
    const [loading, setLoading] = useState(true)

    // Initial data: fetch from backend
    useEffect(() => {
        let isMounted = true
        setLoading(true)
        axios.get(`${API}/products/public`)
            .then(res => {
                const arr = Array.isArray(res.data?.products)
                    ? res.data.products
                    : (res.data?.data?.products || [])
                const mapped = arr.map(p => ({
                    id: p._id,
                    subcategory: (p.categories && p.categories[0]) ? String(p.categories[0]).toLowerCase().trim() : 'general',
                    title: p.title || 'Untitled',
                    price: Number(p.price) || 0,
                    image: p.coverImage || '',
                    premium: false,
                    form: 'hard-copy',
                    createdAt: p.createdAt || null,
                }))
                if (isMounted) {
                    setBooks(mapped)
                    const maxP = mapped.reduce((m, b) => Math.max(m, b.price), 0)
                    // Set the currently selected upper bound to dataset max (capped), slider max remains 10000
                    setMaxPrice(Math.min(PRICE_SLIDER_MAX, Math.ceil(maxP || PRICE_SLIDER_MAX)))
                }
            })
            .catch(err => {
                console.error('Failed to fetch products:', err)
                if (isMounted) setBooks([])
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })
        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const user = res.data?.user;
                const uid = user?._id || user?.id
                if (uid) {
                    setUserId(uid)
                    setCtxUser(uid)
                    setUserProfile(user);
                    setProfileImage(user?.profilePicture);
                    fetchCounts()
                    // Load persisted wishlist/cart for icon state
                    ;(async () => {
                        try {
                            const [wishItems, cartItems] = await Promise.all([
                                fetchWishlistAPI().catch(() => []),
                                fetchCartAPI().catch(() => []),
                            ])
                            const wishSet = new Set((wishItems || []).map(x => String(x._id || x.id || x)))
                            const cartSet = new Set((cartItems || []).map(it => String(it.product?._id || it.product?.id || it.product || it)))
                            setWishlist(wishSet)
                            setCart(cartSet)
                        } catch {
                            const localWish = getWishlistFromStorage(uid).map(it => it._id)
                            const localCart = getCartFromStorage(uid).map(it => it._id)
                            setWishlist(new Set(localWish))
                            setCart(new Set(localCart))
                        }
                    })()
                }
            })
            .catch(() => {})
    }, [])

    // Memoize filtered books
    const filteredBooks = useMemo(() => {
        let newFilteredBooks = books

        if (selectedSubcategories.length > 0) {
            newFilteredBooks = newFilteredBooks.filter(b => selectedSubcategories.includes(b.subcategory))
        }

        if (selectedForms.length > 0) {
            newFilteredBooks = newFilteredBooks.filter(b => {
                if (selectedForms.includes('premium')) {
                    if (b.premium) return true
                }
                if (selectedForms.includes('hard-copy')) {
                    if (b.form === 'hard-copy') return true
                }
                return false
            })
        }

        newFilteredBooks = newFilteredBooks.filter(b => b.price >= minPrice && b.price <= maxPrice)

        if (searchTerm) {
            newFilteredBooks = newFilteredBooks.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        return newFilteredBooks
    }, [books, selectedSubcategories, selectedForms, minPrice, maxPrice, searchTerm])

    // Sorted books
    const sortedBooks = useMemo(() => {
        const arr = [...filteredBooks]
        switch (sortOption) {
            case 'price_asc':
                arr.sort((a, b) => a.price - b.price)
                break
            case 'price_desc':
                arr.sort((a, b) => b.price - a.price)
                break
            case 'newest':
                arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                break
            default:
                break
        }
        return arr
    }, [filteredBooks, sortOption])

    // --- Handlers ---
    const handleGenreFilterChange = (e) => {
        const { value, checked } = e.target
        setSelectedSubcategories(prev => checked ? [...prev, value] : prev.filter(sub => sub !== value))
    }
    
    const handleFormFilterChange = (e) => {
        const { value, checked } = e.target
        setSelectedForms(prev => checked ? [...prev, value] : prev.filter(form => form !== value))
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setSelectedSubcategories([])
        setSelectedForms([])
    }
    
    const handleClearAll = () => {
        setSelectedSubcategories([])
        setSelectedForms([])
        setMinPrice(0)
        setMaxPrice(50)
        setSearchTerm('')
        setSortOption('relevance')
    }

    const handleWishlistClick = async (id) => {
        const isWished = wishlist.has(id)
        try {
            if (isWished) {
                await removeFromWishlist(id)
                setWishlist(prev => {
                    const ns = new Set(prev)
                    ns.delete(id)
                    return ns
                })
            } else {
                await addToWishlist(id)
                setWishlist(prev => {
                    const ns = new Set(prev)
                    ns.add(id)
                    return ns
                })
            }
        } catch {
            // leave UI unchanged on failure
        }
    }

    const handleCartClick = async (id) => {
        try {
            await addToCart(id, 1)
            setCart(prev => {
                const ns = new Set(prev)
                ns.add(id)
                return ns
            })
            window.location.href = '/user/cart'
        } catch {
            // ignore failure for now
        }
    }

    const handlePremiumClick = () => {
        setShowPremiumModal(true)
    }

    const getBooksFromSet = (itemSet) => {
        return Array.from(itemSet).map(id => books.find(b => b.id === id))
    }

    const renderSearchResults = () => {
        if (!searchTerm) return null
        const parts = sortedBooks.length > 0 ? [`Found ${sortedBooks.length} result(s) for `, `"${searchTerm}"`] : [`No results found for `, `"${searchTerm}"`]
        return (
            <h2 className="text-xl font-semibold mb-4">
                {parts[0]}<span className="text-blue-600 font-bold">{parts[1]}</span>
            </h2>
        )
    }

    const renderBookGrid = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-12">
                    <LoaderCircle size={48} className="animate-spin text-blue-600" />
                </div>
            )
        }

        if (sortedBooks.length === 0) {
            return (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500 shadow-lg">
                    No books found. Please adjust your filters or search term.
                </div>
            )
        }
        return (
            <div id="bookGrid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <AnimatePresence>
                    {sortedBooks.map(book => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <BookCard
                                book={book}
                                onWishlistClick={handleWishlistClick}
                                onCartClick={handleCartClick}
                                onPremiumClick={handlePremiumClick}
                                isWishlisted={wishlist.has(book.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col font-inter">
            <style>
                {`
                .book-card { transition: transform .18s, box-shadow .18s; }
                .book-card:hover { transform: translateY(-6px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
                .wish-btn, .cart-btn { transform: translateY(0); transition: transform .2s ease-in-out; }
                .wish-btn:hover, .cart-btn:hover { transform: translateY(-2px); }

                /* Custom style to enforce emerald color on checked checkboxes */
                input[type="checkbox"]:checked {
                    accent-color: #10b981;
                }

                /* Custom range slider styling */
                .range-slider-container {
                    position: relative;
                    height: 24px;
                    width: 100%;
                }
                
                .range-slider-container input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    width: 100%;
                    position: absolute;
                    pointer-events: none;
                }

                .range-slider-container input[type="range"]::-webkit-slider-runnable-track {
                    height: 8px;
                    background: #e5e7eb; /* gray-200 */
                    border-radius: 9999px;
                }

                .range-slider-container input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 16px;
                    width: 16px;
                    background-color: #10b981; /* emerald-500 */
                    border-radius: 9999px;
                    margin-top: -4px;
                    cursor: pointer;
                    pointer-events: all;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    transition: transform 0.1s ease-in-out;
                }

                .range-slider-container input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                
                .tooltip-container {
                    position: relative;
                    display: inline-block;
                }
                .tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(-8px);
                    background-color: #333;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    white-space: nowrap;
                    font-size: 0.75rem;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s, visibility 0.2s;
                    pointer-events: none;
                    z-index: 10;
                }
                .tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px;
                    border-style: solid;
                    border-color: #333 transparent transparent transparent;
                }
                .tooltip-container:hover .tooltip {
                    opacity: 1;
                    visibility: visible;
                }

                `}
            </style>
            <UserHeader
                onLogoClick={() => window.location.assign('/user/home')}
                showSearch={true}
                searchTerm={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setSelectedSubcategories([]);
                    setSelectedForms([]);
                }}
                userProfile={userProfile}
                profileImage={profileImage}
            />

            {/* Main Content */}
            <main className="container mx-auto max-w-screen-2xl px-4 md:px-12 py-8 flex flex-1">
                {/* Sidebar */}
                <aside className="w-full md:w-1/5 p-6 bg-white rounded-xl border border-gray-200 shadow-md flex-shrink-0 flex flex-col h-full overflow-hidden sticky top-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={20} className="text-gray-500" />
                        <h3 className="font-bold text-lg text-gray-800">Filter by</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '75vh' }}>
                        {/* Sorting */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">Sort By</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                        <input type="radio" name="sort" value="relevance" checked={sortOption==='relevance'} onChange={(e)=>setSortOption(e.target.value)} />
                                        Relevance
                                    </label>
                                </li>
                                <li>
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                        <input type="radio" name="sort" value="price_asc" checked={sortOption==='price_asc'} onChange={(e)=>setSortOption(e.target.value)} />
                                        Price: Low to High
                                    </label>
                                </li>
                                <li>
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                        <input type="radio" name="sort" value="price_desc" checked={sortOption==='price_desc'} onChange={(e)=>setSortOption(e.target.value)} />
                                        Price: High to Low
                                    </label>
                                </li>
                                <li>
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                        <input type="radio" name="sort" value="newest" checked={sortOption==='newest'} onChange={(e)=>setSortOption(e.target.value)} />
                                        Newest
                                    </label>
                                </li>
                            </ul>
                        </div>

                        {/* Genre Filter */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">Genre</h4>
                            <ul className="space-y-2 text-sm">
                                {allGenres.map(sub => (
                                    <li key={sub}>
                                        <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox text-emerald-500 rounded-sm border-gray-300 focus:ring-emerald-500"
                                                value={sub}
                                                checked={selectedSubcategories.includes(sub)}
                                                onChange={handleGenreFilterChange}
                                            />
                                            {pretty[sub]}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">Price Range</h4>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>₹{minPrice}</span>
                                <span>₹{maxPrice}</span>
                            </div>
                            <div className="range-slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max={PRICE_SLIDER_MAX}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max={PRICE_SLIDER_MAX}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                                />
                            </div>
                        </div>

                        {/* Form Filter */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">Form</h4>
                            <ul className="space-y-2 text-sm">
                                <li key="hard-copy">
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox text-emerald-500 rounded-sm border-gray-300 focus:ring-emerald-500"
                                            value="hard-copy"
                                            checked={selectedForms.includes('hard-copy')}
                                            onChange={handleFormFilterChange}
                                        />
                                        Hard Copy
                                    </label>
                                </li>
                                <li key="premium">
                                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-emerald-500 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox text-emerald-500 rounded-sm border-gray-300 focus:ring-emerald-500"
                                            value="premium"
                                            checked={selectedForms.includes('premium')}
                                            onChange={handleFormFilterChange}
                                        />
                                        Premium Special
                                    </label>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2 mt-2 flex-shrink-0">
                        <button
                            onClick={handleClearAll}
                            className="w-full border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors tooltip-container group"
                        >
                            Clear All
                            <span className="tooltip">Reset all filters</span>
                        </button>
                    </div>
                </aside>

                {/* Book Grid */}
                <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                        {renderSearchResults() || (
                            <h2 className="text-xl font-semibold text-gray-800">
                                {selectedSubcategories.length > 0 ? `Showing: ${selectedSubcategories.map(s => pretty[s]).join(', ')}` : 'Explore your next favourite!'}
                            </h2>
                        )}
                        <div className="text-sm text-gray-500">
                            {sortedBooks.length} Books
                        </div>
                    </div>

                    {renderBookGrid()}
                </div>
            </main>
            {/* ... existing modals and footer ... */}
        </div>
    )
}

export default App;
