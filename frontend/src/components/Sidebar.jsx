import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin';

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] z-50 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900 shadow-sm flex flex-col p-6 gap-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined icon-fill">school</span>
        </div>
        <div>
          <h1 className="font-h3 text-[24px] font-bold text-slate-900 dark:text-white tracking-tight">TuffCemk</h1>
          <p className="font-label-sm text-[12px] font-medium text-slate-500">College is in your pocket(sus)</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-1 font-['Plus_Jakarta_Sans'] text-[14px]">
        <Link 
          to="/" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className={`material-symbols-outlined ${path === '/' ? 'icon-fill' : ''}`}>dashboard</span>
          Dashboard
        </Link>
        <Link 
          to="/notifications" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/notifications' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          Notifications
        </Link>
        <Link 
          to="/ai" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/ai' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">smart_toy</span>
          AI Assistant
        </Link>
        <Link 
          to="/canteen" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/canteen' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">restaurant</span>
          Canteen
        </Link>
        <Link 
          to="/events" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/events' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Events
        </Link>
        <Link 
          to="/clubs" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/clubs' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">groups</span>
          Clubs
        </Link>
        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/admin' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined">manage_accounts</span>
            Admin Panel
          </Link>
        )}
        <Link 
          to="/announcements" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/announcements' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">campaign</span>
          Announcements
        </Link>
        <Link 
          to="/schedule" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/schedule' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">event_note</span>
          Schedule
        </Link>
        <Link 
          to="/profile" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all active:translate-x-1 ${path === '/profile' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <span className="material-symbols-outlined">person</span>
          Profile
        </Link>
      </nav>

      {/* CTA */}
      <div className="mt-auto mb-6">
        <button onClick={() => navigate('/ai')} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
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
