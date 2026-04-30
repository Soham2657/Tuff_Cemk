import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TuffCemkLogo from '../assets/TuffCemklogo.png';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';

  const handleNavigate = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <aside className={`fixed left-0 top-0 h-full w-70 z-50 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900 shadow-sm flex flex-col p-4 sm:p-6 gap-2 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Header */}
      <button 
        onClick={() => handleNavigate('/')} 
        className="flex items-center gap-3 mb-6 sm:mb-8 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors p-2 -mx-2 cursor-pointer group"
      >
        <img 
          src={TuffCemkLogo}
          alt="TuffCemk" 
          className="w-14 h-14 sm:w-16 sm:h-16 object-cover group-hover:scale-110 transition-transform rounded-full border-2 border-primary shrink-0" 
        />
        <div className="min-w-0">
          <h1 className="font-h3 text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight truncate">TuffCemk</h1>
          <p className="font-label-sm text-[11px] sm:text-[12px] font-medium text-slate-500 truncate">College is in your pocket(sus)</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onClose}
        className="md:hidden self-end -mt-2 mb-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
        aria-label="Close navigation menu"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-1 font-['Plus_Jakarta_Sans'] text-[14px] overflow-y-auto pr-1">
        <Link 
          to="/" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className={`material-symbols-outlined ${path === '/' ? 'icon-fill' : ''}`}>dashboard</span>
          Dashboard
        </Link>
        <Link 
          to="/notifications" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/notifications' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          Notifications
        </Link>
        <Link 
          to="/ai" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/ai' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">smart_toy</span>
          AI Assistant
        </Link>
        <Link 
          to="/canteen" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/canteen' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">restaurant</span>
          Canteen
        </Link>
        <Link 
          to="/events" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/events' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Events
        </Link>
        <Link 
          to="/clubs" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/clubs' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">groups</span>
          Clubs
        </Link>
        {isAdmin && (
          <Link 
            to="/admin" 
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/admin' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined">manage_accounts</span>
            Admin Panel
          </Link>
        )}
        <Link 
          to="/announcements" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/announcements' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">campaign</span>
          Announcements
        </Link>
        <Link 
          to="/schedule" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/schedule' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">event_note</span>
          Schedule
        </Link>
        <Link 
          to="/profile" 
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/profile' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">person</span>
          Profile
        </Link>
      </nav>

      {/* CTA */}
      <div className="mt-auto mb-6">
        <button onClick={() => handleNavigate('/ai')} className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined icon-fill text-[18px]">smart_toy</span>
          AI Assistant
        </button>
      </div>

      {/* Footer Nav */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-1 font-['Plus_Jakarta_Sans'] text-[14px]">
        <a className="flex items-center gap-3 text-slate-500 dark:text-slate-400 px-4 py-2 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all" href="#">
          <span className="material-symbols-outlined text-[20px]">help</span>
          Help Center
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
