import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import { appointmentService } from '../../services/appointmentService';
import { treatmentService } from '../../services/treatmentService';
import { dentistService } from '../../services/dentistService';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Search,
  User,
  Phone,
  Mail,
  Download,
  Plus,
  X,
  Bell
} from 'lucide-react';

type TabType = 'dashboard' | 'appointments' | 'history' | 'profile' | 'emergency' | 'search';

// Helper functions to format API data
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const getDentistName = (appointment: any) => {
  if (appointment.dentist) {
    return `${appointment.dentist.firstName} ${appointment.dentist.lastName}`;
  }
  return 'Unknown';
};

export default function PatientDashboard() {
  const { user, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
  });

  const [bookingData, setBookingData] = useState({
    dentistId: '',
    date: '',
    time: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load appointments from API
      const appointmentsData = await appointmentService.getAll();
      setAppointments(appointmentsData.appointments || []);

      // Load treatments from API
      const treatmentsData = await treatmentService.getAll();
      setTreatments(treatmentsData.treatments || []);

      // Load dentists from API
      const dentistsData = await dentistService.getAll();
      setDentists(dentistsData.dentists || []);

      // Set notifications for upcoming appointments
      const upcoming = (appointmentsData.appointments || []).filter((apt: any) => {
        const aptDate = new Date(apt.dateTime);
        const today = new Date();
        const diff = aptDate.getTime() - today.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 7 && apt.status !== 'CANCELLED';
      });
      setNotifications(upcoming);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(error.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!bookingData.dentistId || !bookingData.date || !bookingData.time || !bookingData.reason) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Combine date and time
      const dateTime = new Date(`${bookingData.date}T${bookingData.time}`);

      await appointmentService.create({
        dentistId: bookingData.dentistId,
        dateTime: dateTime.toISOString(),
        duration: 30,
        reason: bookingData.reason,
      });

      setShowBooking(false);
      setBookingData({ dentistId: '', date: '', time: '', reason: '' });
      
      // Reload appointments
      await loadData();
      alert('Appointment booked successfully!');
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      alert(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      await appointmentService.updateStatus(id, 'CANCELLED');
      await loadData();
      alert('Appointment cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel appointment:', error);
      alert(error.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    const { error } = await updateProfile(profileData);
    if (!error) {
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
    }
  };

  const downloadHistory = () => {
    const data = {
      patient: user?.full_name,
      email: user?.email,
      appointments: appointments,
      treatments: treatments
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental-history-${user?.full_name}.json`;
    a.click();
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      active: activeTab === 'dashboard',
      onClick: () => setActiveTab('dashboard')
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Appointments',
      active: activeTab === 'appointments',
      onClick: () => setActiveTab('appointments')
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Treatment History',
      active: activeTab === 'history',
      onClick: () => setActiveTab('history')
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Find Dentist',
      active: activeTab === 'search',
      onClick: () => setActiveTab('search')
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: 'Emergency Support',
      active: activeTab === 'emergency',
      onClick: () => setActiveTab('emergency')
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'My Profile',
      active: activeTab === 'profile',
      onClick: () => setActiveTab('profile')
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
            </div>

            {notifications.length > 0 && (
              <div className="mb-6 bg-[#0b8fac] bg-opacity-10 border border-[#0b8fac] rounded-lg p-4">
                <div className="flex items-start">
                  <Bell className="w-5 h-5 text-[#0b8fac] mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Upcoming Appointments</h3>
                    {notifications.map((apt) => {
                      const { date, time } = formatDateTime(apt.dateTime);
                      return (
                        <p key={apt.id} className="text-sm text-gray-700">
                          {date} at {time} with Dr. {getDentistName(apt)}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-[#0b8fac]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {appointments.filter(a => new Date(a.dateTime) >= new Date() && a.status !== 'CANCELLED').length}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Treatments</p>
                    <p className="text-3xl font-bold text-gray-900">{treatments.length}</p>
                  </div>
                  <FileText className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Appointments</h2>
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => {
                  const { date, time } = formatDateTime(apt.dateTime);
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.reason || 'General Checkup'}</p>
                        <p className="text-sm text-gray-600">Dr. {getDentistName(apt)} • {date} at {time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

      case 'appointments':
        return (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <button
                onClick={() => setShowBooking(true)}
                className="flex items-center space-x-2 bg-[#0b8fac] text-white px-6 py-3 rounded-lg hover:bg-[#096f85] transition"
              >
                <Plus className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dentist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>{
                    const { date, time } = formatDateTime(apt.dateTime);
                    return (
                      <tr key={apt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. {getDentistName(apt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.reason || 'General Checkup'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            apt.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                            apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => cancelAppointment(apt.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }     )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Book Appointment</h2>
                    <button onClick={() => setShowBooking(false)}>
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Dentist</label>
                      <select
                        value={bookingData.dentistId}
                        onChange={(e) => setBookingData({ ...bookingData, dentistId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      >
                        <option value="">Choose a dentist</option>
                        {dentists.map((d) => (
                          <option key={d.id} value={d.id}>
                            Dr. {d.firstName} {d.lastName} {d.specialization && `- ${d.specialization}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                      <textarea
                        value={bookingData.reason}
                        onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                        rows={3}
                        placeholder="e.g., Regular checkup, tooth pain..."
                      />
                    </div>

                    <button
                      onClick={handleBookAppointment}
                      className="w-full bg-[#0b8fac] text-white py-3 rounded-lg hover:bg-[#096f85] transition font-semibold"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            )}disabled={loading}
                      className="w-full bg-[#0b8fac] text-white py-3 rounded-lg hover:bg-[#096f85] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Booking...' : 'Book Appointment'}

      case 'history':
        return (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Treatment History</h1>
              <button
                onClick={downloadHistory}
                className="flex items-center space-x-2 bg-[#0b8fac] text-white px-6 py-3 rounded-lg hover:bg-[#096f85] transition"
              >
                <Download className="w-5 h-5" />
                <span>Download History</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {treatments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No treatment history available</p>
              ) : (
                <div className="space-y-4">
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{treatment.treatmentType}</h3>
                        <span className="text-sm text-gray-500">{treatment.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Dr. {treatment.dentistName}</p>
                      <p className="text-sm text-gray-700">{treatment.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'search':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Dentist</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dentists.map((dentist) => (
                <div key={dentist.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-[#0b8fac] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {dentist.full_name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-gray-900">Dr. {dentist.full_name}</h3>
                      <p className="text-sm text-gray-600">Dentist</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {dentist.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {dentist.phone}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setBookingData({ ...bookingData, dentistId: dentist.id });
                      setActiveTab('appointments');
                      setShowBooking(true);
                    }}
                    className="w-full bg-[#0b8fac] text-white py-2 rounded-lg hover:bg-[#096f85] transition"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Emergency Support</h1>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-red-900 mb-2">Emergency Hotline</h2>
                  <p className="text-red-800 mb-4">For dental emergencies, call immediately:</p>
                  <a
                    href="tel:911"
                    className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Emergency: 911
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Severe Toothache',
                  steps: ['Rinse mouth with warm water', 'Use dental floss to remove trapped food', 'Take over-the-counter pain reliever', 'Apply cold compress outside', 'See dentist ASAP']
                },
                {
                  title: 'Knocked Out Tooth',
                  steps: ['Find the tooth', 'Hold by crown, not root', 'Rinse gently if dirty', 'Try to reinsert in socket', 'Keep moist in milk', 'See dentist within 30 minutes']
                },
                {
                  title: 'Broken Tooth',
                  steps: ['Rinse mouth with warm water', 'Save any pieces', 'Apply gauze if bleeding', 'Use cold compress for swelling', 'See dentist immediately']
                },
                {
                  title: 'Bleeding Gums',
                  steps: ['Rinse with salt water', 'Apply gentle pressure with gauze', 'Use cold compress', 'Avoid aspirin', 'See dentist if persists']
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {item.steps.map((step, i) => (
                      <li key={i} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={profileData.emergency_contact_name}
                        onChange={(e) => setProfileData({ ...profileData, emergency_contact_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                        placeholder="Emergency contact name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={profileData.emergency_contact_phone}
                        onChange={(e) => setProfileData({ ...profileData, emergency_contact_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProfileUpdate}
                  className="w-full bg-[#0b8fac] text-white py-3 rounded-lg hover:bg-[#096f85] transition font-semibold"
                >
                  Update Profile
                </button>
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
      userRole="Patient"
      onLogout={signOut}
    >
      <div className="p-8">
        {renderContent()}
      </div>
    </SidebarLayout>
  );
}
