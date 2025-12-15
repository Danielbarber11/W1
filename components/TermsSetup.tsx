import React from 'react';
import { translations } from '../utils/translations';
import { Language } from '../types';
import { CheckCircle, ShieldCheck, Database, Scale } from 'lucide-react';

interface TermsSetupProps {
  view: 'TERMS' | 'SETUP_COMPLETE';
  language: Language;
  onNext: () => void;
}

const TermsSetup: React.FC<TermsSetupProps> = ({ view, language, onNext }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gray-900 font-heebo">
      {/* Vibrant Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-md glass p-8 rounded-3xl border border-white/20 text-center animate-tilt shadow-2xl">
        
        {view === 'TERMS' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">{t.termsTitle}</h2>
            <div className="h-64 overflow-y-auto bg-black/20 p-4 rounded-xl text-start text-white/90 text-sm leading-relaxed custom-scrollbar border border-white/10 space-y-4 shadow-inner">
              <p className="font-bold">{t.termsText}</p>
              
              <div className="flex gap-2 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                  <Scale className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
                  <p>{t.legalDisclaimer}</p>
              </div>

              <div className="flex gap-2 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                  <Database className="w-5 h-5 text-green-300 flex-shrink-0 mt-1" />
                  <p>{t.localStorageWarning}</p>
              </div>

              <p className="mt-2 text-xs opacity-60 text-center">
                  By clicking approve, you acknowledge that this is a client-side AI tool.
              </p>
            </div>
            <button
              onClick={onNext}
              className="w-full py-3.5 bg-white text-purple-900 font-bold rounded-xl shadow-lg hover:shadow-white/20 transition-all active:scale-95 text-lg"
            >
              {t.approve}
            </button>
          </div>
        )}

        {view === 'SETUP_COMPLETE' && (
          <div className="flex flex-col items-center gap-8 py-8">
            <h1 className="text-6xl font-black text-white drop-shadow-xl tracking-tight">
              IVAN
            </h1>
            <div className="relative">
               <div className="absolute inset-0 bg-white blur-xl opacity-30 rounded-full"></div>
               <CheckCircle className="w-24 h-24 text-white relative z-10 drop-shadow-md" />
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{t.setupComplete}</h2>
                <p className="text-white/80 text-lg">{t.startUsing}</p>
            </div>

            <button
              onClick={onNext}
              className="w-full py-4 bg-white text-purple-900 font-bold text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all mt-4"
            >
              {t.start}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsSetup;