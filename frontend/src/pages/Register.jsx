import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Briefcase, Award, FileText, Loader2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('Patient'); // Patient or Doctor
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('General Physician');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [biography, setBiography] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phoneNumber || !dob) {
      toast.warning('Please fill in all general fields.');
      return;
    }

    const formData = {
      fullName,
      email,
      password,
      role,
      phoneNumber,
      gender,
      dob,
      specialization,
      qualification,
      experience,
      consultationFee,
      hospitalName,
      city,
      licenseNumber,
      biography
    };

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      if (role === 'Doctor') {
        toast.success('Registration successful! Profile is pending admin approval.');
        navigate('/doctor-dashboard');
      } else {
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-tr from-slate-50 to-teal-50/25 dark:from-slate-950 dark:to-slate-900/30">
      <div className="w-full max-w-2xl p-8 rounded-3xl glass-card border border-slate-200/50 dark:border-slate-800/40 relative">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Create Account</h2>
          <p className="text-slate-400 text-xs mt-2 font-medium">Register to discover leading specialists and manage appointments</p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 p-1 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl">
          <button 
            type="button"
            onClick={() => setRole('Patient')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'Patient' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md shadow-slate-200/40 dark:shadow-none' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Register as Patient
          </button>
          <button 
            type="button"
            onClick={() => setRole('Doctor')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'Doctor' ? 'bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-md shadow-slate-200/40 dark:shadow-none' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Join as Specialist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="text" className="glass-input pl-11" placeholder="Jane Doe"
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="email" className="glass-input pl-11" placeholder="jane@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="password" className="glass-input pl-11" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="tel" className="glass-input pl-11" placeholder="9876543210"
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
              <select 
                className="glass-input" value={gender} onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Date of Birth</label>
              <input 
                type="date" className="glass-input text-slate-500"
                value={dob} onChange={(e) => setDob(e.target.value)} required
              />
            </div>
          </div>

          {/* Doctor Clinical Fields (Conditional) */}
          {role === 'Doctor' && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in duration-300">
              <h3 className="font-extrabold text-sm text-teal-600 dark:text-teal-400 tracking-wide uppercase">Clinical Verification Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specialization</label>
                  <select 
                    className="glass-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                  >
                    {[
                      'General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic',
                      'Pediatrician', 'Gynecologist', 'Psychiatrist', 'ENT Specialist', 'Ophthalmologist',
                      'Urologist', 'Gastroenterologist', 'Dentist', 'Pulmonologist', 'Endocrinologist',
                      'Oncologist', 'Nephrologist', 'Rheumatologist', 'Surgeon', 'Physiotherapist'
                    ].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">License Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" className="glass-input pl-11" placeholder="LIC123456"
                      value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Qualification</label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" className="glass-input pl-11" placeholder="MD, MBBS"
                      value={qualification} onChange={(e) => setQualification(e.target.value)} required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Experience (Years)</label>
                  <input 
                    type="number" className="glass-input" placeholder="8"
                    value={experience} onChange={(e) => setExperience(e.target.value)} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Consultation Fee ($)</label>
                  <input 
                    type="number" className="glass-input" placeholder="100"
                    value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hospital Name</label>
                  <input 
                    type="text" className="glass-input" placeholder="City Clinic Center"
                    value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" className="glass-input pl-11" placeholder="New York"
                      value={city} onChange={(e) => setCity(e.target.value)} required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biography</label>
                <textarea 
                  className="glass-input h-24" placeholder="Brief biography of clinical career..."
                  value={biography} onChange={(e) => setBiography(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-4 text-sm font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-teal-500/20 hover-scale flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
            <span>Register Account</span>
          </button>

        </form>

        <p className="text-xs text-center text-slate-400 mt-6 font-medium">
          Already have an account? <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Sign In here</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
