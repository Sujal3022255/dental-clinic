import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import { appointmentService } from '../../services/appointmentService';
import { treatmentService } from '../../services/treatmentService';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'appointments' | 'schedule' | 'patients';

interface Availability {
  day: string;
  enabled: boolean;
  slots: string[];
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

export default function DentistDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Schedule state
  const [availability, setAvailability] = useState<Availability[]>([
    { day: 'Monday', enabled: true, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
    { day: 'Tuesday', enabled: true, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
    { day: 'Wednesday', enabled: true, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
    { day: 'Thursday', enabled: true, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
    { day: 'Friday', enabled: true, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
    { day: 'Saturday', enabled: false, slots: [] },
    { day: 'Sunday', enabled: false, slots: [] }
  ]);

  useEffect(() => {
    loadAppointments();
    loadAvailability();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await appointmentService.getAll();
      const sortedAppointments = (data.appointments || []).sort(
        (a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
      setAppointments(sortedAppointments);
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      setError(error.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = () => {
    const saved = localStorage.getItem(`dentist_schedule_${user?.id}`);
    if (saved) {
      setAvailability(JSON.parse(saved));
    }
  };

  const saveAvailability = () => {
    localStorage.setItem(`dentist_schedule_${user?.id}`, JSON.stringify(availability));
    alert('Schedule updated successfully!');
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setLoading(true);
      await appointmentService.updateStatus(appointmentId, newStatus);
      await loadAppointments();
      alert('Appointment status updated successfully');
    } catch (error: any) {
      console.error('Failed to update appointment:', error);
      alert(error.response?.data?.error || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  const addTreatmentNotes = async () => {
    if (!selectedAppointment || !treatmentNotes) return;

    try {
      setLoading(true);
      await treatmentService.create({
        appointmentId: selectedAppointment.id,
        diagnosis: selectedAppointment.reason || 'General checkup',
        procedure: selectedAppointment.reason || 'General checkup',
        notes: treatmentNotes,
      });
      
      setShowNotesModal(false);
      setSelectedAppointment(null);
      setTreatmentNotes('');
      await loadAppointments();
      alert('Treatment notes added successfully');
    } catch (error: any) {
      console.error('Failed to add treatment notes:', error);
      alert(error.response?.data?.error || 'Failed to add treatment notes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    try {
      setLoading(true);
      await appointmentService.approve(appointmentId);
      await loadAppointments();
      alert('Appointment approved successfully');
    } catch (error: any) {
      console.error('Failed to approve appointment:', error);
      alert(error.response?.data?.error || 'Failed to approve appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (appointmentId: string) => {
    const reason = prompt('Reason for rejecting (optional):');
    if (reason === null) return; // User cancelled

    try {
      setLoading(true);
      await appointmentService.reject(appointmentId, reason || undefined);
      await loadAppointments();
      alert('Appointment rejected');
    } catch (error: any) {
      console.error('Failed to reject appointment:', error);
      alert(error.response?.data?.error || 'Failed to reject appointment');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pending: appointments.filter(a => a.status === 'PENDING').length,
    scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    today: appointments.filter(a => {
      const aptDate = new Date(a.dateTime).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return aptDate === today;
    }).length
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
      icon: <Clock className="w-5 h-5" />,
      label: 'Schedule',
      active: activeTab === 'schedule',
      onClick: () => setActiveTab('schedule')
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Patients',
      active: activeTab === 'patients',
      onClick: () => setActiveTab('patients')
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. {user?.full_name}</h1>
              <p className="text-gray-600 mt-1">Here's your practice overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today's Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-[#0b8fac]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
              <div className="space-y-3">
                {appointments
                  .filter(apt => {
                    const aptDate = new Date(apt.dateTime).toISOString().split('T')[0];
                    const today = new Date().toISOString().split('T')[0];
                    return aptDate === today;
                  })
                  .map((apt) => {
                    const { time } = formatDateTime(apt.dateTime);
                    const patientName = getPatientName(apt);
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#0b8fac] rounded-full flex items-center justify-center text-white font-bold">
                            {patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patientName}</p>
                            <p className="text-sm text-gray-600">{time} • {apt.reason || 'General checkup'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${                          apt.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          apt.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {apt.status.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                {appointments.filter(apt => {
                  const aptDate = new Date(apt.dateTime).toISOString().split('T')[0];
                  const today = new Date().toISOString().split('T')[0];
                  return aptDate === today;
                }).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No appointments scheduled for today</p>
                )}
              </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((apt) => {
                    const { date, time } = formatDateTime(apt.dateTime);
                    const patientName = getPatientName(apt);
                    return (
                      <tr key={apt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#0b8fac] rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {patientName.charAt(0)}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{patientName}</div>
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {apt.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(apt.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium"
                                  disabled={loading}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(apt.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium"
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {apt.status === 'SCHEDULED' && (
                              <>
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                                  className="text-green-600 hover:text-green-900 font-medium"
                                  disabled={loading}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'CANCELLED')}
                                  className="text-red-600 hover:text-red-900 font-medium"
                                  disabled={loading}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {apt.status === 'CONFIRMED' && (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setShowNotesModal(true);
                                }}
                                className="text-[#0b8fac] hover:text-[#096f85] font-medium"
                              >
                                Add Notes
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Treatment Notes Modal */}
            {showNotesModal && selectedAppointment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Add Treatment Notes</h2>
                    <button onClick={() => setShowNotesModal(false)}>
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Patient: <span className="font-semibold text-gray-900">{selectedAppointment.patientName}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: <span className="font-semibold text-gray-900">{selectedAppointment.date}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Reason: <span className="font-semibold text-gray-900">{selectedAppointment.reason}</span>
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Notes</label>
                    <textarea
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b8fac] focus:border-transparent"
                      rows={6}
                      placeholder="Enter detailed treatment notes, diagnosis, and recommendations..."
                    />
                  </div>

                  <button
                    onClick={addTreatmentNotes}
                    className="w-full bg-[#0b8fac] text-white py-3 rounded-lg hover:bg-[#096f85] transition font-semibold"
                  >
                    Save & Complete Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Manage Schedule</h1>
              <button
                onClick={saveAvailability}
                className="bg-[#0b8fac] text-white px-6 py-3 rounded-lg hover:bg-[#096f85] transition font-semibold"
              >
                Save Schedule
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Set Your Availability</h2>
              
              <div className="space-y-4">
                {availability.map((day, index) => (
                  <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) => {
                            const newAvailability = [...availability];
                            newAvailability[index].enabled = e.target.checked;
                            setAvailability(newAvailability);
                          }}
                          className="w-5 h-5 text-[#0b8fac] rounded focus:ring-[#0b8fac]"
                        />
                        <span className="text-lg font-semibold text-gray-900">{day.day}</span>
                      </div>
                    </div>
                    
                    {day.enabled && (
                      <div className="ml-8 flex flex-wrap gap-2">
                        {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map((slot) => (
                          <button
                            key={slot}
                            onClick={() => {
                              const newAvailability = [...availability];
                              const slotIndex = newAvailability[index].slots.indexOf(slot);
                              if (slotIndex > -1) {
                                newAvailability[index].slots.splice(slotIndex, 1);
                              } else {
                                newAvailability[index].slots.push(slot);
                              }
                              setAvailability(newAvailability);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              day.slots.includes(slot)
                                ? 'bg-[#0b8fac] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'patients':
        const uniquePatients = Array.from(
          new Map(appointments.map(apt => [apt.patientId, apt])).values()
        );

        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniquePatients.map((apt) => {
                const patientAppointments = appointments.filter(a => a.patientId === apt.patientId);
                const treatments = JSON.parse(localStorage.getItem('treatments') || '[]')
                  .filter((t: any) => t.patientId === apt.patientId);

                return (
                  <div key={apt.patientId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-[#0b8fac] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900">{apt.patientName}</h3>
                        <p className="text-sm text-gray-600">Patient</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Appointments:</span>
                        <span className="font-semibold text-gray-900">{patientAppointments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Treatments:</span>
                        <span className="font-semibold text-gray-900">{treatments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Visit:</span>
                        <span className="font-semibold text-gray-900">
                          {patientAppointments[patientAppointments.length - 1]?.date || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      userRole="Dentist"
      onLogout={signOut}
    >
      <div className="p-8">
        {renderContent()}
      </div>
    </SidebarLayout>
  );
}
