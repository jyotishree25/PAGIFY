import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function DiscountManagement({ onBack: propOnBack, darkMode }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const onBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate("/admin/dashboard");
    }
  };
  
  // State for discounts
  const [discounts, setDiscounts] = useState([
    { 
      id: "DISC001", 
      code: "SUMMER25", 
      type: "percentage", 
      value: 25, 
      minPurchase: 50, 
      startDate: "2023-06-01", 
      endDate: "2023-08-31", 
      active: true,
      usageLimit: 1000,
      usageCount: 342,
      applicableProducts: "All Products"
    },
    { 
      id: "DISC002", 
      code: "WELCOME10", 
      type: "percentage", 
      value: 10, 
      minPurchase: 0, 
      startDate: "2023-01-01", 
      endDate: "2023-12-31", 
      active: true,
      usageLimit: 5000,
      usageCount: 2145,
      applicableProducts: "All Products"
    },
    { 
      id: "DISC003", 
      code: "FREESHIP", 
      type: "shipping", 
      value: 0, 
      minPurchase: 75, 
      startDate: "2023-05-15", 
      endDate: "2023-07-15", 
      active: true,
      usageLimit: 2000,
      usageCount: 876,
      applicableProducts: "All Products"
    },
    { 
      id: "DISC004", 
      code: "FLASH15", 
      type: "percentage", 
      value: 15, 
      minPurchase: 25, 
      startDate: "2023-04-01", 
      endDate: "2023-04-03", 
      active: false,
      usageLimit: 500,
      usageCount: 487,
      applicableProducts: "Fiction Books"
    },
    { 
      id: "DISC005", 
      code: "FIXED10", 
      type: "fixed", 
      value: 10, 
      minPurchase: 50, 
      startDate: "2023-07-01", 
      endDate: "2023-07-31", 
      active: true,
      usageLimit: 1000,
      usageCount: 213,
      applicableProducts: "Non-Fiction Books"
    }
  ]);

  const theme = darkMode
    ? {
        bg: "bg-slate-900",
        text: "text-slate-200",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        headerText: "text-white",
        heading: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300",
        textStrong: "text-slate-100",
        textMuted: "text-slate-400",
        tableHeaderBg: "bg-slate-800",
        tableHeaderText: "text-slate-300",
        tableRowBg: "bg-slate-800",
        tableRowBgAlt: "bg-slate-800/60",
        tableRowHover: "hover:bg-slate-700",
        tableBorder: "border-slate-700",
        inputBg: "bg-slate-800",
        inputBorder: "border-slate-700",
        inputText: "text-slate-200",
        inputPlaceholder: "placeholder-slate-500",
        accent: "bg-emerald-600 hover:bg-emerald-500",
        accentSubtle: "bg-emerald-600/10 text-emerald-500",
        danger: "bg-rose-600 hover:bg-rose-500",
        warning: "bg-amber-600 hover:bg-amber-500",
        success: "bg-emerald-600 hover:bg-emerald-500",
        inactive: "bg-slate-600 hover:bg-slate-500"
      }
    : {
        bg: "bg-gray-50",
        text: "text-gray-800",
        cardBg: "bg-white",
        border: "border-gray-200",
        headerText: "text-gray-800",
        heading: "text-gray-800",
        textStrong: "text-gray-800",
        textMuted: "text-gray-500",
        tableHeaderBg: "bg-gray-50",
        tableHeaderText: "text-gray-600",
        tableRowBg: "bg-white",
        tableRowBgAlt: "bg-gray-50/60",
        tableRowHover: "hover:bg-gray-50",
        tableBorder: "border-gray-200",
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputText: "text-gray-800",
        inputPlaceholder: "placeholder-gray-400",
        accent: "bg-emerald-600 hover:bg-emerald-700",
        accentSubtle: "bg-emerald-100 text-emerald-700",
        danger: "bg-rose-600 hover:bg-rose-700",
        warning: "bg-amber-500 hover:bg-amber-600",
        success: "bg-emerald-600 hover:bg-emerald-700",
        inactive: "bg-gray-400 hover:bg-gray-500"
      };

  // Filter discounts based on search and active filter
  const filtered = useMemo(() => {
    return discounts.filter(discount => {
      const matchesSearch = discount.code.toLowerCase().includes(search.toLowerCase()) ||
                          discount.id.toLowerCase().includes(search.toLowerCase());
      
      if (activeFilter === "all") return matchesSearch;
      if (activeFilter === "active") return matchesSearch && discount.active;
      if (activeFilter === "inactive") return matchesSearch && !discount.active;
      
      return matchesSearch;
    });
  }, [discounts, search, activeFilter]);

  // Function to handle editing a discount
  const handleEditDiscount = (discountId) => {
    navigate(`/admin/discount-edit?id=${discountId}`);
  };

  // Function to handle toggling a discount's active status
  const handleToggleActive = (discountId) => {
    setDiscounts(discounts.map(discount => {
      if (discount.id === discountId) {
        return { ...discount, active: !discount.active };
      }
      return discount;
    }));
  };

  // Function to handle deleting a discount
  const handleDeleteDiscount = (discountId) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      setDiscounts(discounts.filter(discount => discount.id !== discountId));
    }
  };

  // Function to format discount value based on type
  const formatDiscountValue = (discount) => {
    if (discount.type === "percentage") return `${discount.value}%`;
    if (discount.type === "fixed") return `₹${discount.value}`;
    if (discount.type === "shipping") return "Free Shipping";
    return discount.value;
  };

  // Function to get status badge classes
  const statusBadgeClasses = (active) => {
    return active 
      ? `${theme.accentSubtle} px-2 py-1 rounded-full text-xs font-medium`
      : `bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400 px-2 py-1 rounded-full text-xs font-medium`;
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className={`mr-4 p-2 rounded-full ${theme.cardBg} ${theme.border} border`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-2xl font-bold ${theme.headerText}`}>Discount Management</h1>
          </div>
          <button
            onClick={() => handleEditDiscount("new")}
            className={`${theme.accent} text-white px-4 py-2 rounded-lg font-medium flex items-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Discount
          </button>
        </div>

        {/* Search and filters */}
        <div className={`${theme.cardBg} ${theme.border} border rounded-lg p-4 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search discounts..."
                className={`pl-10 pr-4 py-2 w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} ${theme.inputPlaceholder}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className={theme.textMuted}>Status:</span>
              <div className={`flex rounded-lg overflow-hidden border ${theme.border}`}>
                <button
                  className={`px-3 py-1 text-sm ${activeFilter === 'all' ? theme.accent + ' text-white' : theme.cardBg}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 text-sm ${activeFilter === 'active' ? theme.accent + ' text-white' : theme.cardBg}`}
                  onClick={() => setActiveFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1 text-sm ${activeFilter === 'inactive' ? theme.accent + ' text-white' : theme.cardBg}`}
                  onClick={() => setActiveFilter('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Discounts table */}
        <div className={`${theme.cardBg} ${theme.border} border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${theme.tableBorder}`}>
              <thead className={theme.tableHeaderBg}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Code</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Discount</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Min. Purchase</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Validity</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Usage</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Status</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme.tableHeaderText} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.tableBorder}`}>
                {filtered.length > 0 ? (
                  filtered.map((discount, idx) => (
                    <tr 
                      key={discount.id} 
                      className={`${idx % 2 === 0 ? theme.tableRowBg : theme.tableRowBgAlt} ${theme.tableRowHover}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{discount.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDiscountValue(discount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">₹{discount.minPurchase}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {discount.usageCount} / {discount.usageLimit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={statusBadgeClasses(discount.active)}>
                          {discount.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDiscount(discount.id)}
                            className={`${theme.accent} text-white px-3 py-1 rounded text-xs`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(discount.id)}
                            className={`${discount.active ? theme.warning : theme.success} text-white px-3 py-1 rounded text-xs`}
                          >
                            {discount.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className={`${theme.danger} text-white px-3 py-1 rounded text-xs`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={theme.tableRowBg}>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm">
                      No discounts found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}