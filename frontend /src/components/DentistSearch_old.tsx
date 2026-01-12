import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Award, Briefcase, MapPin } from 'lucide-react';

export default function DentistSearch() {
  const [dentists, setDentists] = useState<any[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDentists();
  }, []);

  useEffect(() => {
    filterDentists();
  }, [searchTerm, specializationFilter, dentists]);

  const loadDentists = async () => {
    try {
      const { data, error } = await supabase
        .from('dentist_profiles')
        .select(`
          id,
          specialization,
          experience_years,
          bio,
          user:profiles!dentist_profiles_user_id_fkey(id, full_name, phone)
        `)
        .order('experience_years', { ascending: false });

      if (error) throw error;
      setDentists(data || []);
    } catch (error) {
      console.error('Error loading dentists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDentists = () => {
    let filtered = dentists;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specializationFilter) {
      filtered = filtered.filter((d) => d.specialization === specializationFilter);
    }

    setFilteredDentists(filtered);
  };

  const specializations = Array.from(
    new Set(dentists.map((d) => d.specialization).filter(Boolean))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Find a Dentist</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name or Specialization
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dentists..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              id="specialization"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecializationFilter('');
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading dentists...</p>
        </div>
      ) : filteredDentists.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-gray-600">No dentists found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDentists.map((dentist) => (
            <div
              key={dentist.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Dr. {dentist.user?.full_name}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {dentist.specialization || 'General Dentistry'}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-sm">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {dentist.experience_years} years experience
                    </span>
                  </div>
                  {dentist.user?.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{dentist.user.phone}</span>
                    </div>
                  )}
                </div>

                {dentist.bio && (
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3">{dentist.bio}</p>
                )}

                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
