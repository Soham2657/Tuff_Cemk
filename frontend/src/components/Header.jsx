import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center h-16 px-8 w-full sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-40 border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      {/* Search (Left) */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center w-full h-10 rounded-full bg-gradient-to-r from-surface-container-highest/50 to-surface-container-low/50 border border-secondary/30 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/50 transition-all hover:border-secondary/50">
          <span className="material-symbols-outlined absolute left-3 text-secondary">search</span>
          <input 
            className="w-full h-full bg-transparent border-none pl-10 pr-4 rounded-full font-body-md text-[16px] text-on-surface focus:ring-0 placeholder:text-outline/70 focus:outline-none" 
            placeholder="Search campus..." 
            type="text" 
          />
        </div>
      </div>
      
      {/* Actions (Right) */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button onClick={() => navigate('/ai')} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:scale-95"
          title="Sign Out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
        
        <div className="ml-4 pl-4 border-l border-slate-200 h-8 flex items-center">
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full shadow-sm border border-slate-200 bg-primary flex items-center justify-center text-white font-bold text-xs overflow-hidden"
            title="View Profile"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
