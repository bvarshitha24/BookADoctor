import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Sun, Moon, Bell, Menu, X, User as UserIcon, LogOut, Shield, Calendar, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Doctor') return '/doctor-dashboard';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-white/10 dark:border-slate-900 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 font-bold text-xl tracking-tight">
            <Activity className="h-6 w-6 stroke-[2.5]" />
            <span className="font-extrabold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">Book a Doctor</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/search" className="text-sm font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors">Find Doctors</Link>
            <a href="/#services" className="text-sm font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors">Services</a>
            <a href="/#faq" className="text-sm font-semibold hover:text-teal-500 dark:hover:text-teal-400 transition-colors">FAQs</a>
          </div>

          {/* Actions & Menus */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Menu */}
            {user && (
              <div className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-300 relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-[10px] text-white font-extrabold flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel shadow-2xl p-4 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-250">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">Mark all as read</button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => markAsRead(n._id)}
                            className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-900 border-l-4 ${n.readStatus ? 'border-transparent' : 'border-teal-500 bg-teal-500/5'}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{n.title}</span>
                              <span className="text-[10px] text-slate-400">{new Date(n.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-500 mt-1">{n.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                  <img src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} className="h-8 w-8 rounded-full border border-teal-500/30 object-cover" alt="Profile" />
                  <span className="text-sm font-semibold truncate max-w-[120px]">{user.fullName.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel shadow-2xl p-2 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-250">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                        {user.role}
                      </span>
                    </div>
                    
                    <div className="p-1 space-y-1">
                      <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)} className="flex items-center space-x-2.5 p-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>
                      
                      {user.role === 'Admin' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center space-x-2.5 p-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <button onClick={handleLogout} className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left">
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors">Sign In</Link>
                <Link to="/register" className="px-4.5 py-2 text-sm font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-teal-500/20 hover-scale">Register</Link>
              </div>
            )}

          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-100 dark:border-slate-800 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-3">
            <Link to="/search" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-900">Find Doctors</Link>
            <a href="/#services" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-900">Services</a>
            <a href="/#faq" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-900">FAQs</a>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-xl font-semibold text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900">Dashboard</Link>
                <button onClick={handleLogout} className="px-3 py-2 rounded-xl font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left">Log Out</button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 font-bold text-white shadow-lg shadow-teal-500/10">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
