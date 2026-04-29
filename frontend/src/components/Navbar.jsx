import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Coffee } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-surface-variant sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary">
            CampusHub
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors font-medium">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/canteen" className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors font-medium">
              <Coffee size={18} /> Canteen
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-on-surface">{user?.name || 'User'}</p>
              <p className="text-xs text-on-surface-variant">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
