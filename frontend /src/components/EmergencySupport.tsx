import { Phone, AlertTriangle, Clock, MapPin, Heart } from 'lucide-react';

const emergencyGuides = [
  {
    id: 1,
    title: 'Severe Toothache',
    symptoms: ['Persistent throbbing pain', 'Sensitivity to hot/cold', 'Swelling around tooth'],
    firstAid: [
      'Rinse mouth with warm salt water',
      'Use dental floss to remove any trapped food',
      'Take over-the-counter pain reliever (follow dosage)',
      'Apply cold compress to outside of cheek',
      'Do NOT place aspirin directly on tooth or gums'
    ],
    urgency: 'high'
  },
  {
    id: 2,
    title: 'Knocked-Out Tooth',
    symptoms: ['Tooth completely removed from socket', 'Bleeding from socket'],
    firstAid: [
      'Handle tooth by crown (top), not root',
      'Gently rinse tooth with water if dirty (do not scrub)',
      'Try to reinsert tooth into socket if possible',
      'If cannot reinsert, keep tooth moist in milk or saliva',
      'See dentist immediately (within 30 minutes for best results)'
    ],
    urgency: 'critical'
  },
  {
    id: 3,
    title: 'Broken or Chipped Tooth',
    symptoms: ['Visible crack or chip', 'Sharp edge', 'Pain when chewing'],
    firstAid: [
      'Rinse mouth with warm water',
      'Save any broken pieces if possible',
      'Apply gauze if bleeding (10-15 minutes)',
      'Use cold compress for swelling',
      'Cover sharp edge with dental wax or sugarless gum'
    ],
    urgency: 'medium'
  },
  {
    id: 4,
    title: 'Bleeding Gums',
    symptoms: ['Persistent bleeding', 'Swollen or red gums', 'Pain in gums'],
    firstAid: [
      'Rinse with warm salt water',
      'Apply gentle pressure with clean gauze',
      'Use cold compress to reduce swelling',
      'Avoid hot foods and drinks',
      'Do not take aspirin (may increase bleeding)'
    ],
    urgency: 'medium'
  },
  {
    id: 5,
    title: 'Lost Filling or Crown',
    symptoms: ['Exposed tooth interior', 'Sensitivity', 'Rough or sharp edges'],
    firstAid: [
      'Keep the crown if found',
      'Clean crown and tooth gently',
      'Temporary reattachment with dental cement or toothpaste',
      'Avoid chewing on that side',
      'Schedule dentist appointment within 24-48 hours'
    ],
    urgency: 'low'
  },
  {
    id: 6,
    title: 'Abscess or Swelling',
    symptoms: ['Painful swelling', 'Fever', 'Bad taste in mouth', 'Difficulty swallowing'],
    firstAid: [
      'Rinse with warm salt water several times',
      'Take over-the-counter pain reliever',
      'Do NOT pop or drain the abscess',
      'See dentist immediately',
      'May require antibiotics'
    ],
    urgency: 'high'
  }
];

export default function EmergencySupport() {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'IMMEDIATE ATTENTION REQUIRED';
      case 'high':
        return 'Seek Care Within Hours';
      case 'medium':
        return 'Seek Care Within 24 Hours';
      case 'low':
        return 'Schedule Appointment Soon';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">Dental Emergency?</h3>
            <p className="text-red-800 mb-4">
              If you're experiencing a severe dental emergency, please call our emergency hotline immediately.
            </p>
            <button className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium">
              <Phone className="w-5 h-5" />
              <span>Call Emergency Line: (555) 911-DENT</span>
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Care Guide</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {emergencyGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{guide.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(guide.urgency)}`}>
                {getUrgencyLabel(guide.urgency)}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Symptoms:</h4>
              <ul className="space-y-1">
                {guide.symptoms.map((symptom, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">First Aid Steps:</h4>
              <ol className="space-y-2">
                {guide.firstAid.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2 font-semibold text-blue-600">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">24/7 Emergency Line</h3>
          <p className="text-gray-600 mb-4">Call anytime for urgent dental issues</p>
          <p className="text-2xl font-bold text-blue-600">(555) 911-DENT</p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">After-Hours Care</h3>
          <p className="text-gray-600 mb-4">Emergency services available</p>
          <p className="text-sm text-gray-700">Mon-Sun: Open 24 Hours</p>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Emergency Location</h3>
          <p className="text-gray-600 mb-4">Visit our emergency clinic</p>
          <p className="text-sm text-gray-700">123 Emergency Blvd, Suite 100</p>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start">
          <Heart className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Prevention Tips</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Wear a mouthguard during contact sports</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Avoid chewing ice, hard candy, or other hard objects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Don't use teeth as tools to open packages</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Maintain good oral hygiene to prevent infections</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Visit your dentist regularly for checkups</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
