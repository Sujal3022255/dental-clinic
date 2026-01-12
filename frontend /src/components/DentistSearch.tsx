import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Clock, Phone, Mail } from 'lucide-react';

interface Dentist {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  phone: string;
  email: string;
  available: boolean;
  bio: string;
  education: string;
}

const mockDentists: Dentist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'General Dentistry',
    experience: 12,
    rating: 4.8,
    reviews: 156,
    location: 'Downtown Clinic, Main Street',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@dentalcare.com',
    available: true,
    bio: 'Specializes in preventive care and cosmetic dentistry with a gentle approach.',
    education: 'DDS, Harvard School of Dental Medicine'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Orthodontics',
    experience: 8,
    rating: 4.9,
    reviews: 203,
    location: 'Smile Center, Oak Avenue',
    phone: '(555) 234-5678',
    email: 'm.chen@dentalcare.com',
    available: true,
    bio: 'Expert in braces and Invisalign treatments for all ages.',
    education: 'DMD, University of Pennsylvania'
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    specialization: 'Pediatric Dentistry',
    experience: 15,
    rating: 4.9,
    reviews: 287,
    location: 'Kids Dental Care, Park Road',
    phone: '(555) 345-6789',
    email: 'emily.davis@dentalcare.com',
    available: true,
    bio: 'Patient and caring approach to children\'s dental health.',
    education: 'DDS, Columbia University'
  },
  {
    id: '4',
    name: 'Dr. Robert Wilson',
    specialization: 'Oral Surgery',
    experience: 20,
    rating: 4.7,
    reviews: 178,
    location: 'Advanced Dental Surgery, Medical Plaza',
    phone: '(555) 456-7890',
    email: 'r.wilson@dentalcare.com',
    available: true,
    bio: 'Specialized in complex extractions and dental implants.',
    education: 'DDS, MD, Stanford University'
  },
  {
    id: '5',
    name: 'Dr. Lisa Martinez',
    specialization: 'Cosmetic Dentistry',
    experience: 10,
    rating: 4.8,
    reviews: 198,
    location: 'Aesthetic Dentistry, Plaza Center',
    phone: '(555) 567-8901',
    email: 'l.martinez@dentalcare.com',
    available: false,
    bio: 'Transform your smile with veneers, whitening, and smile makeovers.',
    education: 'DDS, UCLA School of Dentistry'
  }
];

export default function DentistSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [dentists, setDentists] = useState(mockDentists);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);

  useEffect(() => {
    filterDentists();
  }, [searchTerm, specializationFilter, minExperience]);

  const filterDentists = () => {
    let filtered = mockDentists;

    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specializationFilter) {
      filtered = filtered.filter(d => d.specialization === specializationFilter);
    }

    if (minExperience > 0) {
      filtered = filtered.filter(d => d.experience >= minExperience);
    }

    setDentists(filtered);
  };

  const specializations = Array.from(new Set(mockDentists.map(d => d.specialization)));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Find a Dentist</h2>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dentists..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Experience
            </label>
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Any Experience</option>
              <option value={5}>5+ years</option>
              <option value={10}>10+ years</option>
              <option value={15}>15+ years</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setSpecializationFilter('');
            setMinExperience(0);
          }}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dentists.map((dentist) => (
          <div
            key={dentist.id}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedDentist(dentist)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{dentist.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{dentist.specialization}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">{dentist.rating}</span>
                <span className="text-sm text-gray-500">({dentist.reviews})</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{dentist.experience} years experience</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>{dentist.location}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{dentist.bio}</p>

            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dentist.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {dentist.available ? 'Available' : 'Not Available'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDentist(dentist);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Profile →
              </button>
            </div>
          </div>
        ))}
      </div>

      {dentists.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dentists found</h3>
          <p className="text-gray-600">Try adjusting your search filters.</p>
        </div>
      )}

      {/* Dentist Profile Modal */}
      {selectedDentist && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDentist(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDentist.name}</h2>
                <p className="text-lg text-blue-600 font-medium">{selectedDentist.specialization}</p>
              </div>
              <button
                onClick={() => setSelectedDentist(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900">{selectedDentist.rating}</span>
                <span className="text-gray-500">({selectedDentist.reviews} reviews)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">{selectedDentist.experience} years exp.</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">{selectedDentist.bio}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-gray-600">{selectedDentist.education}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedDentist.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedDentist.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedDentist.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
                onClick={() => setSelectedDentist(null)}
              >
                Book Appointment
              </button>
              <button
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setSelectedDentist(null)}
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
