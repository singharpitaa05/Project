// PROFILE PAGE

// User profile and settings page
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Phone,
    Save,
    Shield,
    User
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    phone: user?.phone || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Handle profile input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordMessage({ type: '', text: '' });
  };

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Digital Footprint Scanner</span>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and security settings</p>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Profile Information
          </h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            {/* Email (Read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Total Scans</div>
                <div className="text-2xl font-bold text-gray-900">{user?.totalScans || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Risk Score</div>
                <div className="text-2xl font-bold text-gray-900">{user?.riskScore || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Change Password
          </h2>

          {passwordMessage.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              passwordMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            {/* Current Password */}
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;