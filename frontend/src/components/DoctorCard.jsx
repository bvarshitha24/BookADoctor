import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, IndianRupee, ShieldCheck } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  const { user, specialization, experience, consultationFee, hospitalName, city, rating, reviewsCount, availableDays } = doctor;

  // Determine if doctor is available today
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  const isAvailableToday = availableDays.includes(todayName);

  return (
    <div className="glass-card hover-scale p-5 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 relative overflow-hidden flex flex-col justify-between h-[360px]">
      
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'Doctor'}`} 
              className="h-16 w-16 rounded-2xl object-cover border-2 border-teal-500/20 bg-slate-50 dark:bg-slate-800"
              alt={user?.fullName} 
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{user?.fullName}</h3>
                <ShieldCheck className="h-4.5 w-4.5 text-teal-500 fill-teal-500/10 stroke-[2]" />
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-extrabold tracking-wide uppercase mt-0.5">{specialization}</p>
            </div>
          </div>
          
          {isAvailableToday && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 animate-pulse">
              Available Today
            </span>
          )}
        </div>

        {/* Clinical Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Award className="h-4 w-4 text-slate-400" />
            <span>{experience} Yrs Exp</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 text-slate-400 truncate max-w-[80px]" />
            <span className="truncate">{hospitalName}, {city}</span>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="flex items-center space-x-0.5 text-amber-500 font-extrabold text-sm">
            <Star className="h-4.5 w-4.5 fill-amber-500" />
            <span>{rating > 0 ? rating : 'New'}</span>
          </div>
          {reviewsCount > 0 && (
            <span className="text-xs text-slate-400 font-semibold">({reviewsCount} feedback reviews)</span>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultation Fee</p>
          <div className="flex items-center font-extrabold text-lg text-slate-800 dark:text-slate-100">
            <IndianRupee className="h-4 w-4 text-teal-500" />
            <span>{consultationFee}</span>
          </div>
        </div>
        
        <Link 
          to={`/doctor/${doctor._id}`} 
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl transition-all hover-scale"
        >
          Book Consultation
        </Link>
      </div>

    </div>
  );
};

export default DoctorCard;
