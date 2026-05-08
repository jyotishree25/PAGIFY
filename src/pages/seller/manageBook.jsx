import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Trash2,
  BookOpen,
  Pencil,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

export default function ManageBook({ darkMode = false }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    description: "",
  });
  const [tempStock, setTempStock] = useState(0);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("sellerToken");

        if (!token) {
          toast.error("Session expired");
          navigate("/seller/login");
          return;
        }

        const res = await axios.get(
          "https://pagify-g5g5.onrender.com/api/v1/sellers/products/my-products",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const products = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        const found = products.find((p) => p._id === productId);

        if (!found) {
          toast.error("Product not found");
          navigate("/seller/dashboard");
          return;
        }

        setBook(found);
        setEditForm({
          title: found.title || "",
          price: found.price || "",
          description: found.description || "",
        });
        setTempStock(found.stock || 0);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, navigate]);

  /* ================= LOADING GUARD ================= */
  if (loading) {
    return <div className="p-10 text-center">Loading product...</div>;
  }

  if (!book) {
    return <div className="p-10 text-center">Product not found</div>;
  }

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("sellerToken");

      await axios.delete(
        `https://pagify-g5g5.onrender.com/api/v1/sellers/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Product deleted successfully");
      navigate("/seller/dashboard");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ================= UPDATE STOCK ================= */
  const updateStock = async () => {
    try {
      const token = localStorage.getItem("sellerToken");

      const res = await axios.put(
        `'https://pagify-g5g5.onrender.com/api/v1/sellers/products/${productId}`,
        { stock: tempStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBook(res.data.product);
      toast.success("Stock updated");
    } catch (err) {
      toast.error("Stock update failed");
    }
  };

  /* ================= SAVE EDIT ================= */
  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("sellerToken");

      const res = await axios.put(
        `https://pagify-g5g5.onrender.com/api/v1/sellers/products/${productId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBook(res.data.product);
      setIsEditing(false);
      toast.success("Product updated");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <div className={`p-8 min-h-screen ${darkMode ? "bg-black text-white" : "bg-gray-50"}`}>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/seller/dashboard")}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
              title="Back to Dashboard"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">{book.title}</h1>
          </div>
          
          <button 
            onClick={() => navigate("/seller/dashboard")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              darkMode 
              ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700' 
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-3 gap-6">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-48 h-64 object-cover rounded"
          />

          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center">
              <BookOpen className="mr-2" /> {book.title}
            </h2>

            <p><b>Price:</b> ₹{book.price}</p>
            <p><b>Stock:</b> {book.stock}</p>
            <p><b>Status:</b> {book.status}</p>

            {/* STOCK CONTROL */}
            <div className="flex items-center gap-3">
              <Minus
                onClick={() => setTempStock(Math.max(0, tempStock - 1))}
                className="cursor-pointer"
              />
              <input
                type="number"
                value={tempStock}
                onChange={(e) => setTempStock(Number(e.target.value))}
                className="w-20 border px-2 py-1"
              />
              <Plus
                onClick={() => setTempStock(tempStock + 1)}
                className="cursor-pointer"
              />

              <button
                onClick={updateStock}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Update Stock
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center"
              >
                <Pencil size={16} className="mr-2" /> Edit
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded flex items-center"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* EDIT MODAL */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg relative">
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4"
              >
                <X />
              </button>

              <h2 className="text-xl font-bold mb-4">Edit Product</h2>

              <input
                className="w-full border p-2 mb-3"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Title"
              />

              <input
                className="w-full border p-2 mb-3"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
                placeholder="Price"
              />

              <textarea
                className="w-full border p-2 mb-3"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Description"
              />

              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}
