import React from 'react';
import { Heart, Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-850 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 font-extrabold text-lg mb-4">
            <Activity className="h-5 w-5" />
            <span>Book a Doctor</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Connecting patients with the world's leading healthcare professionals. Secure, instantaneous appointment scheduling and digital consultations.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4">For Patients</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/search" className="hover:text-teal-400 transition-colors">Search for Doctors</a></li>
            <li><a href="/register" className="hover:text-teal-400 transition-colors">Create Patient Account</a></li>
            <li><a href="/dashboard" className="hover:text-teal-400 transition-colors">View Appointments</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4">For Doctors</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/register?role=Doctor" className="hover:text-teal-400 transition-colors">Join as Specialist</a></li>
            <li><a href="/doctor-dashboard" className="hover:text-teal-400 transition-colors">Doctor Portal</a></li>
            <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4">Contact Us</h4>
          <p className="text-sm text-slate-400">Email: support@bookadoctor.com</p>
          <p className="text-sm text-slate-400 mt-1">Phone: +1 (555) 019-2834</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Book a Doctor Platform. All rights reserved.</p>
        <p className="flex items-center space-x-1 mt-2 md:mt-0">
          <span>Engineered with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>for clinical excellence.</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
