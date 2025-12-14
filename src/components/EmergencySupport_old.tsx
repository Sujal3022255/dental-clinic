import { AlertCircle, Phone, Clock, FileText } from 'lucide-react';

export default function EmergencySupport() {
  const emergencyTips = [
    {
      title: 'Severe Toothache',
      description: 'Rinse mouth with warm water, floss to remove trapped food, apply cold compress outside the cheek.',
      urgency: 'high',
    },
    {
      title: 'Knocked Out Tooth',
      description: 'Handle tooth by crown only, rinse gently if dirty, try to reinsert or keep in milk. Seek immediate care.',
      urgency: 'critical',
    },
    {
      title: 'Broken or Chipped Tooth',
      description: 'Save pieces if possible, rinse mouth with warm water, apply cold compress to reduce swelling.',
      urgency: 'high',
    },
    {
      title: 'Object Stuck Between Teeth',
      description: 'Try to gently remove with dental floss. Do NOT use sharp objects. If unable to remove, contact dentist.',
      urgency: 'medium',
    },
    {
      title: 'Lost Filling or Crown',
      description: 'Keep crown safe, apply dental cement or sugar-free gum to tooth temporarily, schedule appointment soon.',
      urgency: 'medium',
    },
    {
      title: 'Bleeding Gums',
      description: 'Rinse with salt water, apply gauze with gentle pressure for 10 minutes. If bleeding persists, seek care.',
      urgency: 'medium',
    },
    {
      title: 'Abscess or Swelling',
      description: 'Rinse with salt water several times daily. This is serious - contact dentist immediately.',
      urgency: 'critical',
    },
    {
      title: 'Jaw Injury',
      description: 'Apply cold compress, take over-the-counter pain reliever. Seek immediate medical attention.',
      urgency: 'critical',
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Dental Support</h2>
        <p className="text-gray-600">Quick guidance for common dental emergencies</p>
      </div>

      <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="bg-red-500 rounded-full p-3">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">Emergency Contact</h3>
            <p className="text-red-800 mb-4">
              For severe dental emergencies, call our 24/7 emergency line immediately:
            </p>
            <a
              href="tel:1-800-DENTIST"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Call Emergency Line: 1-800-DENTIST
            </a>
            <div className="mt-4 flex items-center space-x-2 text-sm text-red-800">
              <Clock className="w-4 h-4" />
              <span>Available 24 hours a day, 7 days a week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">When to Seek Immediate Care</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Uncontrolled bleeding that won't stop</li>
              <li>• Severe pain not relieved by over-the-counter medication</li>
              <li>• Swelling that affects breathing or swallowing</li>
              <li>• Facial trauma or jaw injury</li>
              <li>• Knocked out permanent tooth</li>
              <li>• Signs of infection with fever</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Common Dental Emergencies
        </h3>
        {emergencyTips.map((tip, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-lg p-6 ${getUrgencyColor(tip.urgency)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900">{tip.title}</h4>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${getUrgencyBadge(
                  tip.urgency
                )}`}
              >
                {tip.urgency.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-700">{tip.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">General Emergency Tips</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• Keep your dentist's emergency contact information readily available</li>
          <li>• Have a dental first aid kit at home with gauze, pain relievers, and cold packs</li>
          <li>• Stay calm and act quickly in dental emergencies</li>
          <li>• Never apply aspirin directly to gums or teeth as it can burn tissue</li>
          <li>• Always follow up with your dentist, even if pain subsides</li>
        </ul>
      </div>
    </div>
  );
}
