import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle, User, Mail, Phone, AlertTriangle, Camera, Upload } from 'lucide-react';

export default function PatientProfile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
      });
      setProfilePicture(user.profile_picture_url || '');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const updates = {
      ...formData,
      ...(profilePicture && { profile_picture_url: profilePicture })
    };

    const { error } = await updateProfile(updates);

    if (error) {
      setError(error.message || 'Failed to update profile');
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }

    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                    {getInitials(formData.full_name || user?.email || 'U')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Photo</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Account Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user?.role || 'Patient'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                  Emergency Contact Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      id="emergency_contact_name"
                      name="emergency_contact_name"
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      placeholder="Name of emergency contact"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      id="emergency_contact_phone"
                      name="emergency_contact_phone"
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
