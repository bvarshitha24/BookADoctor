import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Shield, Star, Award, ChevronDown, MessageSquare, Phone, MapPin, CheckCircle, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // FAQs
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const specializations = [
    { name: 'General Physician', count: 12, icon: '🩺' },
    { name: 'Cardiologist', count: 8, icon: '❤️' },
    { name: 'Neurologist', count: 6, icon: '🧠' },
    { name: 'Dermatologist', count: 9, icon: '✨' },
    { name: 'Pediatrician', count: 14, icon: '👶' },
    { name: 'Dentist', count: 10, icon: '🦷' }
  ];

  const testimonials = [
    { name: 'Sarah Connor', text: 'Booking with Dr. Smith was incredibly fast. I got an appointment confirmed in 2 minutes, uploaded my files, and did a video consult.', rating: 5 },
    { name: 'Marcus Aurelius', text: 'The interface is highly intuitive and beautiful. Being able to see reviews before booking gives absolute peace of mind.', rating: 5 },
    { name: 'Jane Watson', text: 'Digital prescriptions saved my time. The doctor completed the consult and I downloaded the PDF prescription immediately.', rating: 5 }
  ];

  const faqs = [
    { q: 'How do online consultations work?', a: 'Online consultations simulate physical clinic visits over a secure WebRTC video room. You can choose a slot, book, upload reports, and click join when the slot is active.' },
    { q: 'Can I reschedule my appointment?', a: 'Yes. You can reschedule any confirmed appointment up to 2 hours before the start time from your patient dashboard, subject to slot availability.' },
    { q: 'Is my medical history secure?', a: 'Absolutely. We apply industry-standard JWT authentication and Mongoose sanitization layers to guarantee your records are only visible to you and your selected consultants.' }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 pt-10 overflow-hidden bg-gradient-to-tr from-slate-50 to-teal-50/20 dark:from-slate-950 dark:to-slate-900/30">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/5 animate-pulse"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8 z-10">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-teal-100/60 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200/20">
            ★ Next-Gen Clinical Appointments Platform
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-800 dark:text-white leading-[1.15]">
            Find the Right <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">Specialist</span>,<br />
            Book in Seconds.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Connect with certified practitioners across 20+ specializations. Receive digital prescriptions, upload medical diagnostics, and do video consultation from the comfort of home.
          </p>

          {/* Large Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center">
            <div className="flex-1 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by doctor, specialization, or clinic..." 
                className="w-full bg-transparent border-0 ring-0 outline-none text-sm pl-2 py-2 text-slate-700 dark:text-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-sm font-extrabold text-white rounded-xl hover-scale shadow-lg shadow-teal-500/10"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. Specializations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Popular Specializations</h2>
          <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Select to search instantly</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {specializations.map((spec) => (
            <Link 
              key={spec.name} 
              to={`/search?specialization=${encodeURIComponent(spec.name)}`}
              className="glass-card hover-scale p-5 flex flex-col items-center justify-center border border-slate-200/40 dark:border-slate-800/40 hover:border-teal-500/40 dark:hover:border-teal-400/40 transition-all text-center group"
            >
              <span className="text-4xl mb-3 duration-300 group-hover:scale-110">{spec.icon}</span>
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">{spec.name}</h3>
              <span className="text-[10px] text-slate-400 mt-1">{spec.count} Available Specialists</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Why Choose Us / Platform Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-black tracking-widest">Platform Core Advantages</span>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight text-slate-800 dark:text-white">Why Patients Trust Book a Doctor</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            We bridge the gap between patient requirements and clinic availability. Schedule online video appointments or standard in-clinic consultations with verified doctors in your city.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400"><Shield className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-sm">Verified Credentials Only</h4>
                <p className="text-xs text-slate-400 mt-0.5">Admin approval workflows guarantee license validation for every active specialist.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400"><CheckCircle className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-sm">Double-Booking Prevention</h4>
                <p className="text-xs text-slate-400 mt-0.5">Smart DB indexing and availability logic prevent double appointments automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 text-center">
            <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400">100%</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Digital Prescriptions</p>
          </div>
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 text-center">
            <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400">80+</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Verified Doctors</p>
          </div>
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 text-center">
            <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400">24/7</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Calendar Scheduling</p>
          </div>
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 text-center">
            <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400">5+</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Major Cities covered</p>
          </div>
        </div>
      </section>

      {/* 4. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">What Patients Say</h2>
          <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Verified consultation testimonials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-card p-6 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
              <div className="flex text-amber-500">
                {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-500" />)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">"{t.text}"</p>
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">{t.name[0]}</div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQs accordions */}
      <section id="faq" className="max-w-4xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Support FAQ</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/50 cursor-pointer transition-all hover:bg-white/90 dark:hover:bg-slate-900/60"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{faq.q}</h4>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3.5 border-t border-slate-100 dark:border-slate-850 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Home;
