import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { Globe, ChevronDown } from 'lucide-react';

interface WelcomeScreenProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ currentLanguage, setLanguage, onStart }) => {
  const t = translations[currentLanguage];
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 relative overflow-hidden font-heebo bg-gray-900">
      {/* Vibrant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
      
      <div className="relative z-10 flex flex-col items-center mt-20 text-center w-full">
        <h1 className="text-6xl sm:text-7xl font-sans font-black text-white mb-4 drop-shadow-lg tracking-wide">
          AVAN AI
        </h1>
        <p className="text-2xl sm:text-3xl text-white/90 font-sans font-normal tracking-wide uppercase border-b border-white/30 pb-2">
          {t.welcome}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8 mb-16 items-center">
        
        {/* Animated Ellipse Language Selector */}
        <div className="relative z-20">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-48 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-between px-6 text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>{languages.find(l => l.code === currentLanguage)?.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown with Effect */}
            <div className={`absolute bottom-14 left-0 w-48 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 origin-bottom shadow-2xl ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {languages.map(lang => (
                        <button 
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/10 rounded-xl transition ${currentLanguage === lang.code ? 'bg-blue-600/50 text-white' : 'text-white'}`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="font-medium">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Wider Start Button */}
        <button
          onClick={onStart}
          className="w-72 h-16 bg-white text-purple-900 font-bold text-2xl rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all transform duration-300 tracking-wider uppercase font-sans"
        >
          {t.start}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;