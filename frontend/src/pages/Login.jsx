import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please input all credentials');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Successfully logged in!');
      // Fetch user role to direct them
      const sessionUser = JSON.parse(localStorage.getItem('user')) || res.user;
      if (sessionUser?.role === 'Admin') {
        navigate('/admin');
      } else if (sessionUser?.role === 'Doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message || 'Login credentials invalid');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-tr from-slate-50 to-teal-50/25 dark:from-slate-950 dark:to-slate-900/30">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-slate-200/50 dark:border-slate-800/40 relative">
        
        {/* Banner */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-2 font-medium">Log in to schedule and check your clinical appointments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="email" 
                className="glass-input pl-11"
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="password" 
                className="glass-input pl-11"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-4 text-sm font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-teal-500/20 hover-scale flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            <span>Sign In</span>
          </button>

        </form>

        <p className="text-xs text-center text-slate-400 mt-6 font-medium">
          Don't have an account? <Link to="/register" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Register here</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
