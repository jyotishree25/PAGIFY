import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

export default function AddBook({ darkMode = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    author: "",
    price: "",
    stock: "",
    description: "",
    categories: [],
    publisher: "",
    publishDate: "",
    isbn: "",
    language: "",
    pages: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const imageRef = useRef(null);
  const pdfRef = useRef(null);

  
  const CATEGORY_OPTIONS = [
    "Horror",
    "Romance",
    "Mystery Thriller",
    "Science",
    "Fiction",
    "Non Fiction",
    "Autobiography",
    "Biography",
    "Business & Economy",
    "Self Help",
    "Study Materials",
    "Current Affairs & Politics",
    "Travel",
    "Art & Photography",
    "Bengali",
    "Children's Book",
    "Cooking",
    "Manga",
    "Poetry",
    "Religion & Spirituality",
    "History",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData({ ...formData, categories: selected });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.title || !formData.price) {
      toast.error("SKU, Title and Price are required");
      return;
    }

    try {
      const token = localStorage.getItem("sellerToken");

      const data = new FormData();

      /* TEXT FIELDS */
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "categories") return;
        data.append(key, value);
      });

      /* MULTI CATEGORY */
      formData.categories.forEach((cat) =>
        data.append("categories[]", cat)
      );

      /* FILES */
      if (imageFile) data.append("coverImage", imageFile);
      if (pdfFile) data.append("bookPdf", pdfFile);

      await axios.post(
        "https://pagify-g5g5.onrender.com/api/v1/sellers/products/add",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Book added successfully!");

      /* RESET */
      setFormData({
        id: "",
        title: "",
        author: "",
        price: "",
        stock: "",
        description: "",
        categories: [],
        publisher: "",
        publishDate: "",
        isbn: "",
        language: "",
        pages: "",
      });
      setImageFile(null);
      setPdfFile(null);
      imageRef.current.value = null;
      pdfRef.current.value = null;
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="min-h-screen bg-amber-50 p-6 flex flex-col items-center">
        {/* BACK BUTTON */}
        <div className="w-full max-w-4xl mb-4">
          <button 
            onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm border border-gray-200 font-semibold transition-all"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Add New Book</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SKU */}
            <div>
              <label className="font-medium">Product ID</label>
              <input
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                placeholder="e.g. SL-001"
                required
              />
            </div>

            {/* COVER IMAGE */}
            <div>
              <label className="font-medium">Upload Book Cover Image</label>
              <input
                type="file"
                ref={imageRef}
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full border px-3 py-2 rounded-lg"
                required
              />
            </div>

            {/* TITLE */}
            <div>
              <label className="font-medium">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
              />
            </div>

            {/* AUTHOR */}
            <div>
              <label className="font-medium">Author</label>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="font-medium">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                required
              />
            </div>

            {/* STOCK */}
            <div>
              <label className="font-medium">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* PUBLISHER */}
            <div>
              <label className="font-medium">Publisher</label>
              <input
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* PUBLISH DATE */}
            <div>
              <label className="font-medium">Publish Date</label>
              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="font-medium">ISBN</label>
              <input
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* LANGUAGE */}
            <div>
              <label className="font-medium">Language</label>
              <input
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* PAGES */}
            <div>
              <label className="font-medium">Pages</label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* PDF */}
            <div>
              <label className="font-medium">Upload Book PDF</label>
              <input
                type="file"
                ref={pdfRef}
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* CATEGORIES */}
            <div className="md:col-span-2">
              <label className="font-medium">Categories</label>
              <select
                multiple
                value={formData.categories}
                onChange={handleCategoryChange}
                className="w-full border px-3 py-2 rounded-lg h-40"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* SUBMIT */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
              >
                Add Book
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
