import { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '../services/appointmentService';
import { dentistService, Dentist } from '../services/dentistService';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AppointmentBookingIntegrated() {
  const { user } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDentists();
    loadAppointments();
  }, []);

  const loadDentists = async () => {
    try {
      const response = await dentistService.getAll();
      setDentists(response.dentists);
    } catch (err: any) {
      console.error('Failed to load dentists:', err);
      setError('Failed to load dentists');
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getAll();
      setAppointments(response.appointments);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await appointmentService.create({
        dentistId: selectedDentist,
        dateTime: new Date(dateTime).toISOString(),
        duration: 30,
        reason: reason,
      });

      setSuccess('Appointment booked successfully!');
      setSelectedDentist('');
      setDateTime('');
      setReason('');
      loadAppointments(); // Reload appointments
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await appointmentService.updateStatus(id, 'CANCELLED');
      setSuccess('Appointment cancelled successfully');
      loadAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Book New Appointment */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book New Appointment</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dentist
            </label>
            <select
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a dentist...</option>
              {dentists.map((dentist) => (
                <option key={dentist.id} value={dentist.id}>
                  Dr. {dentist.firstName} {dentist.lastName}
                  {dentist.specialization && ` - ${dentist.specialization}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe your symptoms or reason for visit..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>

      {/* My Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {user?.role === 'PATIENT' 
                          ? `Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`
                          : `${appointment.patient?.firstName} ${appointment.patient?.lastName}`
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(appointment.dateTime)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.duration} minutes</span>
                    </div>

                    {appointment.reason && (
                      <p className="mt-3 text-sm text-gray-700">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {appointment.status}
                    </span>

                    {appointment.status === 'SCHEDULED' && user?.role === 'PATIENT' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Cancel
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
  );
}
