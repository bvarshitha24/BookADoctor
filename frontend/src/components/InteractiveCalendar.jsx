import React, { useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';

const InteractiveCalendar = ({ availableDays, availableSlots, onSelectSlot, bookedSlots = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Generate next 14 days
  const days = Array(14).fill(0).map((_, i) => addDays(new Date(), i));

  // Match day names
  const matchDay = (date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return availableDays.includes(dayNames[date.getDay()]);
  };

  const handleDateClick = (date) => {
    if (!matchDay(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSelectSlot(selectedDate, time);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">1. Select Appointment Date</h4>
        <div className="flex space-x-2.5 overflow-x-auto pb-2 scroll-smooth">
          {days.map((date, i) => {
            const isAvailable = matchDay(date);
            const isSelected = selectedDate && isSameDay(selectedDate, date);
            return (
              <button
                key={i}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleDateClick(date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl w-16 h-20 transition-all ${
                  isSelected 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' 
                    : isAvailable 
                      ? 'bg-teal-500/5 dark:bg-teal-900/10 border border-teal-500/10 hover:border-teal-500/30' 
                      : 'bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/20 opacity-30 cursor-not-allowed'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">{format(date, 'eee')}</span>
                <span className="text-lg font-black mt-1">{format(date, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="animate-in fade-in duration-300">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">2. Select Time Slot</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {availableSlots.map((time, idx) => {
              const isSelected = selectedTime === time;
              // Check if already booked
              const isBooked = bookedSlots.some(bs => 
                isSameDay(new Date(bs.date), selectedDate) && bs.time === time
              );

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isBooked}
                  onClick={() => handleTimeClick(time)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl text-center transition-all ${
                    isBooked
                      ? 'bg-rose-500/5 text-rose-500 border border-rose-500/10 line-through opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCalendar;
