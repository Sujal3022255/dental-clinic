import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Users, CheckCircle, XCircle, FileText, LogOut, Settings } from 'lucide-react';

export default function DentistDashboard() {
  const { user, signOut } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [activeTab]);

  const loadAppointments = () => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const filtered = allAppointments.filter((apt: any) => {
      if (activeTab === 'pending') return apt.status === 'pending';
      if (activeTab === 'confirmed') return apt.status === 'confirmed';
      if (activeTab === 'completed') return apt.status === 'completed';
      return false;
    });
    filtered.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setAppointments(filtered);
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updated = allAppointments.map((apt: any) =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updated));
    loadAppointments();
  };

  const addTreatmentNotes = () => {
    if (!selectedAppointment || !treatmentNotes) return;

    const treatments = JSON.parse(localStorage.getItem('treatments') || '[]');
    const newTreatment = {
      id: Date.now().toString(),
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      date: new Date().toISOString().split('T')[0],
      dentistName: user?.full_name,
      treatmentType: selectedAppointment.reason,
      description: treatmentNotes,
      notes: treatmentNotes,
      cost: 0,
      status: 'completed'
    };

    treatments.push(newTreatment);
    localStorage.setItem('treatments', JSON.stringify(treatments));
    
    updateAppointmentStatus(selectedAppointment.id, 'completed');
    setSelectedAppointment(null);
    setTreatmentNotes('');
  };

  const stats = {
    pending: JSON.parse(localStorage.getItem('appointments') || '[]').filter((a: any) => a.status === 'pending').length,
    confirmed: JSON.parse(localStorage.getItem('appointments') || '[]').filter((a: any) => a.status === 'confirmed').length,
    completed: JSON.parse(localStorage.getItem('appointments') || '[]').filter((a: any) => a.status === 'completed').length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium">Confirmed</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.confirmed}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.completed}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <Users className="w-8 h-8 text-green-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Confirmed ({stats.confirmed})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {activeTab} appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{appointment.patientName}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {appointment.reason}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {appointment.time}
                        </div>
                      </div>

                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {activeTab === 'confirmed' && (
                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Treatment Notes Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Appointment</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Patient: <strong>{selectedAppointment.patientName}</strong></p>
              <p className="text-sm text-gray-600">Date: <strong>{formatDate(selectedAppointment.date)}</strong></p>
              <p className="text-sm text-gray-600">Reason: <strong>{selectedAppointment.reason}</strong></p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Notes
              </label>
              <textarea
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                rows={6}
                placeholder="Enter treatment details, prescriptions, and follow-up instructions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addTreatmentNotes}
                disabled={!treatmentNotes}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                Save & Complete
              </button>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setTreatmentNotes('');
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
