import React from 'react';
import { motion } from 'framer-motion';

// This is a standalone component for a professional invoice page.
// It uses Tailwind CSS for styling and is designed to be easily printable.

const InvoicePage = () => {
  // Dummy data for the invoice to showcase the structure
  const invoiceData = {
    invoiceNumber: 'INV-00101',
    invoiceDate: 'October 26, 2025',
    dueDate: 'November 10, 2025',
    billingAddress: {
      name: 'Sabrina Aryan',
      street: '123 Reading Lane',
      city: 'Bookville, State 54321',
      country: 'USA',
    },
    items: [
      {
        id: 1,
        title: 'Factfulness',
        author: 'Hans Rosling',
        price: 500,
        quantity: 1,
      },
      {
        id: 2,
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        price: 499,
        quantity: 1,
      },
    ],
  };

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.18; // 18% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 font-sans p-4 md:p-8">
      {/* Container for the invoice. A4 size simulation for printing. */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl overflow-hidden p-6 md:p-10 print:shadow-none print:w-full print:p-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 dark:border-gray-700">
          {/* Pagify Logo Section */}
          <div className="flex items-end mb-4 md:mb-0">
            <span className="text-4xl font-bold text-gray-800 dark:text-white">Pa</span>
            <span className="text-6xl font-bold leading-none text-emerald-700 dark:text-emerald-400">G</span>
            <span className="text-4xl font-bold text-gray-800 dark:text-white">ify</span>
          </div>

          {/* Invoice Details Section */}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Invoice</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Invoice #{invoiceData.invoiceNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Date: {invoiceData.invoiceDate}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Due Date: {invoiceData.dueDate}
            </p>
          </div>
        </header>

        {/* Billed To Section */}
        <section className="mt-8 flex flex-col md:flex-row justify-between pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Billed To</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium">
              {invoiceData.billingAddress.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invoiceData.billingAddress.street}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invoiceData.billingAddress.city}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invoiceData.billingAddress.country}
            </p>
          </div>
          {/* Company details section - for demonstration */}
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">From</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium">
              Pagify Inc.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              321 Bookworm Road
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reading City, State 12345
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              India
            </p>
          </div>
        </section>

        {/* Invoice Items Table */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">
                    Item Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {invoiceData.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Subtotal:</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Tax (18%):</span>
              <span className="font-medium">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t-2 border-emerald-500 pt-2">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer and Call to Action */}
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6 print:hidden">
          <p className="text-sm font-semibold">Thank you for your order!</p>
          <div className="flex justify-center space-x-4 mt-4">
            <motion.button
              onClick={() => window.print()}
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-full shadow-md transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Print Invoice
            </motion.button>
            <motion.button
              onClick={() => { /* Navigate back logic */ }}
              className="px-6 py-2 border-2 border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold rounded-full shadow-md transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </div>
          <p className="mt-6 text-xs">&copy; 2025 Pagify. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default InvoicePage;
