import React, { useState, useEffect } from 'react';
import TuffCemkLogo from '../assets/TuffCemklogo.png';

const LoadingAnimation = ({ isLoading }) => {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      // Delay hiding to complete animation
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-white dark:bg-slate-950 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo with pulse animation */}
        <div className="relative w-32 h-32">
          <img
            src={TuffCemkLogo}
            alt="TuffCemk"
            className="w-full h-full object-contain animate-bounce"
          />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            TuffCemk
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading your campus experience...
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
