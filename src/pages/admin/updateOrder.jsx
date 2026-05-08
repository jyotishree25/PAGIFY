import React, { useState, useEffect } from "react";

export default function UpdateOrder({ darkMode }) {
  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
        inputText: "text-slate-200",
        inputBorder: "border-slate-600",
        buttonBg: "bg-slate-700",
        buttonHover: "hover:bg-slate-600"
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
        inputBorder: "border-gray-300",
        buttonBg: "bg-gray-100",
        buttonHover: "hover:bg-gray-200"
      };

  useEffect(() => {
    // Extract order ID from URL
    const path = window.location.pathname;
    const orderId = path.split('/').pop();
    
    // Load orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const defaultOrders = [
      { 
        id: "ORD-1001", 
        customer: "Emma Johnson", 
        email: "emma@example.com",
        amount: 39.99, 
        status: "Pending", 
        date: "2024-06-22",
        address: "123 Main St, New York, NY 10001",
        phone: "555-123-4567",
        paymentMethod: "Credit Card",
        items: [
          { id: "BK-001", title: "The Great Gatsby", price: 12.99, quantity: 1 },
          { id: "BK-003", title: "1984", price: 9.99, quantity: 2 }
        ]
      },
      { 
        id: "ORD-1002", 
        customer: "Noah Smith", 
        email: "noah@example.com",
        amount: 54.5, 
        status: "Shipped", 
        date: "2024-06-21",
        address: "456 Oak Ave, Chicago, IL 60007",
        phone: "555-987-6543",
        paymentMethod: "PayPal",
        items: [
          { id: "BK-002", title: "To Kill a Mockingbird", price: 10.50, quantity: 1 },
          { id: "BK-004", title: "Pride and Prejudice", price: 11.25, quantity: 2 },
          { id: "BK-005", title: "The Catcher in the Rye", price: 10.75, quantity: 2 }
        ]
      },
      { 
        id: "ORD-1003", 
        customer: "Olivia Davis", 
        email: "olivia@example.com",
        amount: 29.99, 
        status: "Delivered", 
        date: "2024-06-19",
        address: "789 Pine St, Los Angeles, CA 90001",
        phone: "555-456-7890",
        paymentMethod: "Credit Card",
        items: [
          { id: "BK-006", title: "The Hobbit", price: 14.99, quantity: 2 }
        ]
      },
      { 
        id: "ORD-1004", 
        customer: "James Miller", 
        email: "james@example.com",
        amount: 18.75, 
        status: "Canceled", 
        date: "2024-06-17",
        address: "321 Elm St, Houston, TX 77001",
        phone: "555-234-5678",
        paymentMethod: "PayPal",
        items: [
          { id: "BK-003", title: "1984", price: 9.99, quantity: 1 },
          { id: "BK-007", title: "Animal Farm", price: 8.76, quantity: 1 }
        ]
      }
    ];
    
    // Use stored orders if available, otherwise use default orders
    const orders = storedOrders.length > 0 ? storedOrders : defaultOrders;
    
    // Find the order with the matching ID
    const foundOrder = orders.find(o => o.id === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      setFormData({
        customer: foundOrder.customer,
        email: foundOrder.email,
        phone: foundOrder.phone,
        address: foundOrder.address,
        status: foundOrder.status,
        paymentMethod: foundOrder.paymentMethod
      });
    }
    
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orders = storedOrders.length > 0 ? storedOrders : [
      { 
        id: "ORD-1001", 
        customer: "Emma Johnson", 
        email: "emma@example.com",
        amount: 39.99, 
        status: "Pending", 
        date: "2024-06-22",
        address: "123 Main St, New York, NY 10001",
        phone: "555-123-4567",
        paymentMethod: "Credit Card",
        items: [
          { id: "BK-001", title: "The Great Gatsby", price: 12.99, quantity: 1 },
          { id: "BK-003", title: "1984", price: 9.99, quantity: 2 }
        ]
      },
      { 
        id: "ORD-1002", 
        customer: "Noah Smith", 
        email: "noah@example.com",
        amount: 54.5, 
        status: "Shipped", 
        date: "2024-06-21",
        address: "456 Oak Ave, Chicago, IL 60007",
        phone: "555-987-6543",
        paymentMethod: "PayPal",
        items: [
          { id: "BK-002", title: "To Kill a Mockingbird", price: 10.50, quantity: 1 },
          { id: "BK-004", title: "Pride and Prejudice", price: 11.25, quantity: 2 },
          { id: "BK-005", title: "The Catcher in the Rye", price: 10.75, quantity: 2 }
        ]
      },
      { 
        id: "ORD-1003", 
        customer: "Olivia Davis", 
        email: "olivia@example.com",
        amount: 29.99, 
        status: "Delivered", 
        date: "2024-06-19",
        address: "789 Pine St, Los Angeles, CA 90001",
        phone: "555-456-7890",
        paymentMethod: "Credit Card",
        items: [
          { id: "BK-006", title: "The Hobbit", price: 14.99, quantity: 2 }
        ]
      },
      { 
        id: "ORD-1004", 
        customer: "James Miller", 
        email: "james@example.com",
        amount: 18.75, 
        status: "Canceled", 
        date: "2024-06-17",
        address: "321 Elm St, Houston, TX 77001",
        phone: "555-234-5678",
        paymentMethod: "PayPal",
        items: [
          { id: "BK-003", title: "1984", price: 9.99, quantity: 1 },
          { id: "BK-007", title: "Animal Farm", price: 8.76, quantity: 1 }
        ]
      }
    ];
    
    // Update the order
    const updatedOrders = orders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          customer: formData.customer,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
          paymentMethod: formData.paymentMethod
        };
      }
      return o;
    });
    
    // Save updated orders to localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Show success popup
    setShowSuccessPopup(true);
    
    // Hide popup after 3 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      // Get orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orders = storedOrders.length > 0 ? storedOrders : [
        { 
          id: "ORD-1001", 
          customer: "Emma Johnson", 
          email: "emma@example.com",
          amount: 39.99, 
          status: "Pending", 
          date: "2024-06-22",
          address: "123 Main St, New York, NY 10001",
          phone: "555-123-4567",
          paymentMethod: "Credit Card",
          items: [
            { id: "BK-001", title: "The Great Gatsby", price: 12.99, quantity: 1 },
            { id: "BK-003", title: "1984", price: 9.99, quantity: 2 }
          ]
        },
        { 
          id: "ORD-1002", 
          customer: "Noah Smith", 
          email: "noah@example.com",
          amount: 54.5, 
          status: "Shipped", 
          date: "2024-06-21",
          address: "456 Oak Ave, Chicago, IL 60007",
          phone: "555-987-6543",
          paymentMethod: "PayPal",
          items: [
            { id: "BK-002", title: "To Kill a Mockingbird", price: 10.50, quantity: 1 },
            { id: "BK-004", title: "Pride and Prejudice", price: 11.25, quantity: 2 },
            { id: "BK-005", title: "The Catcher in the Rye", price: 10.75, quantity: 2 }
          ]
        },
        { 
          id: "ORD-1003", 
          customer: "Olivia Davis", 
          email: "olivia@example.com",
          amount: 29.99, 
          status: "Delivered", 
          date: "2024-06-19",
          address: "789 Pine St, Los Angeles, CA 90001",
          phone: "555-456-7890",
          paymentMethod: "Credit Card",
          items: [
            { id: "BK-006", title: "The Hobbit", price: 14.99, quantity: 2 }
          ]
        },
        { 
          id: "ORD-1004", 
          customer: "James Miller", 
          email: "james@example.com",
          amount: 18.75, 
          status: "Canceled", 
          date: "2024-06-17",
          address: "321 Elm St, Houston, TX 77001",
          phone: "555-234-5678",
          paymentMethod: "PayPal",
          items: [
            { id: "BK-003", title: "1984", price: 9.99, quantity: 1 },
            { id: "BK-007", title: "Animal Farm", price: 8.76, quantity: 1 }
          ]
        }
      ];
      
      // Filter out the order to delete
      const filteredOrders = orders.filter(o => o.id !== order.id);
      
      // Save updated orders to localStorage
      localStorage.setItem('orders', JSON.stringify(filteredOrders));
      
      // Navigate back to order management page
      window.history.pushState({}, "", "/admin/orders");
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleExport = () => {
    // Create a CSV string with order details
    const orderDetails = [
      ["Order ID", order.id],
      ["Customer", order.customer],
      ["Email", order.email],
      ["Phone", order.phone],
      ["Address", order.address],
      ["Date", order.date],
      ["Status", order.status],
      ["Payment Method", order.paymentMethod],
      ["Total Amount", `$${order.amount.toFixed(2)}`],
      [""],
      ["Product ID", "Product Name", "Price", "Quantity", "Subtotal"]
    ];

    // Add order items
    order.items.forEach(item => {
      orderDetails.push([
        item.id,
        item.title,
        `$${item.price.toFixed(2)}`,
        item.quantity,
        `$${(item.price * item.quantity).toFixed(2)}`
      ]);
    });

    // Convert to CSV
    const csvContent = orderDetails.map(row => row.join(",")).join("\n");
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Order_${order.id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackToOrders = () => {
    window.history.pushState({}, "", "/admin/orders");
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
        <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}>
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading} mb-4`}>Order Not Found</h1>
          <p className="mb-6">The order you are looking for does not exist.</p>
          <button 
            onClick={handleBackToOrders}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBackToOrders}
              className={`p-2 rounded-full border ${theme.border} hover:opacity-90`} 
              aria-label="Back to orders" 
              title="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Update Order</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold">Order ID:</span>
            <span>{order.id}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold">Date:</span>
            <span>{order.date}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold">Total Amount:</span>
            <span>${order.amount.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Customer Name</label>
              <input
                type="text"
                name="customer"
                value={formData.customer || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText}`}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText}`}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText}`}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText}`}
                required
              >
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText}`}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Shipping Address</label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText}`}
                rows="3"
                required
              ></textarea>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className="py-2 px-3 text-left">Product</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className={`border-b ${theme.border}`}>
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">SKU: {item.id}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Update Order
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`${theme.cardBg} rounded-xl shadow-lg p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-emerald-100 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-xl font-bold ${theme.textStrong}`}>Order Updated Successfully</h2>
            </div>
            <p className="mb-6">The order has been updated successfully.</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  handleBackToOrders();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}