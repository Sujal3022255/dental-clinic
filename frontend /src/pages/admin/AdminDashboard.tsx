import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import { appointmentService } from '../../services/appointmentService';
import { treatmentService } from '../../services/treatmentService';
import { userService } from '../../services/userService';
import { dentistService } from '../../services/dentistService';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  UserPlus,
  Edit,
  Trash2,
  X,
  Plus,
  Mail,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';

type TabType = 'dashboard' | 'users' | 'patients' | 'dentists' | 'appointments' | 'content';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'patient' | 'dentist' | 'admin';
  createdAt: string;
}

// Helper functions
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const getPatientName = (appointment: any) => {
  if (appointment.patient) {
    return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  }
  return 'Unknown';
};

const getDentistName = (appointment: any) => {
  if (appointment.dentist) {
    return `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;
  }
  return 'Unknown';
};

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'patient' as 'patient' | 'dentist' | 'admin',
    password: '',
    specialization: '',
    licenseNumber: ''
  });

  useEffect(() => {
    loadUsers();
    loadDentists();
  }, []);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('dental_clinic_users') || '[]');
    setUsers(allUsers);
  };

  const loadDentists = async () => {
    try {
      const data = await dentistService.getAll();
      setDentists(data.dentists || []);
    } catch (error: any) {
      console.error('Failed to load dentists:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      setAppointments(data.appointments || []);
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      setError(error.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.full_name || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const [firstName, ...lastNameParts] = formData.full_name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      // Validate dentist-specific fields
      if (formData.role === 'dentist' && !formData.licenseNumber) {
        alert('License number is required for dentists');
        setLoading(false);
        return;
      }

      await userService.create({
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase() as any,
        firstName,
        lastName,
        phone: formData.phone,
        ...(formData.role === 'dentist' && {
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber
        })
      });

      // Still using localStorage for user list since we don't have a user list endpoint yet
      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date().toISOString()
      };

      const allUsers = [...users, newUser];
      localStorage.setItem('dental_clinic_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      
      // Reload data
      if (formData.role === 'dentist') {
        await loadDentists();
      }
      
      setShowAddUserModal(false);
      resetForm();
      alert('User created successfully!');
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map(u =>
      u.id === selectedUser.id ? { ...u, ...formData } : u
    );
    localStorage.setItem('dental_clinic_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowEditUserModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('dental_clinic_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'patient',
      password: '',
      specialization: '',
      licenseNumber: ''
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
    setShowEditUserModal(true);
  };

  const stats = {
    totalUsers: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    dentists: dentists.length, // Use real dentist count from database
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'SCHEDULED').length,
    confirmedAppointments: appointments.filter(a => a.status === 'CONFIRMED').length,
    completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      active: activeTab === 'dashboard',
      onClick: () => setActiveTab('dashboard')
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Patients',
      active: activeTab === 'patients',
      onClick: () => setActiveTab('patients')
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Dentists',
      active: activeTab === 'dentists',
      onClick: () => setActiveTab('dentists')
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Appointments',
      active: activeTab === 'appointments',
      onClick: () => setActiveTab('appointments')
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'All Users',
      active: activeTab === 'users',
      onClick: () => setActiveTab('users')
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Content',
      active: activeTab === 'content',
      onClick: () => setActiveTab('content')
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-[#0b8fac]">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 text-[#0b8fac]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Patients</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.patients}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dentists</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.dentists}</p>
                  </div>
                  <Briefcase className="w-12 h-12 text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Appointments</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalAppointments}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Appointment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completedAppointments}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Appointments</h2>
              <div className="space-y-3">
                {appointments.slice(-5).reverse().map((apt) => {
                  const { date, time } = formatDateTime(apt.dateTime);
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{getPatientName(apt)}</p>
                        <p className="text-sm text-gray-600">
                          {date} at {time} • {apt.reason || 'General checkup'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        apt.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        apt.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-[#0b8fac] text-white px-6 py-3 rounded-lg hover:bg-[#096f85] transition font-semibold flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>

            {/* User Filters */}
            <div className="flex space-x-4 mb-6">
              <button className="px-4 py-2 bg-white border-2 border-[#0b8fac] text-[#0b8fac] rounded-lg font-medium">
                All Users ({stats.totalUsers})
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-[#0b8fac]">
                Patients ({stats.patients})
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-[#0b8fac]">
                Dentists ({stats.dentists})
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#0b8fac] rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'dentist' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-[#0b8fac] hover:text-[#096f85] font-medium"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Add New User</h2>
                    <button onClick={() => setShowAddUserModal(false)}>
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      >
                        <option value="patient">Patient</option>
                        <option value="dentist">Dentist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Dentist-specific fields */}
                    {formData.role === 'dentist' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Specialization <span className="text-gray-500">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            placeholder="e.g., Orthodontics, Endodontics"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            License Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            placeholder="e.g., DDS-2024-105"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                            required
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleAddUser}
                      className="w-full bg-[#0b8fac] text-white py-3 rounded-lg hover:bg-[#096f85] transition font-semibold"
                    >
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {showEditUserModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Edit User</h2>
                    <button onClick={() => setShowEditUserModal(false)}>
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      >
                        <option value="patient">Patient</option>
                        <option value="dentist">Dentist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <button
                      onClick={handleEditUser}
                      className="w-full bg-[#0b8fac] text-white py-3 rounded-lg hover:bg-[#096f85] transition font-semibold"
                    >
                      Update User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'patients':
        return (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
                <p className="text-gray-600 mt-1">Manage all registered patients</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setFormData({ ...formData, role: 'patient' });
                  setShowAddUserModal(true);
                }}
                className="flex items-center space-x-2 bg-[#0b8fac] text-white px-6 py-3 rounded-lg hover:bg-[#096f85] transition"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Patient</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.filter(u => u.role === 'patient').map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#0b8fac] rounded-full flex items-center justify-center text-white font-bold">
                            {patient.full_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {patient.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {patient.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => openEditModal(patient)}
                          className="text-[#0b8fac] hover:text-[#096f85] font-medium"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(patient.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.filter(u => u.role === 'patient').length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No patients registered yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'dentists':
        return (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dentist Management</h1>
                <p className="text-gray-600 mt-1">Manage all registered dentists</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setFormData({ ...formData, role: 'dentist' });
                  setShowAddUserModal(true);
                }}
                className="flex items-center space-x-2 bg-[#0b8fac] text-white px-6 py-3 rounded-lg hover:bg-[#096f85] transition"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Dentist</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dentists.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No dentists registered yet
                      </td>
                    </tr>
                  ) : (
                    dentists.map((dentist) => (
                      <tr key={dentist.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(dentist.firstName || 'D').charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {dentist.firstName} {dentist.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {dentist.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {dentist.user?.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                            {dentist.specialization || 'General Dentistry'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(dentist.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          <button
                            onClick={() => openEditModal({ ...dentist, role: 'dentist' })}
                            className="text-[#0b8fac] hover:text-[#096f85] font-medium"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(dentist.userId)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {users.filter(u => u.role === 'dentist').length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No dentists registered yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dentist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((apt) => {
                    const { date, time } = formatDateTime(apt.dateTime);
                    return (
                      <tr key={apt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getPatientName(apt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getDentistName(apt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.reason || 'General checkup'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            apt.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                            apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'content':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-1">Manage health tips and blog posts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Health Tips</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-1">Brush Twice Daily</h4>
                    <p className="text-sm text-gray-600">Regular brushing prevents cavities and gum disease</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-1">Floss Daily</h4>
                    <p className="text-sm text-gray-600">Flossing removes plaque between teeth</p>
                  </div>
                  <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#0b8fac] hover:text-[#0b8fac] transition">
                    + Add New Tip
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Blog Posts</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-1">Top 10 Dental Care Tips</h4>
                    <p className="text-sm text-gray-600">Published 2 days ago</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-1">Understanding Root Canals</h4>
                    <p className="text-sm text-gray-600">Published 1 week ago</p>
                  </div>
                  <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#0b8fac] hover:text-[#0b8fac] transition">
                    + Add New Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarLayout
      menuItems={menuItems}
      userName={user?.full_name || ''}
      userRole="Admin"
      onLogout={signOut}
    >
      <div className="p-8">
        {renderContent()}
      </div>
    </SidebarLayout>
  );
}
