import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Calendar, Activity, TrendingUp, LogOut, UserPlus, Edit2, Trash2, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'appointments' | 'content'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'patient',
    password: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = JSON.parse(localStorage.getItem('dental_clinic_users') || '[]');
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    setUsers(allUsers);
    setAppointments(allAppointments);
  };

  const stats = {
    totalUsers: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    dentists: users.filter(u => u.role === 'dentist').length,
    totalAppointments: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const handleSaveUser = () => {
    const allUsers = JSON.parse(localStorage.getItem('dental_clinic_users') || '[]');
    
    if (editingUser) {
      const updated = allUsers.map((u: any) =>
        u.id === editingUser.id ? { ...u, ...userForm, updated_at: new Date().toISOString() } : u
      );
      localStorage.setItem('dental_clinic_users', JSON.stringify(updated));
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...userForm,
        _password: btoa(userForm.password),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      allUsers.push(newUser);
      localStorage.setItem('dental_clinic_users', JSON.stringify(allUsers));
    }

    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ full_name: '', email: '', phone: '', role: 'patient', password: '' });
    loadData();
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const allUsers = JSON.parse(localStorage.getItem('dental_clinic_users') || '[]');
    const updated = allUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('dental_clinic_users', JSON.stringify(updated));
    loadData();
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ''
    });
    setShowUserModal(true);
  };

  const getRecentActivity = () => {
    const recent = [...appointments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    return recent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Admin: {user?.full_name}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Content
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Patients</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.patients}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Dentists</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.dentists}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Activity className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Appointments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAppointments}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-bold text-yellow-600">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Confirmed</span>
                    <span className="font-bold text-blue-600">{stats.confirmed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-green-600">{stats.completed}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {getRecentActivity().map((activity, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <p className="text-gray-600">
                        <strong>{activity.patientName}</strong> booked with {activity.dentistName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ full_name: '', email: '', phone: '', role: 'patient', password: '' });
                  setShowUserModal(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Phone</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Role</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{user.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'dentist' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditUser(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{apt.patientName}</p>
                      <p className="text-sm text-gray-600">with {apt.dentistName}</p>
                      <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h2>
            <p className="text-gray-600">Manage dental health tips, blogs, and educational content.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <FileText className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Health Tips</h3>
                <p className="text-sm text-gray-600 mb-4">Create and manage dental health tips for patients</p>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Manage Tips →
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <FileText className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Blog Posts</h3>
                <p className="text-sm text-gray-600 mb-4">Write and publish blog articles</p>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                  Manage Posts →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="patient">Patient</option>
                  <option value="dentist">Dentist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
