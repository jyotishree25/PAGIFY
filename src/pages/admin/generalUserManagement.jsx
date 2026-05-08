import React, { useMemo, useState } from "react";

export default function GeneralUserManagement({ onBack, darkMode }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const theme = darkMode
    ? {
        bg: "bg-slate-900",
        text: "text-slate-200",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        headerText: "text-white",
        heading: "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 drop-shadow",
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

  const generalUsers = [
    { id: "USR-003", name: "Olivia Davis", email: "olivia@example.com", role: "Customer", status: "Suspended", joinDate: "2023-02-05", lastLogin: "2023-05-20" },
    { id: "USR-004", name: "James Miller", email: "james@example.com", role: "Customer", status: "Active", joinDate: "2023-03-12", lastLogin: "2023-06-09" },
    { id: "USR-006", name: "Liam Anderson", email: "liam@example.com", role: "Seller", status: "Active", joinDate: "2023-01-30", lastLogin: "2023-06-07" },
  ];

  const filtered = useMemo(() => {
    return generalUsers.filter((u) => {
      const matchesText = [u.id, u.name, u.email].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [query, statusFilter]);

  const statusClasses = (status) =>
    status === "Active"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : "bg-rose-100 text-rose-700 border border-rose-200";

  const handleBackToUsers = () => {
    window.history.pushState({}, "", "/admin/users");
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleUpgradeToPremium = (userId) => {
    console.log(`Upgrading user ${userId} to premium`);
    // In a real application, this would make an API call to upgrade the user
    alert(`User ${userId} has been upgraded to premium!`);
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
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>General User Management</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search general users..."
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200 placeholder-slate-400' : 'bg-white text-gray-800 placeholder-gray-400'}`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.border} ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'}`}
            >
              {['All','Active','Suspended'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all transform hover:scale-105">Add User</button>
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
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 bg-blue-600 text-white`}
          >
            General Users
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
                  <td className="py-3 pr-4">{u.joinDate}</td>
                  <td className="py-3 pr-4">{u.lastLogin}</td>
                  <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses(u.status)}`}>{u.status}</span></td>
                  <td className="py-3 pr-0 text-right">
                    <button className={`px-3 py-1 rounded-md border mr-2 ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-all transform hover:scale-105`}>Edit</button>
                    <button 
                      onClick={() => handleUpgradeToPremium(u.id)}
                      className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-all transform hover:scale-105"
                    >
                      Upgrade to Premium
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8">
          <h2 className={`text-xl font-bold mb-4 ${theme.textStrong}`}>Upgrade to Premium</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold text-lg mb-3">Benefits of Premium</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access to exclusive content</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic discounts on all purchases</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Early access to new features</span>
                </li>
              </ul>
            </div>
            
            <div className={`p-6 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold text-lg mb-3">How to Upgrade Users</h3>
              <p className={`mb-4 ${theme.textMuted}`}>Select a user from the table above and click the "Upgrade to Premium" button to instantly upgrade their account status.</p>
              <p className={`${theme.textMuted}`}>Premium users will immediately gain access to all premium features and will be moved to the Premium Users section.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}