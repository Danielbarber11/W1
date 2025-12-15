import React, { useState } from 'react';
import { Home, Settings, Accessibility, Search, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface BottomNavProps {
  language: Language;
  onHome: () => void;
  onSettings: () => void;
  onAccessibility: () => void;
  onSearch: (query: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ language, onHome, onSettings, onAccessibility, onSearch }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto transition-all duration-300">
        
        {/* Navigation Ellipse (Collapses when search is open) */}
        {!isSearchOpen ? (
          <div className="glass-dark px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl animate-in zoom-in duration-300">
            <button onClick={onHome} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-400 transition">
               <Home className="w-6 h-6" />
               <span className="text-[10px] font-medium">{t.home}</span>
            </button>
            <div className="w-px h-8 bg-white/10"></div>
            <button onClick={onSettings} className="flex flex-col items-center gap-1 text-gray-400 hover:text-purple-400 transition">
               <Settings className="w-6 h-6" />
               <span className="text-[10px] font-medium">{t.settings}</span>
            </button>
            <div className="w-px h-8 bg-white/10"></div>
            <button onClick={onAccessibility} className="flex flex-col items-center gap-1 text-gray-400 hover:text-green-400 transition">
               <Accessibility className="w-6 h-6" />
               <span className="text-[10px] font-medium">{t.accessibility}</span>
            </button>
          </div>
        ) : (
          /* Collapsed Nav Button */
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="w-12 h-12 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/20 transition shadow-xl"
          >
            {language === 'he' ? <ArrowLeft className="w-6 h-6 rotate-180" /> : <ArrowLeft className="w-6 h-6" />}
          </button>
        )}

        {/* Search Button / Bar */}
        <div className={`transition-all duration-500 ease-out ${isSearchOpen ? 'w-64 sm:w-80' : 'w-14'}`}>
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="w-full h-14 glass-dark rounded-full flex items-center px-4 shadow-2xl border border-blue-500/30">
               <input
                 type="text"
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={t.search}
                 className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none px-2"
               />
               <button type="submit" className="p-2 bg-blue-600 rounded-full text-white shadow-lg">
                 <Search className="w-4 h-4" />
               </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-14 h-14 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition shadow-xl border border-white/10"
            >
              <Search className="w-6 h-6" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default BottomNav;