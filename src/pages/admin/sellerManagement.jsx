import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function SellerManagement({ darkMode }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [showMailPopup, setShowMailPopup] = useState(false);
  const [mailTarget, setMailTarget] = useState(null);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get("https://pagify-g5g5.onrender.com/api/v1/sellers");
        if (res.data.status === "success") {
          const mapped = res.data.sellers.map((s) => ({
            id: s._id,
            name: s.name,
            email: s.email,
            phone: s.phone || "-",
            address: s.companyAddress || s.location || "-",
            paymentStatus: s.paymentStatus || "Pending",
            monthsPending: s.monthsPending || 0,
            isBlocked: !!s.isBlocked,
          }));
          setSellers(mapped);
        } else {
          setError("Failed to fetch sellers.");
        }
      } catch (err) {
        setError("Failed to fetch sellers from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const theme = darkMode
    ? {
        bg: "bg-slate-900",
        text: "text-slate-200",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        heading: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300",
        textStrong: "text-slate-100",
        textMuted: "text-slate-300",
        inputBg: "bg-slate-800",
      }
    : {
        bg: "bg-amber-50",
        text: "text-black",
        cardBg: "bg-white",
        border: "border-gray-100",
        heading: "text-black",
        textStrong: "text-black",
        textMuted: "text-black",
        inputBg: "bg-white",
      };

  const filtered = useMemo(() => {
    return sellers.filter((s) =>
      [s.id, s.name, s.email, s.phone, s.address].join(" ").toLowerCase().includes(query.toLowerCase())
    );
  }, [query, sellers]);

  const handleBackToDashboard = () => {
    window.history.pushState({}, "", "/admin/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const toggleBlock = async (seller) => {
    try {
      const res = await axios.patch(`https://pagify-g5g5.onrender.com/api/v1/sellers/${seller.id}`, {
        isBlocked: !seller.isBlocked,
      });
      if (res.data.status === "success") {
        setSellers((prev) =>
          prev.map((s) => (s.id === seller.id ? { ...s, isBlocked: !seller.isBlocked } : s))
        );
      } else {
        alert("Failed to update block state");
      }
    } catch (err) {
      alert("Server error while updating block state");
    }
  };

  const openMailPopup = (seller) => {
    setMailTarget(seller);
    setMailSubject("");
    setMailBody("");
    setShowMailPopup(true);
  };

  const sendMail = async () => {
    if (!mailTarget || !mailSubject || !mailBody) {
      alert("Please fill subject and message.");
      return;
    }
    try {
      const res = await axios.post(`https://pagify-g5g5.onrender.com/api/v1/sellers/${mailTarget.id}/notify`, {
        subject: mailSubject,
        message: mailBody,
      });
      if (res.data.status === "success") {
        setShowMailPopup(false);
        setMailTarget(null);
        setMailSubject("");
        setMailBody("");
        alert("Mail notification queued.");
      } else {
        alert("Failed to send notification.");
      }
    } catch (err) {
      alert("Server error while sending notification.");
    }
  };

  const paymentCell = (s) => {
    if (s.paymentStatus === "Done") return "Done";
    return `Pending (${s.monthsPending} month${s.monthsPending === 1 ? "" : "s"})`;
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-8`}>
      <div className={`${theme.cardBg} rounded-xl shadow-md border ${theme.border} p-5 md:p-6`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToDashboard}
              className={`p-2 rounded-full border ${theme.border} hover:opacity-90 transition-all transform hover:scale-110`}
              aria-label="Back to dashboard"
              title="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Seller Management</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sellers..."
              className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${
                darkMode ? "bg-slate-800 text-slate-200 placeholder-slate-400" : "bg-white text-gray-800 placeholder-gray-400"
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className={`p-8 text-center ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Loading sellers...</div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500">{error}</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={darkMode ? "text-slate-300" : "text-black"}>
                  <th className="py-2 pr-4">Seller ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Payment</th>
                  <th className="py-2 pr-4">Blocked</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((s, index) => (
                    <tr key={s.id} className={darkMode ? "border-t border-slate-700" : "border-t border-gray-100"}>
                      <td className="py-2 pr-4">{index + 1}</td>
                      <td className="py-2 pr-4">{s.name}</td>
                      <td className="py-2 pr-4">{s.email}</td>
                      <td className="py-2 pr-4">{s.phone}</td>
                      <td className="py-2 pr-4">{s.address}</td>
                      <td className="py-2 pr-4">{paymentCell(s)}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-1 rounded-md border ${
                            s.isBlocked
                              ? "bg-rose-100 text-rose-700 border-rose-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {s.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => toggleBlock(s)}
                            className={`px-3 py-1 rounded-md ${
                              s.isBlocked ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-rose-600 text-white hover:bg-rose-700"
                            } transition-all transform hover:scale-105`}
                          >
                            {s.isBlocked ? "Unblock" : "Block"}
                          </button>
                          <button
                            onClick={() => openMailPopup(s)}
                            className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all transform hover:scale-105"
                          >
                            Send Mail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">No sellers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showMailPopup && mailTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`${theme.cardBg} rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 border ${theme.border}`}>
            <h3 className={`text-2xl font-bold mb-4 ${theme.textStrong}`}>Send Mail to Seller</h3>
            <p className={`mb-4 ${theme.textMuted}`}>To: {mailTarget.name} ({mailTarget.email})</p>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Subject</label>
              <input
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${
                  darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-gray-800"
                }`}
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium">Message</label>
              <textarea
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                rows={5}
                className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${
                  darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-gray-800"
                }`}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowMailPopup(false)} className="px-3 py-2 rounded-md border hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={sendMail} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}