import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { dentistService } from '../services/dentistService';
import { appointmentService } from '../services/appointmentService';

interface Dentist {
  id: number;
  userId: number;
  specialization: string;
  licenseNumber: string;
  rating: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function AppointmentBooking() {
  const { user } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDentists, setLoadingDentists] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      setLoadingDentists(true);
      const response = await dentistService.getAll();
      setDentists(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch dentists:', err);
      setError('Failed to load dentists. Please try again.');
    } finally {
      setLoadingDentists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Convert date and time to ISO datetime string
      const dateTimeString = `${appointmentDate}T${appointmentTime}`;
      
      const appointmentData = {
        dentistId: selectedDentist,
        dateTime: dateTimeString,
        duration: 30,
        reason,
        notes: notes || undefined,
      };

      await appointmentService.create(appointmentData);

      setSuccess(true);
      setSelectedDentist('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReason('');
      setNotes('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const selectedDentistData = dentists.find(d => d.id.toString() === selectedDentist);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Appointment booked successfully!</p>
            <p className="text-sm text-green-700 mt-1">You will receive a confirmation once the dentist approves.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="dentist" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Select Dentist
            </label>
            {loadingDentists ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-500">Loading dentists...</p>
              </div>
            ) : dentists.length === 0 ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-yellow-50">
                <p className="text-yellow-800">No dentists available. Please register as a dentist first.</p>
              </div>
            ) : (
              <select
                id="dentist"
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Choose a dentist...</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    Dr. {dentist.user.firstName} {dentist.user.lastName} - {dentist.specialization || 'General Dentistry'}
                  </option>
                ))}
              </select>
            )}
            {selectedDentistData && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Dr. {selectedDentistData.user.firstName} {selectedDentistData.user.lastName}</strong> 
                  {selectedDentistData.specialization && ` specializes in ${selectedDentistData.specialization}`}
                  {selectedDentistData.rating > 0 && ` (Rating: ${selectedDentistData.rating}/5)`}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Appointment Date
              </label>
              <input
                id="date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={minDate}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Appointment Time
              </label>
              <input
                id="time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Reason for Visit
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Select reason...</option>
              <option value="Regular Checkup">Regular Checkup</option>
              <option value="Cleaning">Teeth Cleaning</option>
              <option value="Toothache">Toothache</option>
              <option value="Cavity Filling">Cavity Filling</option>
              <option value="Root Canal">Root Canal</option>
              <option value="Orthodontic Consultation">Orthodontic Consultation</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDentist('');
                setAppointmentDate('');
                setAppointmentTime('');
                setReason('');
                setNotes('');
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
