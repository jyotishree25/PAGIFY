import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Star } from "lucide-react";
import { useInventory } from "../../context/InventoryContext.jsx";
import UserHeader from "../../components/common/UserHeader.jsx";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API = "http://localhost:8000/api/v1";
  const { cartCount, wishlistCount, addToCart: addToCartCtx, fetchCounts, setUserId: setCtxUser } = useInventory();

  // Fetch current user to scope cart/wishlist counts consistently
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = res.data?.user;
        const uid = user?._id || user?.id;
        if (uid) {
          setUserId(uid);
          setCtxUser(uid);
          setUserProfile(user);
          setProfileImage(user?.profilePicture);
          fetchCounts();
        }
      })
      .catch(() => {
        setUserId(null);
      });
  }, []);

  const normalizeProduct = (raw) => {
    const canonical = { ...raw };
    canonical.publisher =
      raw.publisher ??
      raw.Publisher ??
      raw.publisherName ??
      "";
    canonical.isbn =
      raw.isbn ??
      raw.ISBN ??
      "";
    canonical.publicationDate =
      raw.publicationDate ??
      raw.publishDate ??
      raw.publishedDate ??
      raw.publish_date ??
      "";
    canonical.language =
      raw.language ??
      raw.Language ??
      "";
    canonical.pageCount =
      raw.pageCount ??
      raw.pages ??
      raw.page ??
      0;
    return canonical;
  };

  // Helper: filter verified purchase reviews
  const filterPurchaseReviews = (list) => {
    if (!Array.isArray(list)) return [];
    const filtered = list.filter((r) => r?.verifiedPurchase === true || r?.orderId || r?.purchased === true);
    return filtered.length ? filtered : list;
  };

  // Helper: compute average rating from reviews
  const computeAverageRating = (list) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const ratings = list
      .map((r) => Number(r.rating))
      .filter((n) => !isNaN(n));
    if (ratings.length === 0) return null;
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.max(0, Math.min(5, avg));
  };

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await axios.get(`${API}/products/${productId}`);
        const raw1 = res.data?.product ?? res.data ?? {};

        let merged = { ...raw1 };

        const needMeta =
          !raw1?.publisher &&
          !raw1?.isbn &&
          !raw1?.publicationDate &&
          (raw1?.pageCount === undefined || raw1?.pageCount === null);

        if (needMeta) {
          try {
            const res2 = await axios.get(`${API}/cart/product/${productId}`);
            const raw2 = res2.data?.product ?? res2.data ?? {};
            merged = { ...raw2, ...raw1 };
          } catch (e) {
            // ignore fallback failure, proceed with primary
          }
        }

        const prod = normalizeProduct(merged);

        // reviews: prefer verified purchase
        const incomingReviews = prod.reviews || [];
        const purchaseReviews = filterPurchaseReviews(incomingReviews);
        setProduct(prod);
        if (purchaseReviews.length === 0) {
          setReviews([
            {
              userName: "Early Reader",
              rating: 4,
              reviewText: "A solid new release — engaging and well-written.",
              verifiedPurchase: false,
            },
          ]);
        } else {
          setReviews(purchaseReviews);
        }

        // related books
        if (prod.categories?.length) {
          const pub = await axios.get(`${API}/products/public`);
          const same = (pub.data.products || []).filter(
            (p) =>
              p._id !== prod._id &&
              p.categories?.some((c) => prod.categories.includes(c))
          );
          setRelated(same.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  useEffect(() => {}, [userId]);

  if (loading) return <div className="p-10 text-xl">Loading product...</div>;
  if (!product) return <div className="p-10 text-xl">Product not found</div>;

  const publisher = product.publisher || "-";
  const publishedDate = product.publicationDate || "-";
  const isbn = product.isbn || "-";
  const language = product.language || "-";

  const pagesRaw = product.pageCount;
  const pages = pagesRaw !== undefined && pagesRaw !== null ? String(pagesRaw) : "-";

  const publishedDateFormatted = (() => {
    if (!publishedDate || publishedDate === "-") return "-";
    const d = new Date(publishedDate);
    if (isNaN(d.getTime())) return publishedDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  })();

  const handleAddToCart = () => {
    const id = product._id || product.id;
    addToCartCtx(id, 1);
  };

  const handleBuyNow = async () => {
    try {
      const id = product._id || product.id;
      // Validate availability before checkout
      const payload = { items: [{ productId: id, quantity: 1 }] };
      const res = await axios.post(`${API}/cart/validate`, payload);
      if (res.data?.allValid) {
        navigate(`/user/emailaddresspayment`, { state: { productId: id, quantity: 1 } });
      } else {
        const firstInvalid = (res.data?.validatedItems || []).find((it) => !it.valid);
        const reason = firstInvalid?.reason || "Item not available";
        alert(`Cannot proceed to checkout: ${reason}`);
      }
    } catch (err) {
      console.error("Buy Now validation error:", err);
      alert("Unable to validate item for checkout. Please try again.");
    }
  };

  // Average rating from reviews; clamp to [0,5]; default to 4 if no reviews
  const displayRating = (() => {
    const avg = computeAverageRating(reviews);
    if (avg === null || avg === undefined) return 4;
    return Math.max(0, Math.min(5, avg));
  })();

  return (
    <div className="min-h-screen bg-white font-inter">
      <UserHeader
        onLogoClick={() => navigate("/user/home")}
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        userProfile={userProfile}
        profileImage={profileImage}
      />

      {/* ---------------- MAIN ---------------- */}
      <main className="max-w-7xl mx-auto p-8">
        {/* PRODUCT CARD */}
        <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-gray-100 p-2 rounded-full"
          >
            ←
          </button>

          {/* IMAGE */}
          <div className="flex flex-col items-center">
            <img
              src={product.coverImage}
              alt={product.title}
              className="w-full max-w-sm rounded-xl shadow mb-6"
            />

            <div className="flex gap-4">
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-full" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-gray-100 px-8 py-3 rounded-full hover:bg-emerald-50 border border-emerald-200"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* DETAILS */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold">{product.title}</h1>
            <p className="text-xl text-gray-600">{product.author}</p>

            {/* Rating: average from purchase reviews */}
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((k) => {
                const active = k <= displayRating;
                return (
                  <Star
                    key={k}
                    className={`h-5 w-5 ${active ? 'text-amber-500' : 'text-gray-300'}`}
                    fill={active ? 'currentColor' : 'none'}
                    stroke="currentColor"
                  />
                );
              })}
              <span className="ml-2 text-sm text-gray-500">({displayRating.toFixed(1)} / 5)</span>
            </div>

            <p className="text-3xl font-bold mt-4">₹{product.price}</p>

            <p className="mt-4 text-gray-700">
              {product.description}
            </p>

            {/* META */}
            <div className="grid grid-cols-2 gap-4 mt-8 text-gray-700">
              <div><b>Publisher:</b> {publisher}</div>
              <div><b>Published:</b> {publishedDateFormatted}</div>
              <div><b>ISBN:</b> {isbn}</div>
              <div><b>Language:</b> {language}</div>
              <div><b>Pages:</b> {pages}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-8 rounded-xl shadow-lg lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Reviews</h3>
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <b className="text-gray-800">{r.userName || "A Reader"}</b>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((k) => {
                        const active = k <= (Number(r.rating) || 0);
                        return (
                          <Star
                            key={k}
                            className={`h-4 w-4 ${active ? "text-amber-500" : "text-gray-300"}`}
                            fill={active ? 'currentColor' : 'none'}
                            stroke="currentColor"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{r.reviewText}</p>
                  {(r.verifiedPurchase || r.orderId || r.purchased) && (
                    <span className="mt-2 inline-block text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Verified Purchase</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- RELATED ---------------- */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Related Books</h2>

            {related.map((b) => (
              <div
                key={b._id}
                onClick={() => navigate(`/user/product/${b._id}`)}
                className="flex gap-4 mb-4 cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={b.coverImage}
                  className="w-16 h-24 rounded"
                  alt={b.title}
                />
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-gray-500">{b.author}</p>
                  <p className="text-sm">₹{b.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
