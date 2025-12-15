import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface AuthProps {
  onSuccessRegister: () => void;
  onSuccessLogin: () => void;
  onBack: () => void;
  language: Language;
}

const Auth: React.FC<AuthProps> = ({ onSuccessRegister, onSuccessLogin, onBack, language }) => {
  const t = translations[language];
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (err: any) => {
    const code = err.code;
    const message = err.message;

    if (code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setDetailedError(`Domain "${domain}" is not authorized in Firebase Console > Authentication > Settings > Authorized Domains.`);
        return language === 'he' ? 'שגיאת הרשאה: הדומיין הנוכחי אינו מאושר.' : 'Unauthorized Domain Error';
    }

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found': return language === 'he' ? 'פרטי ההתחברות שגויים.' : 'Invalid credentials.';
      case 'auth/email-already-in-use': return language === 'he' ? 'המייל כבר רשום במערכת.' : 'Email already in use.';
      case 'auth/weak-password': return language === 'he' ? 'הסיסמה חלשה מדי.' : 'Password too weak.';
      case 'auth/popup-closed-by-user': return language === 'he' ? 'ההתחברות בוטלה.' : 'Sign in cancelled.';
      default: return `Error: ${code}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDetailedError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
            await updateProfile(userCredential.user, { displayName: name });
        }
        onSuccessRegister();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccessLogin();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col font-heebo overflow-hidden bg-gray-900">
      
      {/* Vibrant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x opacity-100 z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

      {/* Header / Back Button */}
      <div className="relative z-10 px-6 pt-6 flex items-center">
         <button onClick={onBack} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
             <ArrowLeft className="w-6 h-6 text-white rtl:rotate-180" />
         </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 max-w-2xl mx-auto w-full">
          <div className="mb-10 text-center sm:text-start">
            <h1 className="text-5xl font-black mb-4 tracking-tight text-white drop-shadow-lg">
              {authMode === 'register' ? t.register : t.login}
            </h1>
            <p className="text-xl text-white/90 font-medium">
                {authMode === 'register' ? t.auth_desc_register : t.auth_desc_login}
            </p>
          </div>

          {error && (
              <div className="mb-6 p-4 bg-red-900/80 border border-red-500/50 text-white rounded-2xl flex flex-col gap-2 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold">{error}</span>
                </div>
                {detailedError && (
                    <div className="mt-2 text-sm bg-black/20 p-2 rounded text-red-200 font-mono break-all">
                        {detailedError}
                    </div>
                )}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === 'register' && (
                  <div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border border-white/30 bg-white/20 text-white focus:bg-white/30 focus:border-white/50 outline-none transition text-lg placeholder-white/70 backdrop-blur-md shadow-inner"
                        placeholder={t.namePlaceholder}
                        required
                        disabled={isSubmitting}
                    />
                  </div>
              )}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-white/30 bg-white/20 text-white focus:bg-white/30 focus:border-white/50 outline-none transition text-lg placeholder-white/70 backdrop-blur-md shadow-inner"
                  placeholder={t.emailPlaceholder}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-white/30 bg-white/20 text-white focus:bg-white/30 focus:border-white/50 outline-none transition text-lg placeholder-white/70 backdrop-blur-md shadow-inner"
                  placeholder={t.passwordPlaceholder}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all transform hover:-translate-y-1 text-purple-900 text-xl bg-white active:scale-95 mt-4"
              >
                {isSubmitting ? '...' : (authMode === 'register' ? t.register : t.login)}
              </button>
          </form>

          <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                disabled={isSubmitting}
                className="text-white hover:text-blue-200 hover:underline font-bold text-lg transition-colors"
              >
                {authMode === 'login' ? t.register : t.login}
              </button>
          </div>
      </div>
    </div>
  );
};

export default Auth;