import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, User, X, AlertCircle } from 'lucide-react';

export default function MyAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('appointments')
        .select(`
          *,
          dentist:dentist_profiles(
            id,
            specialization,
            user:profiles!dentist_profiles_user_id_fkey(full_name)
          )
        `)
        .eq('patient_id', profile?.id)
        .order('appointment_date', { ascending: false });

      if (filter === 'upcoming') {
        query = query.gte('appointment_date', today).in('status', ['pending', 'confirmed']);
      } else if (filter === 'past') {
        query = query.or(`appointment_date.lt.${today},status.eq.completed,status.eq.cancelled`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-blue-100 rounded-full p-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {appointment.dentist?.user?.full_name || 'Unknown'}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {appointment.dentist?.specialization || 'General Dentistry'}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>
                    {appointment.reason && (
                      <p className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                    )}
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Cancel appointment"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
