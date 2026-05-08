import React, { useMemo, useState, useEffect } from "react";

export default function OrderManagement({ onBack, darkMode }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewOrder, setViewOrder] = useState(null);
  const [showViewPopup, setShowViewPopup] = useState(false);

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
        tableHeaderText: "text-slate-300",
        inputBg: "bg-slate-800",
        inputText: "text-slate-200"
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
        tableHeaderText: "text-black",
        inputBg: "bg-white",
        inputText: "text-gray-800"
      };

  const [data, setData] = useState([]);

  // Fetch real-time orders from localStorage
  useEffect(() => {
    const fetchOrders = () => {
      const storedOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
      
      // Update status based on delivery date logic (4-7 days)
      const updatedOrders = storedOrders.map(order => {
        const orderTimestamp = order.timestamp || new Date(order.date).getTime();
        const now = new Date().getTime();
        const diffInDays = (now - orderTimestamp) / (1000 * 60 * 60 * 24);
        
        // Logic: Automatically set to Delivered after 4 days
        if (diffInDays >= 4 && order.status === "Pending") {
          return { ...order, status: "Delivered" };
        }
        return order;
      });

      // Update localStorage if status changed
      if (JSON.stringify(storedOrders) !== JSON.stringify(updatedOrders)) {
        localStorage.setItem('all_orders', JSON.stringify(updatedOrders));
      }

      setData(updatedOrders);
    };

    fetchOrders();
    // Listen for local changes within the same tab
    const interval = setInterval(fetchOrders, 5000); 
    
    // Listen for changes from other tabs
    window.addEventListener('storage', fetchOrders);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', fetchOrders);
    };
  }, []);

  const filtered = useMemo(() => {
    return data.filter((o) => {
      const matchesText = [o.id, o.customer, o.email || ""].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [data, query, statusFilter]);

  const badgeClasses = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Shipped":
        return "bg-sky-100 text-sky-700 border border-sky-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "Canceled":
        return "bg-rose-100 text-rose-700 border border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const handleViewOrder = (order) => {
    setViewOrder(order);
    setShowViewPopup(true);
  };

  const handleBackToDashboard = () => {
  window.history.pushState({}, "", "/admin/dashboard");
  window.dispatchEvent(new PopStateEvent("popstate"));
};


  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={handleBackToDashboard} className={`p-2 rounded-full border ${theme.border} hover:opacity-90`} aria-label="Back to dashboard" title="Back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Order Management</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders..."
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200 placeholder-slate-400' : 'bg-white text-gray-800 placeholder-gray-400'}`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'}`}
            >
              {['All','Pending','Shipped','Delivered','Canceled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={darkMode ? "text-slate-300" : "text-black"}>
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <td className={`py-3 pr-4 font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{o.id}</td>
                  <td className="py-3 pr-4">{o.customer}</td>
                  <td className="py-3 pr-4">{o.date}</td>
                  <td className="py-3 pr-4 font-bold text-emerald-600">₹{o.amount.toFixed(2)}</td>
                  <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClasses(o.status)}`}>{o.status}</span></td>
                  <td className="py-3 pr-0 text-right">
                    <button 
                      onClick={() => handleViewOrder(o)} 
                      className={`px-4 py-1.5 rounded-lg border font-bold ${darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} transition-colors`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">
                    No orders found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Popup */}
      {showViewPopup && viewOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`${theme.cardBg} rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${theme.textStrong}`}>Order Details</h2>
              <button
                onClick={() => setShowViewPopup(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{viewOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{viewOrder.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{viewOrder.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{viewOrder.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{viewOrder.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{viewOrder.paymentMethod}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="font-medium">{viewOrder.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgeClasses(viewOrder.status)}`}>
                    {viewOrder.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-emerald-600">₹{viewOrder.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b ${theme.border}`}>
                      <th className="py-2 px-3 text-left text-sm">Product</th>
                      <th className="py-2 px-3 text-right text-sm">Price</th>
                      <th className="py-2 px-3 text-right text-sm">Qty</th>
                      <th className="py-2 px-3 text-right text-sm">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items && viewOrder.items.map((item, index) => (
                      <tr key={index} className={`border-b ${theme.border}`}>
                        <td className="py-2 px-3">
                          <div>
                            <p className="font-medium">{item.title}</p>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowViewPopup(false)}
                className={`px-4 py-2 rounded-lg border ${theme.border} hover:bg-gray-100 ${darkMode ? 'hover:bg-slate-700' : ''}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


