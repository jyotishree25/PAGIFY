import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";



export default function ProductEdit({ darkMode }) {
   const { productId } = useParams();
     const navigate = useNavigate();
  // Initial product state with default values
  const [product, setProduct] = useState({
    id: productId || "",
    title: "",
    price: 0,
    stock: 0,
    status: "Active",
    description: "",
    category: "",
    imageUrl: ""
  });

 React.useEffect(() => {
  if (!productId) return;

  async function fetchProduct() {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/products/${productId}`
      );
      const data = await res.json();

      const p = data.product || {};
      setProduct({
        ...p,
        id: p.id,
      });
    } catch (err) {
      console.error("Failed to fetch product", err);
    }
  }

  fetchProduct();
}, [productId]);



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
        inputBg: "bg-slate-800",
        inputBorder: "border-slate-600",
        inputFocus: "focus:border-emerald-500"
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
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputFocus: "focus:border-emerald-500"
      };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await fetch(`http://localhost:8000/api/v1/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    alert("Product updated successfully");
    navigate("/admin/product-management");
  } catch (err) {
    console.error("Update failed", err);
    alert("Update failed");
  }
};



  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6 max-w-4xl mx-auto`}>
        <div className="flex items-center gap-2 mb-6">
          <button 
           onClick={() => navigate("/admin/product-management")}
           className={`p-2 rounded-full border ${theme.border} hover:opacity-90 transition-all transform hover:scale-110`}
          aria-label="Back to products"
        title="Back"
        >

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold ${theme.heading}`}>
            {productId ? `Edit Product: ${product.title}` : "Add New Product"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product ID */}
            <div>
              <label htmlFor="id" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Product ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={product.id}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
                placeholder="SKU or Product ID"
                readOnly={!!productId}
                required
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={product.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
                placeholder="Product Title"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
                placeholder="0"
                min="0"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
                placeholder="Product Category"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Status</label>
              <select
                id="status"
                name="status"
                value={product.status}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
                required
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Description</label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
              placeholder="Product description..."
            ></textarea>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={product.imageUrl}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus}`}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Stock Warning */}
          {product.stock === 0 && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-amber-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium">Warning: Product is out of stock</p>
                  <p className="text-sm">This product will be marked as unavailable until stock is added.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/product-management")}
              className={`px-4 py-2 rounded-lg border ${theme.border} hover:bg-gray-100 ${darkMode ? 'hover:bg-slate-700' : ''} transition-all transform hover:scale-105`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
