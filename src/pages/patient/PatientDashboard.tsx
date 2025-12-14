import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, AlertCircle, LogOut, CheckCircle } from 'lucide-react';
import AppointmentBooking from '../../components/AppointmentBooking';
import MyAppointments from '../../components/MyAppointments';
import TreatmentHistory from '../../components/TreatmentHistory';
import DentistSearch from '../../components/DentistSearch';
import EmergencySupport from '../../components/EmergencySupport';
import PatientProfile from '../../components/PatientProfile';

export default function PatientDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'appointments' | 'history' | 'search' | 'emergency' | 'profile'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dental Care Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.full_name}</span>
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
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'book'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Book
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Find Dentist
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'emergency'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Emergency
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Profile
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 mb-2">Upcoming Appointments</p>
                    <p className="text-3xl font-bold">
                      {JSON.parse(localStorage.getItem('appointments') || '[]')
                        .filter((a: any) => a.patientId === user?.id && a.status !== 'cancelled' && a.status !== 'completed').length}
                    </p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-100" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 mb-2">Completed Visits</p>
                    <p className="text-3xl font-bold">
                      {JSON.parse(localStorage.getItem('appointments') || '[]')
                        .filter((a: any) => a.patientId === user?.id && a.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-100" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 mb-2">Member Since</p>
                    <p className="text-lg font-bold">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <User className="w-12 h-12 text-purple-100" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Dental Care Portal</h3>
              <p className="text-gray-600 mb-4">
                You are logged in as a patient. Use the navigation above to:
              </p>
              <ul className="text-gray-600 space-y-2 list-disc list-inside">
                <li>Book new appointments with dentists</li>
                <li>View and manage your existing appointments</li>
                <li>Check your treatment history</li>
                <li>Search for qualified dentists</li>
                <li>Access emergency dental support</li>
                <li>Update your profile and contact information</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'book' && <AppointmentBooking />}
        {activeTab === 'appointments' && <MyAppointments />}
        {activeTab === 'history' && <TreatmentHistory />}
        {activeTab === 'search' && <DentistSearch />}
        {activeTab === 'emergency' && <EmergencySupport />}
        {activeTab === 'profile' && <PatientProfile />}
      </div>
    </div>
  );
}
