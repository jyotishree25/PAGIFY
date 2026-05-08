import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, CheckCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

export default function SellerOrder({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [order, setOrder] = useState(null);

  // NEW: Control dropdown visibility
  const [editingStatus, setEditingStatus] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [tempStatus, setTempStatus] = useState(status);

  // Fetch real-time order from localStorage
  useEffect(() => {
    const fetchOrder = () => {
      const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
      const foundOrder = allOrders.find((o) => String(o.id) === String(id));
      
      if (foundOrder) {
        setOrder(foundOrder);
        setStatus(foundOrder.status || "Pending");
        setTempStatus(foundOrder.status || "Pending");
      } else {
        toast.error("Order not found!");
        // Optional: navigate back if not found
        // navigate("/seller/dashboard");
      }
    };

    fetchOrder();
  }, [id]);

  // --- Cancel order handler ---
  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason.", { theme: darkMode ? 'dark' : 'colored' });
      return;
    }

    // Update status in localStorage
    const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
    const updatedOrders = allOrders.map(o => 
      String(o.id) === String(id) ? { ...o, status: "Cancelled", cancelReason } : o
    );
    localStorage.setItem('all_orders', JSON.stringify(updatedOrders));

    toast.success(`Order cancelled successfully.`, { theme: darkMode ? 'dark' : 'colored' });
    setShowModal(false);
    navigate("/seller/dashboard");
  };

  // --- Save status update ---
  const handleSaveStatus = () => {
    setStatus(tempStatus);
    
    // Update status in localStorage
    const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
    const updatedOrders = allOrders.map(o => 
      String(o.id) === String(id) ? { ...o, status: tempStatus } : o
    );
    localStorage.setItem('all_orders', JSON.stringify(updatedOrders));

    setEditingStatus(false);
    toast.success(`Order status updated to: ${tempStatus}`, { theme: darkMode ? 'dark' : 'colored' });
  };

  if (!order) {
    return (
      <div className={`p-8 min-h-screen flex items-center justify-center ${darkMode ? "bg-black text-white" : "bg-white text-gray-900"}`}>
        <div className="text-xl font-bold animate-pulse">Loading order details...</div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
        .Toastify__toast-container {
          padding: 10px;
        }
        .Toastify__toast {
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .Toastify__toast--success {
          background-color: #10B981;
        }
        .Toastify__toast--error {
          background-color: #EF4444;
        }
        .Toastify__toast--info {
          background-color: #3B82F6;
        }
        .Toastify__toast-theme--colored .Toastify__toast--success {
          background-color: #10B981;
        }
        .Toastify__toast-theme--colored .Toastify__toast--error {
          background-color: #EF4444;
        }
        .Toastify__toast-theme--colored .Toastify__toast--info {
          background-color: #3B82F6;
        }
        .Toastify__toast-theme--dark {
          background-color: #1F2937;
          color: #fff;
        }
        .Toastify__progress-bar {
          background: rgba(255, 255, 255, 0.3);
        }
        .Toastify__progress-bar--dark {
          background: rgba(255, 255, 255, 0.3);
        }
        .Toastify__close-button {
          color: #fff;
          opacity: 0.8;
        }
        .Toastify__close-button--dark {
          color: #fff;
        }
        `}
      </style>
      <div
        className={`p-8 min-h-screen ${
          darkMode ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Manage Order: {order.id}</h1>
        </div>

        {/* Card */}
        <div
          className={`p-6 rounded-xl shadow ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-emerald-500 w-fit">Order Details</h2>
              <div className="space-y-3">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p><strong>Book:</strong> {item.title}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Price:</strong> ₹{item.price.toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-lg"><strong>Total Price:</strong> <span className="text-emerald-600 font-bold">₹{order.amount.toFixed(2)}</span></p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        status === "Pending"
                          ? "text-yellow-500 font-bold"
                          : status === "Shipped"
                          ? "text-blue-500 font-bold"
                          : status === "Cancelled"
                          ? "text-red-500 font-bold"
                          : "text-green-500 font-bold"
                      }
                    >
                      {status}
                    </span>
                  </p>
                  <p>
                    <strong>Order Date:</strong> {order.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-emerald-500 w-fit">Customer Details</h2>
              <div className="space-y-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <p>
                  <strong>Name:</strong> {order.customerDetails?.name || order.customer || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {order.customerDetails?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {order.customerDetails?.phone || "N/A"}
                </p>
                {order.customerDetails?.city && (
                  <p>
                    <strong>City:</strong> {order.customerDetails.city}
                  </p>
                )}
                {order.customerDetails?.state && (
                  <p>
                    <strong>State:</strong> {order.customerDetails.state}
                  </p>
                )}
                {order.customerDetails?.pincode && (
                  <p>
                    <strong>Pincode:</strong> {order.customerDetails.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Update Status Button */}
            {status !== "Cancelled" && status !== "Delivered" && (
              !editingStatus ? (
                <button
                  onClick={() => setEditingStatus(true)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 inline-flex items-center shadow-md transition-all active:scale-95"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Update Status
                </button>
              ) : (
                <div className="flex items-center space-x-3 bg-white dark:bg-gray-900 p-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                  <select
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                    className="px-4 py-1.5 rounded-full border-none focus:ring-0 dark:bg-gray-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button
                    onClick={handleSaveStatus}
                    className="px-5 py-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingStatus(false)}
                    className="px-5 py-1.5 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )
            )}

            {/* Cancel Order */}
            {status !== "Cancelled" && status !== "Delivered" && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 inline-flex items-center shadow-md transition-all active:scale-95"
              >
                <XCircle size={18} className="mr-2" />
                Cancel Order
              </button>
            )}
            
            {status === "Cancelled" && (
              <div className="text-red-500 font-bold flex items-center bg-red-50 dark:bg-red-900/20 px-6 py-2 rounded-full border border-red-100 dark:border-red-800">
                <XCircle size={18} className="mr-2" />
                ORDER CANCELLED
              </div>
            )}
            
            {status === "Delivered" && (
              <div className="text-green-600 font-bold flex items-center bg-green-50 dark:bg-green-900/20 px-6 py-2 rounded-full border border-green-100 dark:border-green-800">
                <CheckCircle size={18} className="mr-2" />
                ORDER DELIVERED
              </div>
            )}
          </div>
        </div>

        {/* Cancel Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 backdrop-blur-sm">
            <div
              className={`rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200 ${
                darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
              }`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center text-red-600">
                <XCircle size={24} className="mr-2" />
                Cancel Order
              </h2>
              <form onSubmit={handleCancelSubmit}>
                <label className="block text-sm font-medium mb-2 opacity-70">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Why are you cancelling this order?"
                  rows={4}
                  required
                ></textarea>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 font-bold shadow-lg"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
