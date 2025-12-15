import React from 'react';
import { User, Menu, Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onOpenMenu: () => void;
  onOpenProfile: () => void; 
  onOpenSettings: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenMenu, onOpenProfile, onOpenSettings, onGoHome }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-transparent z-40 flex items-center justify-between px-6 pt-4">
      {/* Menu (Hamburger) */}
      <button 
        onClick={onOpenMenu}
        className="p-2 bg-white/20 dark:bg-white/10 rounded-full text-gray-900 dark:text-white hover:bg-white/40 dark:hover:bg-white/20 transition backdrop-blur-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Center: Logo */}
      <div 
        onClick={onGoHome} 
        className="text-2xl font-black text-gray-900 dark:text-white cursor-pointer select-none tracking-wider drop-shadow-sm"
      >
        AVAN
      </div>

      {/* Profile & Settings Group */}
      <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 bg-white/20 dark:bg-white/10 rounded-full text-gray-900 dark:text-white hover:bg-white/40 dark:hover:bg-white/20 transition backdrop-blur-md"
          >
            <Settings className="w-6 h-6" />
          </button>

          <button
            onClick={onOpenSettings} 
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/20 shadow-lg hover:border-white transition"
          >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                </div>
              )}
          </button>
      </div>
    </header>
  );
};

export default Header;