import React, { useState, useEffect } from 'react';

export default function Reviews({ onBack, darkMode }) {
  // Sample review data (in a real app, this would come from an API)
  const [allReviews, setAllReviews] = useState([
    { 
      id: 1, 
      bookTitle: "The Great Gatsby", 
      bookId: "book-001",
      bookCover: "https://ui-avatars.com/api/?name=Great+Gatsby&size=128&background=random",
      userName: "John Smith", 
      rating: 5, 
      reviewText: "One of the best classics I've ever read. The prose is beautiful and the story is captivating.",
      date: "2023-10-15"
    },
    { 
      id: 2, 
      bookTitle: "To Kill a Mockingbird", 
      bookId: "book-002",
      bookCover: "https://ui-avatars.com/api/?name=Mockingbird&size=128&background=random",
      userName: "Emily Johnson", 
      rating: 5, 
      reviewText: "A powerful story that remains relevant today. Scout's narrative is both innocent and profound.",
      date: "2023-10-10"
    },
    { 
      id: 3, 
      bookTitle: "1984", 
      bookId: "book-003",
      bookCover: "https://ui-avatars.com/api/?name=1984&size=128&background=random",
      userName: "Michael Brown", 
      rating: 4, 
      reviewText: "A chilling dystopian novel that makes you think about surveillance and freedom.",
      date: "2023-10-05"
    },
    { 
      id: 4, 
      bookTitle: "Pride and Prejudice", 
      bookId: "book-004",
      bookCover: "https://ui-avatars.com/api/?name=Pride+Prejudice&size=128&background=random",
      userName: "Sarah Davis", 
      rating: 3, 
      reviewText: "A classic romance with witty dialogue, though I found some parts to be slow-paced.",
      date: "2023-09-28"
    },
    { 
      id: 5, 
      bookTitle: "The Hobbit", 
      bookId: "book-005",
      bookCover: "https://ui-avatars.com/api/?name=Hobbit&size=128&background=random",
      userName: "David Wilson", 
      rating: 5, 
      reviewText: "An enchanting adventure that transports you to Middle-earth. Tolkien's world-building is unmatched.",
      date: "2023-09-20"
    },
    { 
      id: 6, 
      bookTitle: "Harry Potter and the Sorcerer's Stone", 
      bookId: "book-006",
      bookCover: "https://ui-avatars.com/api/?name=Harry+Potter&size=128&background=random",
      userName: "Jessica Martinez", 
      rating: 4, 
      reviewText: "A magical start to an incredible series. The characters are endearing and the world is fascinating.",
      date: "2023-09-15"
    },
    { 
      id: 7, 
      bookTitle: "The Catcher in the Rye", 
      bookId: "book-007",
      bookCover: "https://ui-avatars.com/api/?name=Catcher+Rye&size=128&background=random",
      userName: "Robert Taylor", 
      rating: 2, 
      reviewText: "I couldn't connect with Holden Caulfield and found his constant complaining tiresome.",
      date: "2023-09-10"
    },
    { 
      id: 8, 
      bookTitle: "The Lord of the Rings", 
      bookId: "book-008",
      bookCover: "https://ui-avatars.com/api/?name=LOTR&size=128&background=random",
      userName: "Amanda Thomas", 
      rating: 5, 
      reviewText: "An epic fantasy masterpiece with incredible depth and detail. The journey is unforgettable.",
      date: "2023-09-05"
    },
    { 
      id: 9, 
      bookTitle: "The Great Gatsby", 
      bookId: "book-001",
      bookCover: "https://ui-avatars.com/api/?name=Great+Gatsby&size=128&background=random",
      userName: "Lisa Johnson", 
      rating: 4, 
      reviewText: "A beautiful portrayal of the Jazz Age and the American Dream. Fitzgerald's writing is exquisite.",
      date: "2023-08-25"
    },
    { 
      id: 10, 
      bookTitle: "The Hobbit", 
      bookId: "book-005",
      bookCover: "https://ui-avatars.com/api/?name=Hobbit&size=128&background=random",
      userName: "Mark Williams", 
      rating: 4, 
      reviewText: "A delightful adventure that's perfect for all ages. Bilbo Baggins is such a relatable protagonist.",
      date: "2023-08-15"
    },
    { 
      id: 11, 
      bookTitle: "1984", 
      bookId: "book-003",
      bookCover: "https://ui-avatars.com/api/?name=1984&size=128&background=random",
      userName: "Jennifer Lee", 
      rating: 5, 
      reviewText: "A masterpiece that becomes more relevant with each passing year. Orwell was truly prophetic.",
      date: "2023-08-10"
    },
    { 
      id: 12, 
      bookTitle: "The Lord of the Rings", 
      bookId: "book-008",
      bookCover: "https://ui-avatars.com/api/?name=LOTR&size=128&background=random",
      userName: "Daniel Brown", 
      rating: 4, 
      reviewText: "The worldbuilding is incredible, though some parts drag a bit. Still a must-read for fantasy fans.",
      date: "2023-08-05"
    }
  ]);

  // State for books with their aggregated ratings
  const [books, setBooks] = useState([]);
  // State for expanded book to show all reviews
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Group reviews by book and calculate average ratings
  useEffect(() => {
    const bookMap = {};
    
    // Group reviews by book
    allReviews.forEach(review => {
      if (!bookMap[review.bookId]) {
        bookMap[review.bookId] = {
          bookId: review.bookId,
          bookTitle: review.bookTitle,
          bookCover: review.bookCover,
          reviews: [],
          totalRating: 0,
          reviewCount: 0
        };
      }
      
      bookMap[review.bookId].reviews.push(review);
      bookMap[review.bookId].totalRating += review.rating;
      bookMap[review.bookId].reviewCount += 1;
    });
    
    // Calculate average rating for each book
    const booksArray = Object.values(bookMap).map(book => ({
      ...book,
      averageRating: book.totalRating / book.reviewCount
    }));
    
    // Sort books by average rating in descending order
    const sortedBooks = booksArray.sort((a, b) => b.averageRating - a.averageRating);
    
    setBooks(sortedBooks);
  }, [allReviews]);

  const theme = darkMode
    ? {
        bg: "bg-slate-900",
        text: "text-slate-200",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        headerText: "text-white",
        heading: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 drop-shadow",
        textStrong: "text-slate-100",
        textMuted: "text-slate-300",
        sectionBg: "bg-slate-800",
        buttonBg: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-500",
      }
    : {
        bg: "bg-amber-50",
        text: "text-gray-800",
        cardBg: "bg-white",
        border: "border-gray-200",
        headerText: "text-gray-900",
        heading: "text-gray-900",
        textStrong: "text-gray-900",
        textMuted: "text-gray-600",
        sectionBg: "bg-gray-50",
        buttonBg: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-700",
      };

  const handleBackClick = () => {
    if (onBack) onBack();
    else {
      window.history.pushState({}, "", "/admin/dashboard");
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Function to toggle expanded book reviews
  const toggleBookReviews = (bookId) => {
    if (expandedBookId === bookId) {
      setExpandedBookId(null);
    } else {
      setExpandedBookId(bookId);
    }
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="halfStarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="url(#halfStarGradient)"></path>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Book Reviews</h1>
          <button
            onClick={handleBackClick}
            className={`px-4 py-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} text-white font-medium transition-all transform hover:scale-105`}
          >
            Back to Dashboard
          </button>
        </header>

        <div className="mb-6">
          <p className={`${theme.textMuted}`}>Showing books sorted by highest rating first</p>
        </div>

        <div className="space-y-8">
          {books.map((book) => (
            <div key={book.bookId} className={`${theme.cardBg} rounded-xl shadow-md overflow-hidden border ${theme.border}`}>
              {/* Book header with summary info */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Book cover */}
                  <div className="w-full md:w-32 h-40 flex-shrink-0">
                    <img 
                      src={book.bookCover} 
                      alt={book.bookTitle} 
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                  </div>
                  
                  {/* Book info */}
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold ${theme.textStrong} mb-2`}>{book.bookTitle}</h2>
                    <div className="flex items-center mb-3">
                      {renderStars(book.averageRating)}
                      <span className="ml-2 text-sm font-medium">{book.averageRating.toFixed(1)}/5</span>
                      <span className={`ml-2 text-sm ${theme.textMuted}`}>({book.reviewCount} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {book.reviews[0]?.rating === 5 ? "Top Rated" : ""}
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleBookReviews(book.bookId)}
                      className={`px-4 py-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors font-medium text-sm`}
                    >
                      {expandedBookId === book.bookId ? "Hide Reviews" : "View All Reviews"}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expanded reviews section */}
              {expandedBookId === book.bookId && (
                <div className={`border-t ${theme.border} p-6`}>
                  <h3 className={`text-lg font-semibold ${theme.textStrong} mb-4`}>All Reviews</h3>
                  <div className="space-y-4">
                    {book.reviews.map((review) => (
                      <div key={review.id} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center mb-2">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                        </div>
                        <p className="mb-2">{review.reviewText}</p>
                        <div className={`text-sm ${theme.textMuted} flex justify-between`}>
                          <span>By {review.userName}</span>
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}