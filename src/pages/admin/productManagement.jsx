import React, { useMemo, useState, useEffect } from "react";

export default function ProductManagement({ onBack, darkMode }) {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [products, setProducts] = useState([]);

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
        tableHeaderText: "text-slate-300"
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
        tableHeaderText: "text-black"
      };

  // Load products from localStorage on component mount
 useEffect(() => {
  async function fetchProducts() {
    try {
      const res = await fetch("http://localhost:8000/api/v1/products/all");
      const data = await res.json();

      // Normalize DB products to match table
      const formatted = (data.products || []).map((p) => ({
         _id: p._id, 
        id: p.id ,          
        title: p.title,
        price: Number(p.price),
        stock: Number(p.stock || 0),
        status: p.blocked ? "Blocked" : p.status,
        blocked: p.blocked || false,
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  }

  fetchProducts();
}, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesText = [p.id, p.title].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "> 0" && p.stock > 0) ||
        (stockFilter === "= 0" && p.stock === 0);
      return matchesText && matchesStock;
    });
  }, [query, stockFilter, products]);

  const statusClasses = (status, blocked) => {
    if (blocked) {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "Draft":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Archived":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      case "Out of Stock":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const handleEditProduct = (productId) => {
  window.history.pushState({}, "", `/admin/products/edit/${productId}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const handleDeleteProduct = async (productId) => {
  if (!window.confirm("Are you sure?")) return;

  await fetch(`http://localhost:8000/api/v1/products/${productId}`, {
    method: "DELETE",
  });

  setProducts(prev => prev.filter(p => p._id !== productId));
};





  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className={`p-2 rounded-full border ${theme.border} hover:opacity-90`} aria-label="Back to dashboard" title="Back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Product Management</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200 placeholder-slate-400' : 'bg-white text-gray-800 placeholder-gray-400'}`}
            />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'}`}
            >
              {['All','> 0','= 0'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                window.history.pushState({}, "", "/admin/add-product");
                window.dispatchEvent(new PopStateEvent('popstate'));

              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Add Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={darkMode ? "text-slate-300" : "text-black"}>
                <th className="py-2 pr-4">Product ID</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <td className={`py-3 pr-4 font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{p.id}</td>
                  <td className="py-3 pr-4">{p.title}</td>
                  <td className="py-3 pr-4">{p.price.toFixed(2)}</td>
                  <td className="py-3 pr-4">{p.stock}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses(p.status, p.blocked)}`}>
                      {p.blocked ? "Blocked" : p.status}
                    </span>
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <button 
                     onClick={() => handleEditProduct(p._id)}
                      className={`px-3 py-1 rounded-md border mr-2 ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-all transform hover:scale-105`}
                      disabled={p.blocked}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(p._id)}
                      className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all transform hover:scale-105"
                    >
                      {p.stock === 0 ? "Block" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




