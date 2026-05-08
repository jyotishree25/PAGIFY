import React, { useMemo, useState } from "react";

export default function PremiumUserManagement({ onBack, darkMode }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const theme = darkMode
    ? {
        bg: "bg-slate-900",
        text: "text-slate-200",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        headerText: "text-white",
        heading: "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 drop-shadow",
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

  const premiumUsers = [
    { id: "USR-001", name: "Emma Johnson", email: "emma@example.com", role: "Admin", status: "Active", subscriptionPlan: "Annual", joinDate: "2023-01-15", lastLogin: "2023-06-10" },
    { id: "USR-002", name: "Noah Smith", email: "noah@example.com", role: "Seller", status: "Active", subscriptionPlan: "Monthly", joinDate: "2023-02-22", lastLogin: "2023-06-08" },
    { id: "USR-005", name: "Sophia Wilson", email: "sophia@example.com", role: "Customer", status: "Active", subscriptionPlan: "Annual", joinDate: "2023-03-10", lastLogin: "2023-06-05" },
  ];

  const filtered = useMemo(() => {
    return premiumUsers.filter((u) => {
      const matchesText = [u.id, u.name, u.email].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [query, statusFilter]);

  const statusClasses = (status) =>
    status === "Active"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : "bg-rose-100 text-rose-700 border border-rose-200";

  const subscriptionClasses = (plan) =>
    plan === "Annual"
      ? "bg-purple-100 text-purple-700 border border-purple-200"
      : "bg-blue-100 text-blue-700 border border-blue-200";

  const handleBackToUsers = () => {
    window.history.pushState({}, "", "/admin/users");
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className={`p-2 rounded-full border ${theme.border} hover:opacity-90 transition-all transform hover:scale-110`} aria-label="Back to dashboard" title="Back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Premium User Management</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search premium users..."
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200 placeholder-slate-400' : 'bg-white text-gray-800 placeholder-gray-400'}`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'}`}
            >
              {['All','Active','Suspended'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all transform hover:scale-105">Add Premium User</button>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={handleBackToUsers} 
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${theme.border} border hover:bg-gray-100 ${darkMode ? 'hover:bg-slate-700' : ''}`}
          >
            All Users
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 bg-purple-600 text-white`}
          >
            Premium Users
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={darkMode ? "text-slate-300" : "text-black"}>
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Subscription</th>
                <th className="py-2 pr-4">Join Date</th>
                <th className="py-2 pr-4">Last Login</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <td className={`py-3 pr-4 font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{u.id}</td>
                  <td className="py-3 pr-4">{u.name}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{u.role}</td>
                  <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${subscriptionClasses(u.subscriptionPlan)}`}>{u.subscriptionPlan}</span></td>
                  <td className="py-3 pr-4">{u.joinDate}</td>
                  <td className="py-3 pr-4">{u.lastLogin}</td>
                  <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses(u.status)}`}>{u.status}</span></td>
                  <td className="py-3 pr-0 text-right">
                    <button className={`px-3 py-1 rounded-md border mr-2 ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-all transform hover:scale-105`}>Edit</button>
                    <button className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-all transform hover:scale-105">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8">
          <h2 className={`text-xl font-bold mb-4 ${theme.textStrong}`}>Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className={`text-sm ${theme.textMuted}`}>Premium users receive priority customer support with 24-hour response time.</p>
            </div>
            <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">Exclusive Content</h3>
              <p className={`text-sm ${theme.textMuted}`}>Access to exclusive books and early releases not available to general users.</p>
            </div>
            <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">Discount Program</h3>
              <p className={`text-sm ${theme.textMuted}`}>Automatic discounts on all purchases and special promotional offers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}