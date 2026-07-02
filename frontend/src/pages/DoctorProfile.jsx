import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import InteractiveCalendar from '../components/InteractiveCalendar';
import SkeletonLoader from '../components/SkeletonLoader';
import { toast } from 'react-toastify';
import { Star, MapPin, Award, BookOpen, Clock, FileText, ChevronRight, CheckCircle2, ShieldCheck, Heart, Users } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form States
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [consultationType, setConsultationType] = useState('Offline'); // Always Offline
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [reports, setReports] = useState([]); // File names mock list

  // Modal Control
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Card Payment States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchDoctorProfile = async () => {
    try {
      const { data } = await API.get(`/doctors/${id}`);
      if (data.success) {
        setDoctor(data.doctor);
        setReviews(data.reviews || []);
      }
    } catch (err) {
      toast.error('Failed to load doctor profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, [id]);

  const handleSelectSlot = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please login as Patient to schedule appointments');
      navigate('/login');
      return;
    }
    if (user.role !== 'Patient') {
      toast.error('Only patient accounts can schedule doctor appointments.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.warning('Please select a valid date and time slot first.');
      return;
    }
    // Advance to payment step
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      toast.warning('Please fill in card billing details');
      return;
    }

    setPaymentLoading(true);
    try {
      const payload = {
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType: consultationType,
        symptoms,
        notes,
        uploadedReports: reports
      };

      const { data } = await API.post('/appointments', payload);
      if (data.success) {
        toast.success('Consultation booked and confirmed successfully!');
        setShowPaymentModal(false);
        navigate('/dashboard'); // Direct to patient dashboard
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Consultation scheduling failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Simulating file name mock uploads
    setReports(files.map(f => f.name));
    toast.success(`${files.length} report(s) uploaded.`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <span className="text-4xl">❌</span>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Profile not found</h3>
        <p className="text-slate-400 text-xs">The doctor profile you are seeking is unavailable.</p>
      </div>
    );
  }

  const { user: docUser, specialization, qualification, experience, consultationFee, hospitalName, address, city, rating, reviewsCount, availableDays, availableTimeSlots, biography } = doctor;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Header Card */}
      <section className="glass-card p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        
        {/* Doctor Photo */}
        <div className="flex justify-center">
          <img 
            src={docUser?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${docUser?.fullName}`} 
            className="h-40 w-40 rounded-3xl object-cover border-2 border-teal-500/20 bg-slate-50 dark:bg-slate-800 shadow-lg"
            alt={docUser?.fullName} 
          />
        </div>

        {/* Credentials Details */}
        <div className="md:col-span-2 space-y-3.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{docUser?.fullName}</h1>
            <ShieldCheck className="h-6 w-6 text-teal-500 fill-teal-500/10" />
          </div>
          <p className="text-sm text-teal-600 dark:text-teal-400 font-extrabold tracking-wide uppercase">{specialization} — {qualification.join(', ')}</p>
          
          <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto md:mx-0 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="text-center md:text-left">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Experience</span>
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200">{experience} Yrs</span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Rating</span>
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center md:justify-start space-x-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{rating > 0 ? rating : 'New'}</span>
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Consultation</span>
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200">₹{consultationFee}</span>
            </div>
          </div>
        </div>

        {/* Book Button Panel */}
        <div className="flex flex-col items-center md:items-end justify-center">
          <button 
            onClick={() => setShowBookingModal(true)}
            className="w-full sm:w-48 py-3.5 text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-2xl shadow-xl shadow-teal-500/15 hover-scale"
          >
            Book Appointment
          </button>
        </div>
      </section>

      {/* 2. Biography & Clinic details */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Biography */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <BookOpen className="h-4.5 w-4.5" />
              <span>Doctor Biography</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{biography || `Dr. ${docUser?.fullName} has an outstanding clinical track record with ${experience} years specializing in ${specialization}. Dedicated to personalized recovery paths.`}</p>
          </div>

          {/* Reviews List */}
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-4">Patient Feedback ({reviews.length})</h3>
            
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No patients have submitted feedback reviews yet.</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">{r.patient?.fullName[0]}</div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{r.patient?.fullName}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {Array(r.rating).fill(0).map((_, idx) => <Star key={idx} className="h-3 w-3 fill-amber-500" />)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{r.review}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Hospital / Clinic Locations */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <MapPin className="h-4.5 w-4.5" />
              <span>Clinic Details</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Hospital Name</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{hospitalName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Address</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{address}, {city}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Languages Spoken</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{doctor.languagesSpoken?.join(', ') || 'English'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Booking Configuration Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-250">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <h3 className="font-extrabold text-lg">Schedule Appointment</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Interactive Calendar component selection */}
              <InteractiveCalendar 
                availableDays={availableDays} 
                availableSlots={availableTimeSlots} 
                onSelectSlot={handleSelectSlot}
                bookedSlots={[]} // Booked checks are simulated on submit
              />

              {/* Consultation Type is implicitly In-Clinic (Offline) */}

              {/* Symptoms Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Symptoms / Reasons for Visit</label>
                <input 
                  type="text" className="glass-input text-xs" placeholder="e.g. Fever, persistent cough"
                  value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required
                />
              </div>

              {/* Reports File uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Medical Records / Reports (PDF/JPG)</label>
                <input 
                  type="file" multiple className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-900/20 dark:file:text-teal-400 hover:file:bg-teal-100 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>

              {/* Note Summary details */}
              {selectedDate && selectedTime && (
                <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-teal-600 dark:text-teal-400">Appointment Summary</p>
                  <p>Date: {selectedDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>Time Slot: {selectedTime}</p>
                  <p>Consultation Fee: ₹{consultationFee}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3.5 text-xs font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-teal-500/10 hover-scale"
              >
                Proceed to Checkout
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 4. Payment Simulation Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-250">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <h3 className="font-extrabold text-lg">Secure Consultation Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                <span>Clinical Booking Fee:</span>
                <span>₹{consultationFee}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax & Service Levy:</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-teal-600 dark:text-teal-400 border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>Total Charge:</span>
                <span>₹{consultationFee}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Credit Card Number</label>
                <input 
                  type="text" className="glass-input text-xs" placeholder="4111 2222 3333 4444"
                  value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiration Date</label>
                  <input 
                    type="text" className="glass-input text-xs" placeholder="MM/YY"
                    value={expiry} onChange={(e) => setExpiry(e.target.value)} required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVV Security Code</label>
                  <input 
                    type="password" className="glass-input text-xs" placeholder="•••"
                    value={cvv} onChange={(e) => setCvv(e.target.value)} required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={paymentLoading}
                className="w-full py-3.5 text-xs font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-teal-500/10 hover-scale flex items-center justify-center"
              >
                {paymentLoading ? 'Bypassing secure transaction gateway...' : `Pay & Confirm ₹${consultationFee}`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorProfile;
