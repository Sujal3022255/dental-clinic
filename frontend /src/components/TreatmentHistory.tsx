import { useState } from 'react';
import { FileText, Download, Eye, Calendar, User } from 'lucide-react';

interface Treatment {
  id: string;
  date: string;
  dentistName: string;
  treatmentType: string;
  description: string;
  prescription?: string;
  notes: string;
  cost: number;
  status: string;
}

const mockTreatments: Treatment[] = [
  {
    id: '1',
    date: '2024-11-15',
    dentistName: 'Dr. Sarah Johnson',
    treatmentType: 'Routine Cleaning',
    description: 'Professional teeth cleaning and polishing',
    notes: 'Patient showed good oral hygiene. Recommended to continue flossing daily.',
    cost: 120,
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-09-22',
    dentistName: 'Dr. Michael Chen',
    treatmentType: 'Cavity Filling',
    description: 'Composite filling for upper right molar',
    prescription: 'Ibuprofen 400mg as needed for pain',
    notes: 'Cavity filled successfully. Advised to avoid hard foods for 24 hours.',
    cost: 250,
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-07-10',
    dentistName: 'Dr. Sarah Johnson',
    treatmentType: 'Dental X-Ray',
    description: 'Full mouth X-ray examination',
    notes: 'No significant issues detected. Regular checkup recommended in 6 months.',
    cost: 150,
    status: 'completed'
  },
  {
    id: '4',
    date: '2024-05-18',
    dentistName: 'Dr. Robert Wilson',
    treatmentType: 'Wisdom Tooth Extraction',
    description: 'Surgical removal of impacted wisdom tooth',
    prescription: 'Amoxicillin 500mg - 3 times daily for 7 days\nIbuprofen 600mg - as needed for pain',
    notes: 'Extraction completed successfully. Follow-up in 1 week for suture removal.',
    cost: 450,
    status: 'completed'
  }
];

export default function TreatmentHistory() {
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const handleDownload = (treatment: Treatment) => {
    const content = `
TREATMENT REPORT
================

Date: ${new Date(treatment.date).toLocaleDateString()}
Dentist: ${treatment.dentistName}
Treatment Type: ${treatment.treatmentType}

Description:
${treatment.description}

${treatment.prescription ? `Prescription:\n${treatment.prescription}\n` : ''}
Notes:
${treatment.notes}

Cost: $${treatment.cost}
Status: ${treatment.status}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-${treatment.id}-${treatment.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment History</h2>

      {mockTreatments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No treatment history</h3>
          <p className="text-gray-600">Your past treatments will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockTreatments.map((treatment) => (
            <div
              key={treatment.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{treatment.treatmentType}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{formatDate(treatment.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{treatment.dentistName}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Description:</strong> {treatment.description}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Cost: ${treatment.cost}
                      </p>
                    </div>
                  </div>

                  {treatment.prescription && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Prescription:</p>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{treatment.prescription}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <strong>Notes:</strong> {treatment.notes}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedTreatment(treatment)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownload(treatment)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Treatment Detail Modal */}
      {selectedTreatment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTreatment(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTreatment.treatmentType}</h2>
                <p className="text-gray-600">{formatDate(selectedTreatment.date)}</p>
              </div>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dentist</h3>
                <p className="text-gray-600">{selectedTreatment.dentistName}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedTreatment.description}</p>
              </div>

              {selectedTreatment.prescription && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Prescription</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{selectedTreatment.prescription}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Clinical Notes</h3>
                <p className="text-gray-600">{selectedTreatment.notes}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Treatment Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${selectedTreatment.cost}</p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {selectedTreatment.status.charAt(0).toUpperCase() + selectedTreatment.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => handleDownload(selectedTreatment)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Report</span>
              </button>
              <button
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setSelectedTreatment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
