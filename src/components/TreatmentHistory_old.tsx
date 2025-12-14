import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, User, FileText, Download } from 'lucide-react';

export default function TreatmentHistory() {
  const { profile } = useAuth();
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatmentHistory();
  }, []);

  const loadTreatmentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_history')
        .select(`
          *,
          dentist:dentist_profiles(
            id,
            user:profiles!dentist_profiles_user_id_fkey(full_name)
          ),
          appointment:appointments(appointment_date, appointment_time)
        `)
        .eq('patient_id', profile?.id)
        .order('treatment_date', { ascending: false });

      if (error) throw error;
      setTreatments(data || []);
    } catch (error) {
      console.error('Error loading treatment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (treatmentId: string) => {
    const treatment = treatments.find((t) => t.id === treatmentId);
    if (!treatment) return;

    const content = `
DENTAL TREATMENT RECORD
========================

Patient: ${profile?.full_name}
Treatment Date: ${new Date(treatment.treatment_date).toLocaleDateString()}
Dentist: Dr. ${treatment.dentist?.user?.full_name}

TREATMENT DESCRIPTION:
${treatment.treatment_description}

PRESCRIPTION:
${treatment.prescription || 'None'}

NOTES:
${treatment.notes || 'No additional notes'}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `treatment_${treatmentId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment History</h2>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Loading treatment history...</p>
        </div>
      ) : treatments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No treatment history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {treatment.treatment_description.substring(0, 50)}
                      {treatment.treatment_description.length > 50 ? '...' : ''}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(treatment.treatment_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Dr. {treatment.dentist?.user?.full_name}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadPDF(treatment.id)}
                  className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Download as text"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Treatment:</span> {treatment.treatment_description}
                </p>
              </div>

              {treatment.prescription && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Prescription:</span> {treatment.prescription}
                  </p>
                </div>
              )}

              {treatment.notes && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {treatment.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
