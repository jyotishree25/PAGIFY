import React, { useState } from 'react';

export default function Settings({ onBack, darkMode, setDarkMode }) {
  const [activeSection, setActiveSection] = useState('general');
  const [isHovering, setIsHovering] = useState(null);

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
        sectionBg: "bg-slate-800",
        sidebarBg: "bg-slate-900",
        sidebarText: "text-slate-200",
        sidebarHover: "hover:bg-slate-800/80",
        sidebarActive: "bg-slate-800 text-white",
        inputBg: "bg-slate-800",
        inputBorder: "border-slate-600",
        inputFocus: "focus:border-emerald-500",
        buttonBg: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-500",
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
        sectionBg: "bg-gray-50",
        sidebarBg: "bg-white",
        sidebarText: "text-gray-800",
        sidebarHover: "hover:bg-gray-100",
        sidebarActive: "bg-emerald-600 text-white",
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputFocus: "focus:border-emerald-500",
        buttonBg: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-700",
      };

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'integrations', label: 'Integrations' },
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    
    // Delete login session when security button is clicked
    if (sectionId === 'security') {
      console.log('Deleting login session');
      // Remove the active session
      const activeSessionElement = document.querySelector('.bg-emerald-100');
      if (activeSessionElement) {
        const sessionContainer = activeSessionElement.closest('.p-4');
        if (sessionContainer) {
          sessionContainer.remove();
        }
      }
    }
  };

  const handleBackClick = () => {
    if (onBack) onBack();
    else {
      window.history.pushState({}, "", "/admin/dashboard");
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSaveChanges = () => {
    // Save changes logic would go here
    console.log('Saving changes...');
    // Show a success message or notification
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Admin Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Admin Name</label>
                <input 
                  type="text" 
                  defaultValue="Admin User" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="admin@example.com" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-6">Store Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <input 
                  type="text" 
                  defaultValue="BookHub Store" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input 
                  type="email" 
                  defaultValue="contact@bookhub.com" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-6">Regional Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                  <option value="PST">Pacific Standard Time (PST)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'security':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Password</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input 
                  type="password" 
                  defaultValue="********" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input 
                  type="password" 
                  defaultValue="****************" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
                />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-6">Two-Factor Authentication</h2>
            <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'} mb-8`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Enable Two-Factor Authentication</h3>
                  <p className={`text-sm ${theme.textMuted}`}>Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            
          </>
        );
      case 'notifications':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Email Notifications</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-medium">New Orders</h3>
                  <p className={`text-sm ${theme.textMuted}`}>Receive notifications for new orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-medium">New Reviews</h3>
                  <p className={`text-sm ${theme.textMuted}`}>Receive notifications for new product reviews</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-medium">New Users</h3>
                  <p className={`text-sm ${theme.textMuted}`}>Receive notifications when new users register</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-medium">Low Stock</h3>
                  <p className={`text-sm ${theme.textMuted}`}>Receive notifications when products are low in stock</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            
          </>
        );
      case 'appearance':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Theme Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div 
                className={`p-4 rounded-lg border ${theme.border} cursor-pointer transition-all transform hover:scale-105 ${!darkMode ? 'ring-2 ring-emerald-500' : ''}`}
                onClick={() => setDarkMode(false)}
              >
                <div className="h-24 bg-white rounded mb-2"></div>
                <h3 className="font-medium text-center">Light Mode</h3>
              </div>
              <div 
                className={`p-4 rounded-lg border ${theme.border} cursor-pointer transition-all transform hover:scale-105 ${darkMode ? 'ring-2 ring-emerald-500' : ''}`}
                onClick={() => setDarkMode(true)}
              >
                <div className="h-24 bg-gray-800 rounded mb-2"></div>
                <h3 className="font-medium text-center">Dark Mode</h3>
              </div>
              <div className={`p-4 rounded-lg border ${theme.border} cursor-pointer transition-all transform hover:scale-105`}>
                <div className="h-24 bg-gradient-to-r from-amber-100 to-amber-200 rounded mb-2"></div>
                <h3 className="font-medium text-center">Custom Theme</h3>
              </div>
            </div>

            
          </>
        );
      case 'integrations':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Connected Services</h2>
            <div className="space-y-4 mb-8">
              <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Service</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Connected to Mailchimp</p>
                    </div>
                  </div>
                  <button className={`px-3 py-1 rounded-md border ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}>Configure</button>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Payment Gateway</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Connected to Stripe</p>
                    </div>
                  </div>
                  <button className={`px-3 py-1 rounded-md border ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}>Configure</button>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Calendar</h3>
                      <p className={`text-sm ${theme.textMuted}`}>Not connected</p>
                    </div>
                  </div>
                  <button className={`px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors`}>Connect</button>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-6">API Access</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${theme.border} ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">API Key</h3>
                <div className="flex items-center mb-4">
                  <input 
                    type="password" 
                    value="••••••••••••••••••••••••••••••" 
                    readOnly 
                    className={`flex-1 px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none mr-2`}
                  />
                  <button className={`px-3 py-2 rounded-md ${theme.buttonBg} ${theme.buttonHover} text-white transition-colors`}>Copy</button>
                </div>
                <div className="flex space-x-2">
                  <button className={`px-3 py-2 rounded-md border ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}>Regenerate Key</button>
                  <button className={`px-3 py-2 rounded-md border ${darkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}>API Documentation</button>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen ${theme.sidebarBg} ${theme.sidebarText} p-6 hidden md:block`}>
          <h2 className="text-xl font-bold mb-6">ADMIN</h2>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors transform hover:scale-105 ${activeSection === section.id ? theme.sidebarActive : theme.sidebarHover}`}
                onMouseEnter={() => setIsHovering(section.id)}
                onMouseLeave={() => setIsHovering(null)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <header className="mb-6 flex items-center">
            <button 
              onClick={handleBackClick}
              className={`mr-4 p-2 rounded-lg ${theme.sidebarHover} transition-transform transform hover:scale-110`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.heading}`}>Settings</h1>
          </header>

          <div className="mb-6 md:hidden">
            <select 
              value={activeSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} ${theme.inputBorder} border ${theme.text} focus:outline-none ${theme.inputFocus} focus:ring-2 focus:ring-emerald-500 transition-colors`}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.label}</option>
              ))}
            </select>
          </div>

          <div className={`${theme.cardBg} rounded-xl shadow-md p-6 border ${theme.border}`}>
            {renderContent()}
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSaveChanges}
              className={`px-4 py-2 rounded-lg ${theme.buttonBg} ${theme.buttonHover} text-white font-medium transition-all transform hover:scale-105`}
            >
              Save Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}