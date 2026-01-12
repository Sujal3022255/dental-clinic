import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Edit2,
  X,
  Check
} from 'lucide-react';

export default function AdminProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    department: 'Administration',
    position: 'System Administrator',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, [user]);

  const loadAdminProfile = () => {
    if (!user) return;
    
    // Load admin profile data from localStorage or API
    const savedProfile = localStorage.getItem(`admin_profile_${user.id}`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(prev => ({
        ...prev,
        ...parsed,
        email: user.email // Always use the latest email from user
      }));
    } else {
      // Set default values from user
      setProfileData(prev => ({
        ...prev,
        fullName: user.email.split('@')[0], // Use email prefix as default name
        email: user.email
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate
      if (!profileData.fullName || !profileData.email) {
        setError('Full name and email are required');
        return;
      }

      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem(`admin_profile_${user?.id}`, JSON.stringify(profileData));

      // Update the user's full_name in the auth context if needed
      // This would typically be done through an API call
      const allUsers = JSON.parse(localStorage.getItem('dental_clinic_users') || '[]');
      const updatedUsers = allUsers.map((u: any) => 
        u.id === user?.id 
          ? { ...u, full_name: profileData.fullName, phone: profileData.phone }
          : u
      );
      localStorage.setItem('dental_clinic_users', JSON.stringify(updatedUsers));

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('All password fields are required');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // In a real app, this would be an API call
      // For now, we'll just simulate it
      localStorage.setItem(`admin_password_${user?.id}`, passwordData.newPassword);

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    loadAdminProfile();
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      active: false,
      onClick: () => navigate('/admin/dashboard')
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Users',
      active: false,
      onClick: () => navigate('/admin/dashboard')
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Appointments',
      active: false,
      onClick: () => navigate('/admin/dashboard')
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Content',
      active: false,
      onClick: () => navigate('/admin/dashboard')
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Profile',
      active: true,
      onClick: () => {}
    }
  ];

  return (
    <SidebarLayout
      menuItems={menuItems}
      userName={profileData.fullName || user?.email || 'Admin'}
      userRole="Administrator"
      onLogout={signOut}
    >
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your administrator account</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <X className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mb-6">
          <div className="flex items-center justify-between mb-8 pb-6 border-b">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profileData.fullName?.charAt(0) || 'A'}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.fullName || 'Admin User'}
                </h2>
                <p className="text-gray-600 mt-1">{profileData.position}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Administrator
                </span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profileData.fullName || 'Not set'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profileData.email || 'Not set'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profileData.phone || 'Not set'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              {isEditing ? (
                <select
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Administration">Administration</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profileData.department}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.position}
                  onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter position"
                />
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profileData.position}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <p className="text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 2026'}
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write a brief bio about yourself..."
                />
              ) : (
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 min-h-[100px]">
                  <p className="text-gray-900">{profileData.bio || 'No bio available'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons for Edit Mode */}
          {isEditing && (
            <div className="flex gap-4 mt-8 pt-6 border-t">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </h3>
              <p className="text-gray-600 text-sm mt-1">Manage your password and security preferences</p>
            </div>
            {!showPasswordSection && (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordSection && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showPasswordSection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed: Recently</p>
                </div>
                <div className="text-gray-400">••••••••</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  Not Enabled
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
