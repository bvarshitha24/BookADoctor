import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import InteractiveCalendar from '../components/InteractiveCalendar';
import { toast } from 'react-toastify';
import { Calendar, FileText, User, Settings, Video, CheckCircle, XCircle, Clock, Save, Download, Printer } from 'lucide-react';

const PatientDashboard = () => {
  const { user, updateProfile } = useAuth();
  
  // Dashboard states
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, profile, medicalHistory

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [medicalHistory, setMedicalHistory] = useState(user?.medicalHistory?.join(', ') || '');
  const [allergies, setAllergies] = useState(user?.allergies?.join(', ') || '');
  const [currentMedications, setCurrentMedications] = useState(user?.currentMedications?.join(', ') || '');

  // Cancel control
  const [cancellingAppId, setCancellingAppId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Reschedule control
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);



  // Prescription View control
  const [activePrescriptionApp, setActivePrescriptionApp] = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get('/appointments/my-appointments');
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      fullName,
      phoneNumber,
      gender,
      dob,
      bloodGroup,
      medicalHistory: medicalHistory.split(',').map(item => item.trim()).filter(Boolean),
      allergies: allergies.split(',').map(item => item.trim()).filter(Boolean),
      currentMedications: currentMedications.split(',').map(item => item.trim()).filter(Boolean)
    };

    const res = await updateProfile(payload);
    if (res.success) {
      toast.success('Medical profile configuration saved!');
    } else {
      toast.error(res.message || 'Profile save failed');
    }
  };

  const handleCancelAppointment = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.warning('Please declare reason for cancellation');
      return;
    }

    try {
      const { data } = await API.put(`/appointments/${cancellingAppId}/status`, {
        status: 'Cancelled',
        cancellationReason: cancelReason
      });

      if (data.success) {
        toast.info('Appointment cancelled successfully.');
        setCancellingAppId(null);
        setCancelReason('');
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation request failed');
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.warning('Please select reschedule slot');
      return;
    }

    try {
      const { data } = await API.put(`/appointments/${reschedulingApp._id}/status`, {
        status: 'Rescheduled',
        date: rescheduleDate,
        time: rescheduleTime
      });

      if (data.success) {
        toast.success('Appointment rescheduled successfully.');
        setReschedulingApp(null);
        setRescheduleDate(null);
        setRescheduleTime(null);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rescheduling request failed');
    }
  };



  const printPrescription = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-10">
      
      {/* Profile Header */}
      <section className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-2xl border-2 border-teal-500/10 shadow-inner">
            {user?.fullName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{user?.fullName}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Role: {user?.role}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'appointments' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Appointments Queue
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Medical Records
          </button>
        </div>
      </section>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Appointments Tab Content */}
        {activeTab === 'appointments' && (
          <section className="space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Scheduled Consultations Queue</h3>
            
            {loading ? (
              <div className="space-y-4"><div className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div></div>
            ) : appointments.length === 0 ? (
              <div className="glass-card p-12 text-center border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-3xl block mb-3">📅</span>
                <p className="text-xs font-bold text-slate-500">No scheduled consultations found in history.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((app) => {
                  const docUser = app.doctor?.user;
                  const formattedDate = new Date(app.appointmentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  return (
                    <div key={app._id} className="glass-card p-5 border border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3.5">
                          <img src={docUser?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${docUser?.fullName || 'Doctor'}`} className="h-12 w-12 rounded-xl object-cover border border-teal-500/10" alt="" />
                          <div>
                            <h4 className="font-bold text-sm">{docUser?.fullName}</h4>
                            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-wider uppercase">{app.doctor?.specialization}</p>
                          </div>
                        </div>

                        {/* Status badges */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          app.appointmentStatus === 'Completed' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400' :
                          app.appointmentStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          {app.appointmentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <div>Date: <span className="font-bold text-slate-700 dark:text-slate-200">{formattedDate}</span></div>
                        <div>Time: <span className="font-bold text-slate-700 dark:text-slate-200">{app.appointmentTime}</span></div>
                        <div>Type: <span className="font-bold text-slate-700 dark:text-slate-200">{app.appointmentType}</span></div>
                        <div>Symptoms: <span className="font-bold text-slate-700 dark:text-slate-200">{app.symptoms || 'General Checkup'}</span></div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/60">

                        {['Pending', 'Confirmed', 'Rescheduled'].includes(app.appointmentStatus) && (
                          <>
                            <button 
                              onClick={() => setReschedulingApp(app)}
                              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                            >
                              Reschedule
                            </button>
                            <button 
                              onClick={() => setCancellingAppId(app._id)}
                              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {app.appointmentStatus === 'Completed' && app.prescription?.diagnosis && (
                          <button 
                            onClick={() => setActivePrescriptionApp(app)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 font-bold text-xs flex items-center space-x-1.5 hover-scale"
                          >
                            <FileText className="h-3.5 w-3.5 text-teal-500" />
                            <span>View Prescription</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <section className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
              <User className="h-4.5 w-4.5" />
              <span>Medical profile configurations</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Full Name</label>
                  <input type="text" className="glass-input text-xs" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Phone Number</label>
                  <input type="text" className="glass-input text-xs" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Blood Group</label>
                  <select className="glass-input text-xs" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-slate-850">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Medical Conditions (comma separated)</label>
                  <input type="text" className="glass-input text-xs" placeholder="e.g. Asthma, Hypertension" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Allergies (comma separated)</label>
                  <input type="text" className="glass-input text-xs" placeholder="e.g. Penicillin" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Current Medications</label>
                  <input type="text" className="glass-input text-xs" placeholder="e.g. Albuterol 100mcg" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-xs font-extrabold text-white rounded-xl flex items-center space-x-1.5 shadow-lg shadow-teal-500/15">
                <Save className="h-4 w-4" />
                <span>Save Profile Parameters</span>
              </button>
            </form>
          </section>
        )}
      </div>

      {/* 5. Cancel Booking Modal */}
      {cancellingAppId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-250">
            <h3 className="font-extrabold text-base">Cancel Appointment Consultation</h3>
            
            <form onSubmit={handleCancelAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Reason for Cancellation</label>
                <textarea 
                  className="glass-input text-xs h-24" placeholder="Please describe reason..."
                  value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} required
                />
              </div>
              
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button type="button" onClick={() => setCancellingAppId(null)} className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-xl">Discard</button>
                <button type="submit" className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600">Submit Cancellation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Reschedule Modal */}
      {reschedulingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-250">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-extrabold text-base">Reschedule Appointment Slot</h3>
              <button onClick={() => setReschedulingApp(null)} className="text-slate-400 hover:text-slate-600 font-bold">Discard</button>
            </div>

            <InteractiveCalendar 
              availableDays={reschedulingApp.doctor?.availableDays || ['Monday', 'Wednesday']} 
              availableSlots={reschedulingApp.doctor?.availableTimeSlots || ['09:00', '10:00']}
              onSelectSlot={(d, t) => { setRescheduleDate(d); setRescheduleTime(t); }}
            />

            <button 
              onClick={handleRescheduleSubmit}
              className="w-full py-3 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl hover-scale"
            >
              Confirm Rescheduling
            </button>
          </div>
        </div>
      )}

      {/* 8. Prescription Printable letterhead modal */}
      {activePrescriptionApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white text-slate-850 p-8 rounded-3xl shadow-2xl relative border border-slate-200 space-y-8 print:p-0 print:border-none print:shadow-none animate-in zoom-in-95 duration-250">
            
            {/* Header print buttons */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 print:hidden">
              <h3 className="font-extrabold text-slate-800">Digital Prescription Letterhead</h3>
              <div className="flex space-x-2">
                <button onClick={printPrescription} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center space-x-1 text-xs font-bold"><Printer className="h-4 w-4 text-slate-600" /> <span>Print</span></button>
                <button onClick={() => setActivePrescriptionApp(null)} className="p-2 border rounded-xl text-xs font-bold">Close</button>
              </div>
            </div>

            {/* Prescription template */}
            <div className="space-y-6">
              
              {/* Doctor Details Header */}
              <div className="flex justify-between items-start border-b-2 border-teal-600 pb-4">
                <div>
                  <h2 className="text-xl font-black text-teal-800">Dr. {activePrescriptionApp.doctor?.user?.fullName}</h2>
                  <p className="text-xs text-slate-500">{activePrescriptionApp.doctor?.specialization} — {activePrescriptionApp.doctor?.qualification.join(', ')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{activePrescriptionApp.doctor?.hospitalName}, {activePrescriptionApp.doctor?.city}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold">License: {activePrescriptionApp.doctor?.licenseNumber}</p>
                  <p className="text-slate-400 mt-0.5">Date: {new Date(activePrescriptionApp.prescription?.dateUploaded).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                <div>Patient Name: <span className="font-bold">{user?.fullName}</span></div>
                <div>Age / Gender: <span className="font-bold">{user?.gender}</span></div>
                <div>Diagnosis: <span className="font-bold text-teal-800">{activePrescriptionApp.prescription?.diagnosis}</span></div>
              </div>

              {/* Medications grid */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-700">Prescribed Medications (Rx)</h4>
                
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 font-bold">
                      <th className="py-2">Medicine Details</th>
                      <th className="py-2">Dosage</th>
                      <th className="py-2">Frequency</th>
                      <th className="py-2 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePrescriptionApp.prescription?.medications?.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-100 text-slate-700">
                        <td className="py-3 font-bold text-teal-900">{m.name}</td>
                        <td className="py-3">{m.dosage}</td>
                        <td className="py-3">{m.frequency}</td>
                        <td className="py-3 text-right">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="pt-4 border-t border-slate-100 text-xs space-y-1">
                <p className="font-extrabold text-slate-500">Remarks / Instructions:</p>
                <p className="text-slate-600 leading-relaxed italic">"{activePrescriptionApp.prescription?.notes || 'Follow up if symptoms persist.'}"</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
