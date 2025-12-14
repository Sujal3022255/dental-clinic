import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Users, FileText, LogOut } from 'lucide-react';

export default function DentistDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'schedule' | 'profile'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dentist Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Dr. {user?.full_name}</span>
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
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
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
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Professional</p>
                    <p className="text-3xl font-bold text-gray-900">Dr.</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{user?.email}</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="text-base font-semibold text-gray-900">{user?.phone}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Dentist Portal</h3>
              <p className="text-gray-600">
                Manage your appointments, schedule, and patient interactions from this portal.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h2>
            <p className="text-gray-600">All appointments view coming soon...</p>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Schedule</h2>
            <p className="text-gray-600">Schedule management coming soon...</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <p className="text-gray-600">Profile management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
