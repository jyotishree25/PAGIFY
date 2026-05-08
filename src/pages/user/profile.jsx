import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'female',
    address: '',
    bankAccount: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          gender: userData.gender || 'female',
          address: userData.address || '',
          bankAccount: userData.bankAccount || '',
          ifscCode: userData.ifscCode || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    if (!user) return 0;
    const fields = ['name', 'email', 'phone', 'gender', 'address', 'bankAccount', 'ifscCode', 'profilePicture'];
    let filled = 0;
    fields.forEach(field => {
      if (user[field] && user[field].trim() !== '') filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch('http://localhost:8000/api/v1/users/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setUser(response.data.user);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/v1/users/upload-profile-picture', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.status === 'success') {
        setUser(response.data.user);
        alert('Profile picture updated!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-[Inter]">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
          <button
            onClick={() => window.location.assign('/user/home')}
            className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-sm"
            title="Back to Home"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        
        <div className="px-6 md:px-10 pb-10">
          {/* Top Section: Avatar & Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-8 gap-6">
            
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white h-8 w-8 mb-1" />
                  <span className="text-white text-xs font-semibold">Change</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
              </div>
              {uploading && <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div></div>}
            </div>

            {/* Name & Completion Bar */}
            <div className="flex-1 w-full text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
              <p className="text-gray-500">{user?.email}</p>
              
              {/* Profile Completion Bar */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="text-emerald-600">{completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
                {completion < 100 && (
                  <p className="text-xs text-orange-500 mt-1">Complete your profile to get verified!</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email (Cannot Change)</label>
              <input 
                type="email" 
                value={user?.email} 
                disabled 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter your full address"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              ></textarea>
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Details (Optional)</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Account Number</label>
              <input 
                type="text" 
                name="bankAccount" 
                value={formData.bankAccount} 
                onChange={handleInputChange}
                placeholder="XXXXXXXXXXXX"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
              <input 
                type="text" 
                name="ifscCode" 
                value={formData.ifscCode} 
                onChange={handleInputChange}
                placeholder="ABCD0123456"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button 
                type="submit" 
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition transform hover:scale-105"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;