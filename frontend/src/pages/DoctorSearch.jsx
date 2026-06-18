import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import DoctorCard from '../components/DoctorCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';

const DoctorSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Load Initial params
  const initialSearch = searchParams.get('search') || '';
  const initialSpecialization = searchParams.get('specialization') || '';
  const initialCity = searchParams.get('city') || '';

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [specialization, setSpecialization] = useState(initialSpecialization);
  const [city, setCity] = useState(initialCity);
  const [experience, setExperience] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [minRating, setMinRating] = useState('');
  const [gender, setGender] = useState('');
  const [day, setDay] = useState('');
  const [sort, setSort] = useState('highestRated');
  const [page, setPage] = useState(1);

  // Response States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Toggle Filters in Mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        specialization,
        city,
        experience,
        maxFee,
        minRating,
        gender,
        day,
        sort,
        page,
        limit: 9
      };

      // Clean empty keys
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const { data } = await API.get('/doctors', { params });
      if (data.success) {
        setDoctors(data.doctors);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.total || 0);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, city, experience, maxFee, minRating, gender, day, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const resetFilters = () => {
    setSearch('');
    setSpecialization('');
    setCity('');
    setExperience('');
    setMaxFee('');
    setMinRating('');
    setGender('');
    setDay('');
    setSort('highestRated');
    setPage(1);
  };

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  const specializations = [
    'General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic',
    'Pediatrician', 'Gynecologist', 'Psychiatrist', 'ENT Specialist', 'Ophthalmologist',
    'Urologist', 'Gastroenterologist', 'Dentist', 'Pulmonologist', 'Endocrinologist',
    'Oncologist', 'Nephrologist', 'Rheumatologist', 'Surgeon', 'Physiotherapist'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[85vh]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">Discover Specialists</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{totalResults} Active matches found</p>
        </div>

        {/* Sort and Mobile Toggle */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)} 
            className="md:hidden flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          <select 
            className="glass-input py-2 text-xs font-bold text-slate-600 dark:text-slate-300 w-full md:w-48"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="highestRated">⭐ Highest Rated</option>
            <option value="lowestFee">💵 Lowest Fee</option>
            <option value="mostExperienced">🎓 Most Experienced</option>
            <option value="mostBooked">🔥 Most Booked</option>
            <option value="new">🆕 New Doctors</option>
          </select>
        </div>
      </div>

      {/* Main Search Panel */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100 dark:shadow-none">
        <div className="flex-1 flex items-center pl-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search doctor name, qualification or hospital..." 
            className="w-full bg-transparent border-none outline-none ring-0 text-sm pl-2 py-2.5 text-slate-700 dark:text-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-sm font-extrabold text-white rounded-xl shadow-lg shadow-teal-500/10 hover-scale">
          Find
        </button>
      </form>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side: Filter Sidebar (Desktop) */}
        <aside className={`hidden md:block space-y-6 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/30 glass-panel h-fit`}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-800 dark:text-slate-100">Filter Criteria</h3>
            <button type="button" onClick={resetFilters} className="text-xs text-rose-500 hover:underline flex items-center space-x-1">
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Specialization</label>
              <select className="glass-input text-xs" value={specialization} onChange={(e) => { setSpecialization(e.target.value); setPage(1); }}>
                <option value="">All Specializations</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">City</label>
              <select className="glass-input text-xs" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Min Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Experience (Min Years)</label>
              <select className="glass-input text-xs" value={experience} onChange={(e) => { setExperience(e.target.value); setPage(1); }}>
                <option value="">Any Experience</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="15">15+ Years</option>
              </select>
            </div>

            {/* Consultation Fees */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Max consultation Fee (₹)</label>
              <input 
                type="number" className="glass-input text-xs" placeholder="e.g. 150"
                value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(1); }}
              />
            </div>

            {/* Doctor Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Doctor Gender</label>
              <select className="glass-input text-xs" value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}>
                <option value="">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Available Day */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Availability Day</label>
              <select className="glass-input text-xs" value={day} onChange={(e) => { setDay(e.target.value); setPage(1); }}>
                <option value="">Any Day</option>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </aside>

        {/* Right Side: Doctor Cards Grid */}
        <main className="md:col-span-3 space-y-8">
          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : doctors.length === 0 ? (
            <div className="glass-card p-12 text-center border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center">
              <span className="text-4xl mb-4">🔍</span>
              <h3 className="font-extrabold text-base text-slate-700 dark:text-slate-200">No matching doctors found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Try refining your search queries or resetting search filters.</p>
              <button type="button" onClick={resetFilters} className="mt-5 px-4.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-3.5 pt-6 border-t border-slate-100 dark:border-slate-900/60">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-80 h-full bg-white dark:bg-slate-950 p-6 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Search Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-5">
                {/* Specialization */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Specialization</label>
                  <select className="glass-input text-xs" value={specialization} onChange={(e) => { setSpecialization(e.target.value); setPage(1); }}>
                    <option value="">All Specializations</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">City</label>
                  <select className="glass-input text-xs" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Min Experience</label>
                  <select className="glass-input text-xs" value={experience} onChange={(e) => { setExperience(e.target.value); setPage(1); }}>
                    <option value="">Any Experience</option>
                    <option value="5">5+ Years</option>
                    <option value="10">10+ Years</option>
                  </select>
                </div>

                {/* Fees */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Max Fees (₹)</label>
                  <input type="number" className="glass-input text-xs" placeholder="Max fee" value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(1); }} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex gap-3">
              <button onClick={resetFilters} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-center">Reset</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-xs font-bold text-white text-center">Apply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorSearch;
