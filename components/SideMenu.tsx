import React from 'react';
import { X, MessageSquarePlus, Clock, History } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNewChat: () => void;
  onHistory: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, language, onNewChat, onHistory }) => {
  const t = translations[language];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 ${language === 'he' ? 'right-0' : 'left-0'} h-full w-80 bg-gray-900/95 backdrop-blur-xl border-${language === 'he' ? 'l' : 'r'} border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : (language === 'he' ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black text-white tracking-widest">AVAN</h2>
             <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition">
               <X className="w-6 h-6" />
             </button>
          </div>

          <div className="space-y-3 flex-1">
             <button 
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full p-4 flex items-center gap-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 rounded-2xl text-blue-100 transition-all group"
             >
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquarePlus className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-lg">{t.newChat}</span>
             </button>

             <div className="pt-6 space-y-3">
                <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider px-2">{t.projects}</h3>
                <button 
                    className="w-full p-3 flex items-center gap-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
                >
                   <Clock className="w-5 h-5 text-gray-500" />
                   <span>{t.prevProjects}</span>
                </button>

                {/* Distinct History Button */}
                <button 
                    onClick={() => { onHistory(); onClose(); }}
                    className="w-full p-4 mt-4 flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-2xl text-white hover:bg-gray-700 transition shadow-lg relative overflow-hidden group"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                   <History className="w-6 h-6 text-purple-400" />
                   <span className="font-bold tracking-wide">{t.fullHistory}</span>
                </button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;