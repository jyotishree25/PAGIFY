import React, { useState, useRef } from "react";
import axios from "axios";

export default function AddProduct({ onBack, darkMode }) {
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
    // In the UI this is used for preview; after submit we'll replace with Cloudinary URL
    imageUrl: "",
    pdfUrl: "",
    status: "Active",
    blocked: false,
  });

  // State to hold actual File objects from inputs
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Refs to clear native <input type="file" />
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ---------- Cloudinary config (frontend-safe, unsigned) ----------
  const CLOUD_NAME =
    import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || "dmq0xdnte";
  const UPLOAD_PRESET =
    import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || "pagify"; // <-- put your preset name here

  async function uploadToCloudinary(file, resourceType = "image") {
    if (!file) return "";
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await axios.post(url, data);
    return res.data.secure_url; // hosted URL
  }
  // ----------------------------------------------------------------

  const theme = darkMode
    ? {
        bg: "bg-slate-900",
        text: "text-slate-200",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        headerText: "text-white",
        heading:
          "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 drop-shadow",
        textStrong: "text-slate-100",
        textMuted: "text-slate-300",
        inputBg: "bg-slate-800",
        inputText: "text-slate-200",
        inputPlaceholder: "placeholder-slate-400",
      }
    : {
        bg: "bg-amber-50",
        text: "text-black",
        cardBg: "bg-white",
        border: "border-gray-100",
        headerText: "text-black",
        heading: "text-black",
        textStrong: "text-black",
        textMuted: "text-black",
        inputBg: "bg-white",
        inputText: "text-gray-800",
        inputPlaceholder: "placeholder-gray-400",
      };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "pdfFile") {
      const file = files?.[0] || null;
      setPdfFile(file);
      setFormData({
        ...formData,
        pdfUrl: file ? `[Uploaded: ${file.name}]` : "",
      });
    } else if (name === "imageFile") {
      const file = files?.[0] || null;
      setImageFile(file);
      setFormData({
        ...formData,
        imageUrl: file ? URL.createObjectURL(file) : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload a Book Cover Image.");
      return;
    }

    try {
      // 1) Upload to Cloudinary
      const uploadedImageUrl = await uploadToCloudinary(imageFile, "image");
      let uploadedPdfUrl = "";
      if (pdfFile) {
        uploadedPdfUrl = await uploadToCloudinary(pdfFile, "raw");
      }

      // 2) Build payload for backend (map fields as your backend expects)
      const payload = {
        id: formData.id,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        categories: formData.categories,
        publisher: formData.publisher,
        isbn: formData.isbn,
        publicationDate: formData.publishDate || "",
        language: formData.language,
        pageCount: formData.pages ? Number(formData.pages) : 0,
        price: formData.price ? Number(formData.price) : 0,
        stock: formData.stock ? Number(formData.stock) : 0,
        status: formData.status || "Active",
        blocked: !!formData.blocked,
        imageUrl: uploadedImageUrl,
        pdfUrl: uploadedPdfUrl,
      };

      // 3) Send to backend
      const res = await axios.post(
        "https://pagify-g5g5.onrender.com/api/v1/products/add",
        payload
      );

      if (!res.data?.success) {
        alert(res.data?.message || "Failed to add product on server.");
        return;
      }

      // 4) Keep original localStorage behavior
      const existingProducts = JSON.parse(
        localStorage.getItem("products") || "[]"
      );

      const newProduct = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        pages: formData.pages ? parseInt(formData.pages) : 0,
        imageUrl: uploadedImageUrl,
        pdfUrl: uploadedPdfUrl,
      };

      localStorage.setItem(
        "products",
        JSON.stringify([...existingProducts, newProduct])
      );

      // 5) Show success popup and CLEAR IMMEDIATELY (no UI change elsewhere)
      setShowSuccessPopup(true);

      // immediate clear (form + file inputs)
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
        imageUrl: "",
        pdfUrl: "",
        status: "Active",
        blocked: false,
      });
      setPdfFile(null);
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = null;
      if (pdfInputRef.current) pdfInputRef.current.value = null;

      // auto-close popup after 5s (same as before)
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
    } catch (err) {
      console.error("Add product error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to add product. Check Cloudinary preset and backend connection."
      );
    }
  };

const handleBackToProducts = () => {
  window.history.pushState({}, "", "/admin/product-management");
  window.dispatchEvent(new PopStateEvent("popstate"));
};


  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div
        className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToProducts}
              className={`p-2 rounded-full border ${theme.border} hover:opacity-90`}
              aria-label="Back to products"
              title="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1
              className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}
            >
              Add New Product
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Product ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="e.g. BK-001"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Price(₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="0"
                />
              </div>
              <div>
  <label className="block mb-1 font-medium">Categories</label>

  <select
    name="categories"
    multiple
    value={formData.categories || []}
    onChange={(e) =>
      setFormData({
        ...formData,
        categories: Array.from(e.target.selectedOptions).map(
          (opt) => opt.value
        ),
      })
    }
    required
    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
  >
    <option value="Horror">Horror</option>
    <option value="Romance">Romance</option>
    <option value="Mystery Thriller">Mystery Thriller</option>
    <option value="Science">Science</option>
    <option value="Fiction">Fiction</option>
    <option value="Non Fiction">Non Fiction</option>
    <option value="History">History</option>
    <option value="Biography">Biography</option>
    <option value="Autobiography">Autobiography</option>
    <option value="Business & Economy">Business & Economy</option>
    <option value="Self Help">Self Help</option>
    <option value="Children">Children</option>
    <option value="Children's Book">Children's Book</option>
    <option value="Study Materials">Study Materials</option>
    <option value="Current Affairs & Politics">Current Affairs & Politics</option>
    <option value="Travel">Travel</option>
    <option value="Art & Photography">Art & Photography</option>
    <option value="Bengali">Bengali</option>
    <option value="Cooking">Cooking</option>
    <option value="Manga">Manga</option>
    <option value="Poetry">Poetry</option>
    <option value="Religion & Spirituality">Religion & Spirituality</option>
  </select>

  <p className="text-sm text-gray-500 mt-1">
    Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
  </p>
</div>

            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Upload Book Cover Image */}
              <div>
                <label htmlFor="imageFile" className="block mb-1 font-medium">
                  Upload Book Cover Image
                </label>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  ref={imageInputRef}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
                />
                {imageFile && (
                  <p className="mt-1 text-sm text-emerald-500">
                    Selected: {imageFile.name}
                  </p>
                )}
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Book Cover Preview"
                    className="mt-2 h-20 w-auto object-contain rounded-md border border-gray-300"
                  />
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="Publisher name"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Publish Date</label>
                <input
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="ISBN number"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Language</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="e.g. English"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                  placeholder="Number of pages"
                />
              </div>
            </div>
          </div>

          {/* Upload PDF - Full Width */}
          <div className="md:col-span-2">
            <label htmlFor="pdfFile" className="block mb-1 font-medium">
              Upload Book PDF
            </label>
            <input
              type="file"
              id="pdfFile"
              name="pdfFile"
              accept=".pdf"
              onChange={handleChange}
              ref={pdfInputRef}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
            />
            {pdfFile && (
              <p className="mt-1 text-sm text-emerald-500">
                Selected: {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB).
                <br />
                *Note:* In a real app, this file would be uploaded to a server.
                Only the filename/temp URL is saved to localStorage for this demo.
              </p>
            )}
          </div>

          {/* Description - Full Width */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
              placeholder="Product description"
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleBackToProducts}
              className={`px-4 py-2 rounded-lg border ${theme.border} hover:bg-gray-100 ${
                darkMode ? "hover:bg-slate-700" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className={`${theme.cardBg} rounded-xl shadow-lg p-6 max-w-md w-full mx-4`}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme.textStrong}`}>
                Product Added Successfully!
              </h3>
              <p className={`mb-4 ${theme.textMuted}`}>
                The product has been added to your inventory.
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
