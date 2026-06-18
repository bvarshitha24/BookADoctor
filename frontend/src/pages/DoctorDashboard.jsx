import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, Check, X, FileText, Plus, Trash2, Clock, Users, Star, IndianRupee, Loader2, Save } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, doctorProfile, updateProfile } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // queue, availability, profile

  // Availability Settings
  const [selectedDays, setSelectedDays] = useState(doctorProfile?.availableDays || []);
  const [selectedSlots, setSelectedSlots] = useState(doctorProfile?.availableTimeSlots || []);

  // Prescription Writer States
  const [activePrescribeApp, setActivePrescribeApp] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: 'Once daily', duration: '5 days' }]);
  const [submittingPrescription, setSubmittingPrescription] = useState(false);

  const fetchDoctorAppointments = async () => {
    try {
      const { data } = await API.get('/appointments/my-appointments');
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await API.put(`/appointments/${id}/status`, { status });
      if (data.success) {
        toast.info(`Appointment status updated to ${status}`);
        fetchDoctorAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  // Availability configurations
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlotsList = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const saveAvailability = async () => {
    try {
      const res = await API.put('/auth/profile', {
        availableDays: selectedDays,
        availableTimeSlots: selectedSlots
      });
      if (res.data.success) {
        toast.success('Availability settings saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to update availability settings');
    }
  };

  // Prescription Medications form array
  const addMedicationRow = () => {
    setMedications(prev => [...prev, { name: '', dosage: '', frequency: 'Once daily', duration: '5 days' }]);
  };

  const removeMedicationRow = (idx) => {
    setMedications(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMedicationChange = (idx, field, value) => {
    setMedications(prev => prev.map((med, i) => i === idx ? { ...med, [field]: value } : med));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.warning('Diagnosis field is required');
      return;
    }

    setSubmittingPrescription(true);
    try {
      const { data } = await API.post(`/appointments/${activePrescribeApp._id}/prescription`, {
        diagnosis,
        medications,
        notes
      });

      if (data.success) {
        toast.success('Prescription generated and consultation completed!');
        setActivePrescribeApp(null);
        setDiagnosis('');
        setNotes('');
        setMedications([{ name: '', dosage: '', frequency: 'Once daily', duration: '5 days' }]);
        fetchDoctorAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit prescription');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  // Calculate earnings metrics
  const completedConsults = appointments.filter(a => a.appointmentStatus === 'Completed');
  const totalEarnings = completedConsults.length * (doctorProfile?.consultationFee || 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-10">
      
      {/* Earnings and Queue Overview Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Consultations</span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{appointments.length}</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl"><Users className="h-6 w-6" /></div>
        </div>

        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-200">₹{totalEarnings}</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl"><IndianRupee className="h-6 w-6" /></div>
        </div>

        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Doctor Rating</span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{doctorProfile?.rating > 0 ? doctorProfile.rating : 'New'} / 5</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl"><Star className="h-6 w-6" /></div>
        </div>
      </section>

      {/* Dashboard Submenu */}
      <section className="glass-panel p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/30 flex justify-between items-center">
        <h2 className="font-extrabold text-sm uppercase tracking-wide text-slate-400 hidden md:block">Specialist Portal</h2>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'queue' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Today's Queue
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'availability' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Availability Config
          </button>
        </div>
      </section>

      {/* Tab Contents */}
      <div className="grid grid-cols-1">
        
        {/* Appointments queue */}
        {activeTab === 'queue' && (
          <section className="space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Active Consultations List</h3>

            {loading ? (
              <div className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
            ) : appointments.length === 0 ? (
              <div className="glass-card p-12 text-center border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-3xl block mb-3">📋</span>
                <p className="text-xs font-bold text-slate-500">No appointments recorded in schedule queue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((app) => {
                  const formattedDate = new Date(app.appointmentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <div key={app._id} className="glass-card p-5 border border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 flex flex-col justify-between space-y-4">
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{app.patient?.fullName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{app.patient?.gender} • DOB: {app.patient?.dob ? new Date(app.patient.dob).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          app.appointmentStatus === 'Completed' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400' :
                          app.appointmentStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          {app.appointmentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                        <div>Slot: <span className="font-bold text-slate-700 dark:text-slate-200">{formattedDate} @ {app.appointmentTime}</span></div>
                        <div>Type: <span className="font-bold text-slate-700 dark:text-slate-200">{app.appointmentType}</span></div>
                        <div className="col-span-2">Symptoms: <span className="font-bold text-slate-700 dark:text-slate-200">{app.symptoms || 'General Consult'}</span></div>
                      </div>

                      {/* Doctor Action Buttons */}
                      {['Pending', 'Confirmed', 'Rescheduled'].includes(app.appointmentStatus) && (
                        <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                          {app.appointmentStatus === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(app._id, 'Confirmed')}
                                className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center space-x-1 hover-scale"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Accept</span>
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app._id, 'Cancelled')}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 font-bold text-xs flex items-center space-x-1"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {['Confirmed', 'Rescheduled'].includes(app.appointmentStatus) && (
                            <button 
                              onClick={() => setActivePrescribeApp(app)}
                              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center space-x-1.5 hover-scale"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Prescribe & Complete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Availability Settings configuration */}
        {activeTab === 'availability' && (
          <section className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 space-y-8">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4">Set Available Consultation Days</h3>
              <div className="flex flex-wrap gap-2.5">
                {daysOfWeek.map((day) => {
                  const isActive = selectedDays.includes(day);
                  return (
                    <button 
                      key={day} type="button" onClick={() => toggleDay(day)}
                      className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all border ${isActive ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/15' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4">Set Available Time Slots</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {timeSlotsList.map((slot) => {
                  const isActive = selectedSlots.includes(slot);
                  return (
                    <button 
                      key={slot} type="button" onClick={() => toggleSlot(slot)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border text-center ${isActive ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/15' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={saveAvailability}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-teal-500/15 flex items-center space-x-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Schedule Settings</span>
            </button>
          </section>
        )}
      </div>

      {/* Prescription Writer Form Modal */}
      {activePrescribeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-250">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-extrabold text-base">Write Digital Prescription</h3>
              <button onClick={() => setActivePrescribeApp(null)} className="text-slate-400 hover:text-slate-650 font-bold">Discard</button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-5">
              
              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Clinical Diagnosis</label>
                <input 
                  type="text" className="glass-input text-xs" placeholder="e.g. Essential Hypertension"
                  value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required
                />
              </div>

              {/* Dynamic Medicine Rows */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Medications List (Rx)</label>
                  <button type="button" onClick={addMedicationRow} className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center space-x-0.5 hover:underline">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {medications.map((med, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl space-y-2.5 relative">
                    {medications.length > 1 && (
                      <button type="button" onClick={() => removeMedicationRow(idx)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    )}
                    <div className="grid grid-cols-2 gap-3.5 pr-8">
                      <input 
                        type="text" className="glass-input text-xs" placeholder="Medicine Name (e.g. Paracetamol)"
                        value={med.name} onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)} required
                      />
                      <input 
                        type="text" className="glass-input text-xs" placeholder="Dosage (e.g. 500mg)"
                        value={med.dosage} onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)} required
                      />
                      <select 
                        className="glass-input text-xs" value={med.frequency}
                        onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                      >
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                      </select>
                      <input 
                        type="text" className="glass-input text-xs" placeholder="Duration (e.g. 5 days)"
                        value={med.duration} onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)} required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Doctor Remarks / Notes</label>
                <textarea 
                  className="glass-input text-xs h-20" placeholder="e.g. Drink plenty of water and rest well."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingPrescription}
                className="w-full py-3 mt-4 text-xs font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover-scale flex items-center justify-center space-x-1.5"
              >
                {submittingPrescription ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Prescribe & Complete consultation</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
