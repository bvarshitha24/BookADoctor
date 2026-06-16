import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title as ChartTitle, 
  Tooltip, Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ShieldAlert, CheckCircle, XCircle, Users, Activity, BarChart3, TrendingUp, ShieldCheck, Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, ChartTitle, Tooltip, Legend
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, verify, users, add-doctor
  
  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Doctor Form States
  const [submittingAddDoc, setSubmittingAddDoc] = useState(false);
  const [addDocName, setAddDocName] = useState('');
  const [addDocEmail, setAddDocEmail] = useState('');
  const [addDocPassword, setAddDocPassword] = useState('');
  const [addDocPhone, setAddDocPhone] = useState('');
  const [addDocGender, setAddDocGender] = useState('Male');
  const [addDocDob, setAddDocDob] = useState('');
  const [addDocSpec, setAddDocSpec] = useState('General Physician');
  const [addDocLicense, setAddDocLicense] = useState('');
  const [addDocQual, setAddDocQual] = useState('');
  const [addDocExp, setAddDocExp] = useState('');
  const [addDocFee, setAddDocFee] = useState('');
  const [addDocHosp, setAddDocHosp] = useState('');
  const [addDocCity, setAddDocCity] = useState('');
  const [addDocBio, setAddDocBio] = useState('');

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get('/admin/analytics');
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard analytics');
    }
  };

  const fetchPendingDocs = async () => {
    try {
      const { data } = await API.get('/admin/doctor-applications');
      if (data.success) {
        setPendingDocs(data.doctors);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await API.get('/admin/patients');
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchPendingDocs(), fetchPatients()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveDoctor = async (id, status) => {
    try {
      const { data } = await API.put(`/admin/approve-doctor/${id}`, { status });
      if (data.success) {
        toast.success(`Specialist credentials updated to: ${status}`);
        fetchPendingDocs();
        fetchAnalytics(); // refresh stats
      }
    } catch (err) {
      toast.error('Failed to verify doctor credentials');
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/block`);
      if (data.success) {
        toast.info(data.message);
        fetchPatients();
      }
    } catch (err) {
      toast.error('Failed to toggle moderation blocking');
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAddDoc(true);
    try {
      const payload = {
        fullName: addDocName,
        email: addDocEmail,
        password: addDocPassword,
        phoneNumber: addDocPhone,
        gender: addDocGender,
        dob: addDocDob,
        specialization: addDocSpec,
        licenseNumber: addDocLicense,
        qualification: addDocQual,
        experience: addDocExp,
        consultationFee: addDocFee,
        hospitalName: addDocHosp,
        city: addDocCity,
        biography: addDocBio
      };

      const { data } = await API.post('/admin/add-doctor', payload);
      if (data.success) {
        toast.success('Doctor account registered and pre-approved successfully!');
        // Reset form
        setAddDocName('');
        setAddDocEmail('');
        setAddDocPassword('');
        setAddDocPhone('');
        setAddDocGender('Male');
        setAddDocDob('');
        setAddDocLicense('');
        setAddDocQual('');
        setAddDocExp('');
        setAddDocFee('');
        setAddDocHosp('');
        setAddDocCity('');
        setAddDocBio('');
        
        // Go back to analytics and refresh data
        setActiveTab('analytics');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSubmittingAddDoc(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Activity className="h-10 w-10 animate-spin text-teal-600" />
        <span className="text-xs text-slate-400 font-bold uppercase">Assembling analytics dashboards...</span>
      </div>
    );
  }

  const { kpis, statusDistribution, topDoctors, specializationDistribution, monthlyAppointments } = analytics;

  // Chart 1: Monthly Bookings (Line Chart)
  const lineChartData = {
    labels: monthlyAppointments.map(item => `${item._id.month}/${item._id.year}`),
    datasets: [{
      label: 'Consultation Bookings',
      data: monthlyAppointments.map(item => item.count),
      borderColor: 'rgb(20, 184, 166)',
      backgroundColor: 'rgba(20, 184, 166, 0.15)',
      tension: 0.4,
      fill: true
    }]
  };

  // Chart 2: Specialization Bookings (Bar Chart)
  const barChartData = {
    labels: specializationDistribution.map(item => item._id).slice(0, 5),
    datasets: [{
      label: 'Practitioners Count',
      data: specializationDistribution.map(item => item.count).slice(0, 5),
      backgroundColor: 'rgba(13, 148, 136, 0.75)',
      borderRadius: 8
    }]
  };

  // Chart 3: Status Distribution (Doughnut Chart)
  const doughnutChartData = {
    labels: statusDistribution.map(item => item._id),
    datasets: [{
      data: statusDistribution.map(item => item.count),
      backgroundColor: [
        'rgba(20, 184, 166, 0.7)',  // Teal
        'rgba(245, 158, 11, 0.7)',  // Amber
        'rgba(244, 63, 94, 0.7)',   // Rose
        'rgba(99, 102, 241, 0.7)'   // Indigo
      ],
      borderWidth: 0
    }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-10">
      
      {/* KPIs Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
          <span className="block text-[10px] uppercase font-bold text-slate-400">System Patients</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{kpis.totalPatients}</span>
        </div>
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Approved Doctors</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{kpis.totalDoctors}</span>
        </div>
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Total Bookings</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{kpis.totalAppointments}</span>
        </div>
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Total Estimated Revenue</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400">${kpis.totalRevenue}</span>
        </div>
      </section>

      {/* Admin Menu */}
      <section className="glass-panel p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/30 flex justify-between items-center">
        <h2 className="font-extrabold text-sm uppercase tracking-wide text-slate-400 hidden md:block">System Administration</h2>
        
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Analytics Graphs
          </button>
          <button 
            onClick={() => setActiveTab('verify')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'verify' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Verification Queue ({pendingDocs.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            User Directory
          </button>
          <button 
            onClick={() => setActiveTab('add-doctor')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'add-doctor' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Add Doctor
          </button>
        </div>
      </section>

      {/* Tab Contents */}
      <div className="grid grid-cols-1">
        
        {/* Analytics Graphs */}
        {activeTab === 'analytics' && (
          <section className="space-y-8">
            
            {/* Top row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Line Chart */}
              <div className="lg:col-span-2 glass-card p-6 bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 h-[350px]">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-1"><TrendingUp className="h-4 w-4 text-teal-500" /> <span>Consultation Booking trends (Line)</span></h4>
                <div className="h-[260px] flex items-center justify-center">
                  <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Status distribution doughnut */}
              <div className="glass-card p-6 bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 h-[350px]">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-1"><Activity className="h-4 w-4 text-teal-500" /> <span>Appointment Status distributions (Arc)</span></h4>
                <div className="h-[220px] flex items-center justify-center">
                  <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Specializations Bar Chart */}
              <div className="lg:col-span-2 glass-card p-6 bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 h-[320px]">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-1"><BarChart3 className="h-4 w-4 text-teal-500" /> <span>Specializations distribution (Bar)</span></h4>
                <div className="h-[220px] flex items-center justify-center">
                  <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Popular Doctors */}
              <div className="glass-card p-6 bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 h-[320px] overflow-hidden">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center space-x-1"><ShieldCheck className="h-4 w-4 text-teal-500" /> <span>Top Rated Specialists (Aggregate)</span></h4>
                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  {topDoctors.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <img src={doc.user?.profilePicture} className="h-8 w-8 rounded-full border" alt="" />
                        <div className="text-xs">
                          <span className="font-bold block">{doc.user?.fullName}</span>
                          <span className="text-[10px] text-slate-400">{doc.specialization}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-500">⭐ {doc.rating}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </section>
        )}

        {/* Verification applications queue */}
        {activeTab === 'verify' && (
          <section className="space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Credential Verification Queue</h3>
            
            {pendingDocs.length === 0 ? (
              <div className="glass-card p-12 text-center border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-3xl block mb-3">✓</span>
                <p className="text-xs font-bold text-slate-500">All medical practitioner applications are processed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingDocs.map((doc) => (
                  <div key={doc._id} className="glass-card p-5 border border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/40 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <img src={doc.user?.profilePicture} className="h-12 w-12 rounded-xl border object-cover" alt="" />
                        <div>
                          <h4 className="font-bold text-sm">{doc.user?.fullName}</h4>
                          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-wider uppercase">{doc.specialization} • LIC: {doc.licenseNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <div>Education: <span className="font-bold text-slate-700 dark:text-slate-200">{doc.qualification.join(', ')}</span></div>
                      <div>Experience: <span className="font-bold text-slate-700 dark:text-slate-200">{doc.experience} Years</span></div>
                      <div>Hospital: <span className="font-bold text-slate-700 dark:text-slate-200">{doc.hospitalName}, {doc.city}</span></div>
                    </div>

                    <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <button 
                        onClick={() => handleApproveDoctor(doc._id, 'Approved')}
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center space-x-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve Practice</span>
                      </button>
                      <button 
                        onClick={() => handleApproveDoctor(doc._id, 'Rejected')}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-850 text-rose-500 text-xs font-bold hover:bg-rose-50 flex items-center space-x-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject Practice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* User Directory */}
        {activeTab === 'users' && (
          <section className="space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Patient Moderation Directory</h3>

            <div className="glass-card bg-white dark:bg-slate-900 border overflow-hidden rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-150 dark:border-slate-850">
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Email Details</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((pat) => (
                    <tr key={pat._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-bold">{pat.fullName}</td>
                      <td className="p-4 text-slate-500">{pat.email}</td>
                      <td className="p-4 text-slate-500">{pat.phoneNumber || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black ${pat.isVerified ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/20' : 'bg-amber-100 text-amber-800'}`}>
                          {pat.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleToggleBlock(pat._id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${pat.isBlocked ? 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 border-teal-200' : 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200'}`}
                        >
                          {pat.isBlocked ? 'Unblock Account' : 'Block Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Add Doctor Panel */}
        {activeTab === 'add-doctor' && (
          <section className="glass-card p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Register & Pre-Approve Doctor</span>
            </h3>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-6">
              
              {/* Account Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Full Name</label>
                  <input type="text" className="glass-input text-xs" placeholder="Dr. Alexis Vance" value={addDocName} onChange={(e) => setAddDocName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Email Address</label>
                  <input type="email" className="glass-input text-xs" placeholder="alexis@bookadoctor.com" value={addDocEmail} onChange={(e) => setAddDocEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Account Password</label>
                  <input type="password" className="glass-input text-xs" placeholder="••••••••" value={addDocPassword} onChange={(e) => setAddDocPassword(e.target.value)} required />
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Phone Number</label>
                  <input type="text" className="glass-input text-xs" placeholder="555-0199" value={addDocPhone} onChange={(e) => setAddDocPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Gender</label>
                  <select className="glass-input text-xs" value={addDocGender} onChange={(e) => setAddDocGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Date of Birth</label>
                  <input type="date" className="glass-input text-xs text-slate-500" value={addDocDob} onChange={(e) => setAddDocDob(e.target.value)} required />
                </div>
              </div>

              {/* Clinical Verification Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Specialization</label>
                  <select className="glass-input text-xs" value={addDocSpec} onChange={(e) => setAddDocSpec(e.target.value)}>
                    {[
                      'General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic',
                      'Pediatrician', 'Gynecologist', 'Psychiatrist', 'ENT Specialist', 'Ophthalmologist',
                      'Urologist', 'Gastroenterologist', 'Dentist', 'Pulmonologist', 'Endocrinologist',
                      'Oncologist', 'Nephrologist', 'Rheumatologist', 'Surgeon', 'Physiotherapist'
                    ].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">License Number</label>
                  <input type="text" className="glass-input text-xs" placeholder="LIC999222" value={addDocLicense} onChange={(e) => setAddDocLicense(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Qualification</label>
                  <input type="text" className="glass-input text-xs" placeholder="MD, MBBS" value={addDocQual} onChange={(e) => setAddDocQual(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Experience (Years)</label>
                  <input type="number" className="glass-input text-xs" placeholder="10" value={addDocExp} onChange={(e) => setAddDocExp(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Consultation Fee ($)</label>
                  <input type="number" className="glass-input text-xs" placeholder="120" value={addDocFee} onChange={(e) => setAddDocFee(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Hospital / Clinic Name</label>
                  <input type="text" className="glass-input text-xs" placeholder="Metro Healthcare Specialist Clinic" value={addDocHosp} onChange={(e) => setAddDocHosp(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">City</label>
                  <input type="text" className="glass-input text-xs" placeholder="Los Angeles" value={addDocCity} onChange={(e) => setAddDocCity(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Biography</label>
                  <textarea className="glass-input text-xs h-20" placeholder="Clinical practitioner profile biography details..." value={addDocBio} onChange={(e) => setAddDocBio(e.target.value)} />
                </div>
              </div>

              <button type="submit" disabled={submittingAddDoc} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-xs font-extrabold text-white rounded-xl flex items-center space-x-1.5 shadow-lg shadow-teal-500/15">
                {submittingAddDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                <span>Register & Approve Doctor</span>
              </button>
            </form>
          </section>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
