import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface Dentist {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  available: boolean;
}

const mockDentists: Dentist[] = [
  { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General Dentistry', experience: 12, available: true },
  { id: '2', name: 'Dr. Michael Chen', specialization: 'Orthodontics', experience: 8, available: true },
  { id: '3', name: 'Dr. Emily Davis', specialization: 'Pediatric Dentistry', experience: 15, available: true },
  { id: '4', name: 'Dr. Robert Wilson', specialization: 'Oral Surgery', experience: 20, available: true },
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function AppointmentBooking() {
  const { user } = useAuth();
  const [selectedDentist, setSelectedDentist] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    setTimeout(() => {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const newAppointment = {
        id: Date.now().toString(),
        patientId: user?.id,
        patientName: user?.full_name,
        dentistId: selectedDentist,
        dentistName: mockDentists.find(d => d.id === selectedDentist)?.name,
        date: appointmentDate,
        time: appointmentTime,
        reason,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      appointments.push(newAppointment);
      localStorage.setItem('appointments', JSON.stringify(appointments));

      setSuccess(true);
      setSelectedDentist('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReason('');
      setNotes('');
      setLoading(false);

      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  const minDate = new Date().toISOString().split('T')[0];
  const selectedDentistData = mockDentists.find(d => d.id === selectedDentist);

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
            <select
              id="dentist"
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Choose a dentist...</option>
              {mockDentists.map((dentist) => (
                <option key={dentist.id} value={dentist.id}>
                  {dentist.name} - {dentist.specialization} ({dentist.experience} years exp.)
                </option>
              ))}
            </select>
            {selectedDentistData && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>{selectedDentistData.name}</strong> specializes in {selectedDentistData.specialization} 
                  with {selectedDentistData.experience} years of experience.
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
              <select
                id="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Select time...</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
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
