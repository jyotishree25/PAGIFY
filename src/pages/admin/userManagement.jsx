import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";

export default function UserManagement({ onBack, darkMode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeView, setActiveView] = useState("all"); 

  // NEW STATE: For managing the popup and the user currently being disabled
  const [showDisablePopup, setShowDisablePopup] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [disableReason, setDisableReason] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const response = await axios.get('https://pagify-g5g5.onrender.com/api/v1/users', config);
        
        if (response.data.status === 'success') {
          const mappedUsers = response.data.users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: "Customer", // Default role since not in User model
            status: "Active", // Default status
            type: "General"   // Default type
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


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
        inputBg: "bg-slate-700", // Added input background for dark mode
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
      };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesText = [u.id, u.name, u.email].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesType = activeView === "all" || 
                           (activeView === "premium" && u.type === "Premium") || 
                           (activeView === "general" && u.type === "General");
      return matchesText && matchesRole && matchesType;
    });
  }, [query, roleFilter, activeView, users]);

  const statusClasses = (status) =>
    status === "Active"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : "bg-rose-100 text-rose-700 border border-rose-200";
      
  const typeClasses = (type) =>
    type === "Premium"
      ? "bg-purple-100 text-purple-700 border border-purple-200"
      : "bg-blue-100 text-blue-700 border border-blue-200";
      
  const handleViewChange = (view) => {
    setActiveView(view);
    // Note: The pushState is for demo/URL path simulation; a real router is better.
    if (view === "premium") {
      window.history.pushState({}, "", "/admin/users/premium");
    } else if (view === "general") {
      window.history.pushState({}, "", "/admin/users/general");
    } else {
      window.history.pushState({}, "", "/admin/users");
    }
  };

  // NEW: Handler to open the disable confirmation popup
  const openDisablePopup = (user) => {
    setUserToDisable(user);
    setShowDisablePopup(true);
  };

  // NEW: Handler to confirm and update user status
  const confirmDisable = () => {
    if (!userToDisable || !disableReason) {
      alert("Please select a reason to disable the user.");
      return;
    }

    setUsers(users.map(u => 
      u.id === userToDisable.id 
        ? { ...u, status: "Suspended" } // Update status
        : u
    ));

    // In a real application, you would make an API call here.
    console.log(`User ${userToDisable.id} disabled for reason: ${disableReason}`);

    // Close and reset popup state
    setShowDisablePopup(false);
    setUserToDisable(null);
    setDisableReason("");
  };

  const cancelDisable = () => {
    setShowDisablePopup(false);
    setUserToDisable(null);
    setDisableReason("");
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
            <button onClick={handleBackToDashboard} className={`p-2 rounded-full border ${theme.border} hover:opacity-90 transition-all transform hover:scale-110`} aria-label="Back to dashboard" title="Back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>User Management</h1>
          </div>
          {/* Search and Role Filter (Invite User button removed) */}
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200 placeholder-slate-400' : 'bg-white text-gray-800 placeholder-gray-400'}`}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'}`}
            >
              {['All','Admin','Seller','Customer'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* View Filters */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => handleViewChange('all')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'all' ? 'bg-emerald-600 text-white' : `${theme.border} border hover:bg-gray-100 ${darkMode ? 'hover:bg-slate-700' : ''}`}`}
          >
            All Users
          </button>
          <button 
            onClick={() => handleViewChange('premium')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'premium' ? 'bg-purple-600 text-white' : `${theme.border} border hover:bg-gray-100 ${darkMode ? 'hover:bg-slate-700' : ''}`}`}
          >
            Premium Users
          </button>
          <button 
            onClick={() => handleViewChange('general')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'general' ? 'bg-blue-600 text-white' : `${theme.border} border hover:bg-gray-100 ${darkMode ? 'hover:bg-slate-700' : ''}`}`}
          >
            General Users
          </button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className={`p-8 text-center ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500">
              {error}
            </div>
          ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={darkMode ? "text-slate-300" : "text-black"}>
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((u, index) => (
                  <tr key={u.id} className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                    <td className={`py-3 pr-4 font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}> {index + 1}</td>
                    <td className="py-3 pr-4">{u.name}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">{u.role}</td>
                    <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeClasses(u.type)}`}>{u.type}</span></td>
                    <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses(u.status)}`}>{u.status}</span></td>
                    <td className="py-3 pr-0 text-right">
                      {/* Conditional button text based on current status */}
                      {u.status === "Active" ? (
                          <button 
                              onClick={() => openDisablePopup(u)} 
                              className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all transform hover:scale-105"
                          >
                              Disable
                          </button>
                      ) : (
                          <button 
                              // Add an action to re-enable here in a real app
                              className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-all transform hover:scale-105"
                          >
                              Activate
                          </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* --- Disable Confirmation Popup --- */}
      {showDisablePopup && userToDisable && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`${theme.cardBg} rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 border ${theme.border}`}>
            <h3 className={`text-2xl font-bold mb-4 ${theme.textStrong}`}>
              Confirm User Suspension
            </h3>
            
            <p className={`mb-4 ${theme.textMuted}`}>
              Are you sure you want to **disable** the account for **{userToDisable.name} ({userToDisable.id})**? This action will revoke access.
            </p>

            <div className="mb-6">
              <label htmlFor="disableReason" className="block mb-2 font-medium">
                Reason for Disablement:
              </label>
              <select
                id="disableReason"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-rose-500 ${theme.border} ${theme.inputBg} ${theme.inputText}`}
                required
              >
                <option value="" disabled>Select a reason...</option>
                <option value="Policy Violation">Violation of Terms/Policy</option>
                <option value="Fraudulent Activity">Suspicion of Fraudulent Activity</option>
                <option value="Inactivity">Extended Inactivity</option>
                <option value="User Request">User Requested Deactivation</option>
                <option value="Other">Other (Requires Internal Note)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDisable}
                className={`px-4 py-2 rounded-lg border ${theme.border} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDisable}
                disabled={!disableReason}
                className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                  disableReason 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Disable Account
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ----------------------------------- */}
    </div>
  );
}