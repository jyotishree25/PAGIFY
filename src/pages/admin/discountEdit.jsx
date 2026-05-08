import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DiscountEdit({ onBack: propOnBack, darkMode, discountId: propId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const discountId = propId || queryParams.get("id");

  const onBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate("/admin/discounts");
    }
  };

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    startDate: "",
    endDate: "",
    active: true,
    usageLimit: "",
    applicableProducts: "All Products"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        inputBg: "bg-slate-800",
        inputBorder: "border-slate-700",
        inputText: "text-slate-200",
        inputPlaceholder: "placeholder-slate-500",
        selectBg: "bg-slate-800",
        selectBorder: "border-slate-700",
        selectText: "text-slate-200",
        accent: "bg-emerald-600 hover:bg-emerald-500",
        danger: "bg-rose-600 hover:bg-rose-500",
        warning: "bg-amber-600 hover:bg-amber-500",
        success: "bg-emerald-600 hover:bg-emerald-500"
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
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputText: "text-gray-800",
        inputPlaceholder: "placeholder-gray-400",
        selectBg: "bg-white",
        selectBorder: "border-gray-300",
        selectText: "text-gray-800",
        accent: "bg-emerald-600 hover:bg-emerald-700",
        danger: "bg-rose-600 hover:bg-rose-700",
        warning: "bg-amber-500 hover:bg-amber-600",
        success: "bg-emerald-600 hover:bg-emerald-700"
      };

  // Simulated data fetching for existing discount
  useEffect(() => {
    if (discountId && discountId !== "new") {
      // In a real app, this would be an API call
      setTimeout(() => {
        // Simulated discount data
        const discountData = {
          id: discountId,
          code: discountId === "DISC001" ? "SUMMER25" : 
                discountId === "DISC002" ? "WELCOME10" : 
                discountId === "DISC003" ? "FREESHIP" : 
                discountId === "DISC004" ? "FLASH15" : "FIXED10",
          type: discountId === "DISC003" ? "shipping" : 
                discountId === "DISC005" ? "fixed" : "percentage",
          value: discountId === "DISC001" ? 25 : 
                 discountId === "DISC002" ? 10 : 
                 discountId === "DISC003" ? 0 : 
                 discountId === "DISC004" ? 15 : 10,
          minPurchase: discountId === "DISC001" ? 50 : 
                       discountId === "DISC002" ? 0 : 
                       discountId === "DISC003" ? 75 : 
                       discountId === "DISC004" ? 25 : 50,
          startDate: discountId === "DISC001" ? "2023-06-01" : 
                     discountId === "DISC002" ? "2023-01-01" : 
                     discountId === "DISC003" ? "2023-05-15" : 
                     discountId === "DISC004" ? "2023-04-01" : "2023-07-01",
          endDate: discountId === "DISC001" ? "2023-08-31" : 
                   discountId === "DISC002" ? "2023-12-31" : 
                   discountId === "DISC003" ? "2023-07-15" : 
                   discountId === "DISC004" ? "2023-04-03" : "2023-07-31",
          active: discountId !== "DISC004",
          usageLimit: discountId === "DISC001" ? 1000 : 
                      discountId === "DISC002" ? 5000 : 
                      discountId === "DISC003" ? 2000 : 
                      discountId === "DISC004" ? 500 : 1000,
          applicableProducts: discountId === "DISC004" ? "Fiction Books" : 
                              discountId === "DISC005" ? "Non-Fiction Books" : "All Products"
        };
        
        setFormData(discountData);
        setIsLoading(false);
      }, 500);
    } else {
      // New discount
      setIsLoading(false);
    }
  }, [discountId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.code) {
      setError("Discount code is required");
      return;
    }
    
    if (formData.type !== "shipping" && (!formData.value || formData.value <= 0)) {
      setError("Please enter a valid discount value");
      return;
    }
    
    if (formData.minPurchase === "" || isNaN(formData.minPurchase)) {
      setError("Please enter a valid minimum purchase amount");
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      setError("Please select valid start and end dates");
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("End date must be after start date");
      return;
    }
    
    if (!formData.usageLimit || formData.usageLimit <= 0) {
      setError("Please enter a valid usage limit");
      return;
    }
    
    // Clear any previous errors
    setError("");
    
    // In a real app, this would be an API call to save the discount
    console.log("Saving discount:", formData);
    
    // Navigate back to discount management
    onBack();
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className={`mr-4 p-2 rounded-full ${theme.cardBg} ${theme.border} border`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className={`text-2xl font-bold ${theme.headerText}`}>
            {discountId === "new" ? "Create New Discount" : "Edit Discount"}
          </h1>
        </div>

        {/* Form */}
        <div className={`${theme.cardBg} ${theme.border} border rounded-lg p-6`}>
          {error && (
            <div className="bg-rose-100 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Code */}
              <div>
                <label htmlFor="code" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  Discount Code*
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} px-4 py-2`}
                  placeholder="e.g., SUMMER25"
                  required
                />
              </div>

              {/* Discount Type */}
              <div>
                <label htmlFor="type" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  Discount Type*
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full rounded-lg ${theme.selectBg} ${theme.selectBorder} border ${theme.selectText} px-4 py-2`}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>

              {/* Discount Value */}
              {formData.type !== "shipping" && (
                <div>
                  <label htmlFor="value" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                    {formData.type === "percentage" ? "Percentage Value*" : "Fixed Amount Value*"}
                  </label>
                  <div className="relative">
                    {formData.type === "fixed" && (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className={theme.textMuted}>₹</span>
                      </div>
                    )}
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      className={`w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} ${formData.type === "fixed" ? "pl-7" : "px-4"} py-2`}
                      placeholder={formData.type === "percentage" ? "e.g., 25" : "e.g., 10"}
                      min="0"
                      step={formData.type === "percentage" ? "1" : "0.01"}
                      required
                    />
                    {formData.type === "percentage" && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className={theme.textMuted}>%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Minimum Purchase */}
              <div>
                <label htmlFor="minPurchase" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  Minimum Purchase*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={theme.textMuted}>₹</span>
                  </div>
                  <input
                    type="number"
                    id="minPurchase"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleChange}
                    className={`w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} pl-7 py-2`}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  Start Date*
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} px-4 py-2`}
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  End Date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} px-4 py-2`}
                  required
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label htmlFor="usageLimit" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  Usage Limit*
                </label>
                <input
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  className={`w-full rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.inputText} px-4 py-2`}
                  placeholder="e.g., 1000"
                  min="1"
                  required
                />
              </div>

              {/* Applicable Products */}
              <div>
                <label htmlFor="applicableProducts" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>
                  Applicable Products
                </label>
                <select
                  id="applicableProducts"
                  name="applicableProducts"
                  value={formData.applicableProducts}
                  onChange={handleChange}
                  className={`w-full rounded-lg ${theme.selectBg} ${theme.selectBorder} border ${theme.selectText} px-4 py-2`}
                >
                  <option value="All Products">All Products</option>
                  <option value="Fiction Books">Fiction Books</option>
                  <option value="Non-Fiction Books">Non-Fiction Books</option>
                  <option value="Children's Books">Children's Books</option>
                  <option value="Textbooks">Textbooks</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className={`ml-2 block text-sm ${theme.text}`}>
                  Active
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onBack}
                className={`px-4 py-2 border ${theme.border} rounded-lg ${theme.textMuted}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${theme.accent} text-white px-4 py-2 rounded-lg`}
              >
                {discountId === "new" ? "Create Discount" : "Update Discount"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}