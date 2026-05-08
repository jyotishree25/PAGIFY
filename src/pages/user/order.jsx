import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Clipboard, Copy } from 'lucide-react';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light"); // Assuming theme state is managed here or passed via context

  // Dummy data for user orders
  const mockOrders = [
    {
      id: "ORD-2025-54678",
      date: "September 12, 2025",
      status: "In Transit",
      trackingId: "TRK-987654321",
      estimatedDelivery: "September 18, 2025",
      items: [
        { id: 1, title: "Factfulness", author: "Hans Rosling", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1523450989i/34890015.jpg", price: "₹500", quantity: 1 },
        { id: 2, title: "The Alchemist", author: "Paulo Coelho", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1483415668i/18144590.jpg", price: "₹250", quantity: 2 }
      ],
      tracking: [
        { status: "Order Placed", date: "Sept 12, 2025", icon: <Clipboard /> },
        { status: "Processing", date: "Sept 12, 2025", icon: <Package /> },
        { status: "Shipped", date: "Sept 13, 2025", icon: <Truck /> },
        { status: "In Transit", date: "Sept 14, 2025", icon: <MapPin /> },
        { status: "Out for Delivery", date: null, icon: <Truck /> },
        { status: "Delivered", date: null, icon: <CheckCircle /> }
      ]
    },
    {
      id: "ORD-2025-12345",
      date: "August 28, 2025",
      status: "Delivered",
      trackingId: "TRK-123456789",
      estimatedDelivery: "September 1, 2025",
      items: [
        { id: 3, title: "The Silent Patient", author: "Alex Michaelides", cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1531741517i/40097951.jpg", price: "₹499", quantity: 1 }
      ],
      tracking: [
        { status: "Order Placed", date: "Aug 28, 2025", icon: <Clipboard /> },
        { status: "Processing", date: "Aug 28, 2025", icon: <Package /> },
        { status: "Shipped", date: "Aug 29, 2025", icon: <Truck /> },
        { status: "In Transit", date: "Aug 30, 2025", icon: <MapPin /> },
        { status: "Out for Delivery", date: "Aug 31, 2025", icon: <Truck /> },
        { status: "Delivered", date: "Sept 1, 2025", icon: <CheckCircle /> }
      ]
    }
  ];

  const themeStyles = {
    light: {
      appBg: "bg-neutral-50",
      cardBg: "bg-white",
      textColor: "text-gray-800",
      secondaryTextColor: "text-gray-500",
      accent: "text-emerald-600",
      accentButtonBg: "bg-emerald-600",
      accentButtonHover: "hover:bg-emerald-700",
      border: "border-gray-300",
      iconColor: "text-gray-500",
      divider: "bg-gray-200",
      timelineColor: "bg-emerald-600",
      timelineDotBg: "bg-emerald-600"
    },
    dark: {
      appBg: "bg-gray-900",
      cardBg: "bg-gray-800",
      textColor: "text-gray-100",
      secondaryTextColor: "text-gray-400",
      accent: "text-emerald-400",
      accentButtonBg: "bg-emerald-600",
      accentButtonHover: "hover:bg-emerald-500",
      border: "border-gray-600",
      iconColor: "text-gray-400",
      divider: "bg-gray-700",
      timelineColor: "bg-emerald-400",
      timelineDotBg: "bg-emerald-400"
    },
  };
  const currentTheme = themeStyles[theme];

  // Function to calculate the total bill for an order
  const calculateTotalBill = (items) => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('₹', ''));
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const OrderCard = ({ order }) => (
    <motion.div
      className={`p-6 rounded-xl shadow-md ${currentTheme.cardBg} transition-colors duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-bold ${currentTheme.textColor}`}>Order <span className={currentTheme.accent}>#{order.id}</span></h3>
          <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Placed on {order.date}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
          {order.status}
        </div>
      </div>

      <div className={`border-t ${currentTheme.border} pt-4`}>
        <p className={`font-semibold ${currentTheme.textColor}`}>Items Ordered:</p>
        <ul className="mt-2 space-y-2">
          {order.items.map(item => (
            <li key={item.id} className="flex items-center space-x-3">
              <img src={item.cover} alt={item.title} className="w-12 h-16 rounded-md shadow" />
              <div>
                <p className={`font-medium ${currentTheme.textColor}`}>{item.title}</p>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>{item.author}</p>
                <p className={`text-sm ${currentTheme.secondaryTextColor}`}>₹{parseFloat(item.price.replace('₹', '')).toFixed(2)} x {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={`border-t ${currentTheme.border} pt-4 mt-4`}>
        <div className="flex justify-between items-center mb-2">
          <p className={`font-bold text-lg ${currentTheme.textColor}`}>Total Bill:</p>
          <span className={`font-extrabold text-lg ${currentTheme.accent}`}>₹{calculateTotalBill(order.items)}</span>
        </div>
      </div>

      <div className={`border-t ${currentTheme.border} pt-4 mt-4`}>
        <div className="flex justify-between items-center">
          <p className={`font-semibold ${currentTheme.textColor}`}>Tracking ID:</p>
          <div className="flex items-center space-x-2">
            <span className={`${currentTheme.secondaryTextColor}`}>{order.trackingId}</span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => document.execCommand('copy')}>
              <Copy className={`h-4 w-4 ${currentTheme.accent} hover:${currentTheme.accent}`} />
            </motion.button>
          </div>
        </div>
        <div className="mt-4">
          <p className={`font-semibold ${currentTheme.textColor} mb-2`}>Order Timeline:</p>
          <div className="relative pl-4">
            <div className={`absolute left-0 top-0 h-full w-0.5 ${currentTheme.timelineColor}`}></div>
            {order.tracking.map((step, index) => (
              <div key={index} className="mb-4 relative last:mb-0">
                <div className={`absolute -left-2.5 top-0.5 h-4 w-4 rounded-full border-2 ${currentTheme.border} ${step.date ? currentTheme.timelineDotBg : currentTheme.cardBg}`}>
                  {step.date && <CheckCircle className={`h-4 w-4 text-white dark:text-gray-900 absolute -left-0.5 -top-0.5 `} />}
                </div>
                <div className={`flex items-start pl-6 ${step.date ? currentTheme.textColor : currentTheme.secondaryTextColor}`}>
                  <div>
                    <h4 className={`font-semibold text-sm`}>{step.status}</h4>
                    {step.date && <p className="text-xs">{step.date}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col min-h-screen p-4 md:p-8 ${currentTheme.appBg} font-sans transition-colors duration-300`}>
      <div className="flex items-center mb-6">
        <motion.button onClick={() => navigate(-1)} className={`p-2 rounded-full ${currentTheme.cardBg} mr-4`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <ArrowLeft className={`h-6 w-6 ${currentTheme.accent}`} />
        </motion.button>
        <h1 className={`text-3xl md:text-4xl font-extrabold ${currentTheme.textColor}`}>Your Orders 🛍️</h1>
      </div>

      <div className="flex-1 space-y-6">
        {mockOrders.length > 0 ? (
          mockOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className={`flex flex-col items-center justify-center p-12 rounded-xl ${currentTheme.cardBg} shadow-md`}>
            <p className={`text-lg ${currentTheme.secondaryTextColor} mb-2`}>You don't have any orders yet.</p>
            <p className={`text-sm ${currentTheme.secondaryTextColor}`}>Start shopping to see your order history here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
