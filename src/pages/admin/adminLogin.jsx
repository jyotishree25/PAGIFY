import React, { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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
        inputBorder: "border-slate-600",
        inputFocus: "focus:border-emerald-500",
        buttonBg: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-500",
        linkColor: "text-emerald-400",
        linkHover: "hover:text-emerald-300"
      }
    : {
        bg: "bg-amber-50",
        text: "text-gray-800",
        cardBg: "bg-white",
        border: "border-gray-200",
        headerText: "text-gray-900",
        heading: "text-gray-900",
        textStrong: "text-gray-900",
        textMuted: "text-gray-600",
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputFocus: "focus:border-emerald-500",
        buttonBg: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-700",
        linkColor: "text-emerald-600",
        linkHover: "hover:text-emerald-700"
      };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle authentication
    console.log('Admin login attempt with:', { email, password });
    // For demo purposes, navigate to admin dashboard
    window.history.pushState({}, "", "/admin/dashboard");
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} ${theme.text} p-4`}>
      <div 
        className={`w-full max-w-md ${theme.cardBg} rounded-xl shadow-xl border ${theme.border} p-8 transition-all duration-300 transform ${isHovering ? 'scale-105' : 'scale-100'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-extrabold ${theme.heading} mb-2`}>Admin Portal</h1>
          <p className={theme.textMuted}>Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${theme.textStrong} mb-1`}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className={`block text-sm font-medium ${theme.textStrong}`}>Password</label>
              <button type="button" className={`text-sm ${theme.linkColor} ${theme.linkHover}`}>Forgot password?</button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full ${theme.buttonBg} ${theme.buttonHover} text-white font-medium py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-end">
          <a href="/" className={`text-sm ${theme.linkColor} ${theme.linkHover}`}>Return to Homepage</a>
        </div>
      </div>
    </div>
  );
}