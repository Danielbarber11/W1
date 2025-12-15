import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile, AppView, Project, AccessibilitySettings, Language } from '../types';
import { translations } from '../utils/translations';
import { ArrowUp, ArrowLeft, History, Code } from 'lucide-react';

// Components
import WelcomeScreen from './WelcomeScreen';
import Auth from './Auth';
import TermsSetup from './TermsSetup';
import ProjectView from './ProjectView';
import SettingsModal from './SettingsModal';
import SideMenu from './SideMenu';
import BottomNav from './BottomNav';
import Header from './Header';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.WELCOME);
  const [language, setLanguage] = useState<Language>('en'); 
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [homeInput, setHomeInput] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'profile' | 'accessibility' | 'security' | 'about' | 'help'>('general');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Reverted to default dark to ensure "color effects" are visible
    const defaults: AccessibilitySettings = {
          theme: 'dark', 
          soundEnabled: true, 
          largeText: false,
          wordSpacing: false,
          letterSpacing: false,
          grayscale: false,
          invertColors: false,
          highlightLinks: false,
          bigCursor: false,
          readingGuide: false,
          hideImages: false,
          readableFont: false,
          highContrast: false,
          reduceMotion: false,
          screenReaderOptimized: false,
    };
    try {
        const saved = localStorage.getItem('avan_settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
        return defaults;
    }
  });

  // Apply Accessibility Styles
  useEffect(() => {
    localStorage.setItem('avan_settings', JSON.stringify(settings));
    const root = document.documentElement;
    const body = document.body;

    // Theme
    if (settings.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    // Accessibility Classes
    root.classList.toggle('text-lg-mode', settings.largeText);
    root.classList.toggle('word-spacing-mode', settings.wordSpacing);
    root.classList.toggle('letter-spacing-mode', settings.letterSpacing);
    root.classList.toggle('grayscale-mode', settings.grayscale);
    root.classList.toggle('invert-mode', settings.invertColors);
    root.classList.toggle('highlight-links-mode', settings.highlightLinks);
    root.classList.toggle('big-cursor-mode', settings.bigCursor);
    root.classList.toggle('hide-images-mode', settings.hideImages);
    root.classList.toggle('readable-font-mode', settings.readableFont);
    
    // Reading Guide Logic
    const guideId = 'reading-guide-line';
    let guide = document.getElementById(guideId);
    if (settings.readingGuide) {
        if (!guide) {
            guide = document.createElement('div');
            guide.id = guideId;
            guide.style.position = 'fixed';
            guide.style.height = '4px';
            guide.style.width = '100%';
            guide.style.backgroundColor = 'red';
            guide.style.zIndex = '99999';
            guide.style.pointerEvents = 'none';
            document.body.appendChild(guide);
            window.addEventListener('mousemove', (e) => {
                if(guide) guide.style.top = `${e.clientY}px`;
            });
        }
        guide.style.display = 'block';
    } else if (guide) {
        guide.style.display = 'none';
    }

  }, [settings]);

  // Init
  useEffect(() => {
    const savedLang = localStorage.getItem('avan_language') as Language;
    if (savedLang) setLanguage(savedLang);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        if (currentView === AppView.WELCOME || currentView === AppView.AUTH) {
          setCurrentView(AppView.HOME);
        }
      } else {
        setUser(null);
        if (currentView !== AppView.WELCOME && currentView !== AppView.AUTH) {
           setCurrentView(AppView.WELCOME);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('avan_language', language);
    document.documentElement.dir = (language === 'he' || language === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Load History when viewing history
  useEffect(() => {
    if (currentView === AppView.HISTORY) {
        const historyStr = localStorage.getItem('savedProjects');
        if (historyStr) {
            setSavedProjects(JSON.parse(historyStr));
        } else {
            setSavedProjects([]);
        }
    }
  }, [currentView]);

  const handleCreateProject = () => {
    if (!homeInput.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: homeInput.substring(0, 20) + '...',
      createdAt: Date.now(),
      messages: [{
        id: 'init',
        role: 'user',
        text: homeInput,
        timestamp: Date.now()
      }]
    };
    
    setCurrentProject(newProject);
    setCurrentView(AppView.PROJECT);
    setHomeInput('');
  };

  const handleOpenSavedProject = (proj: Project) => {
      setCurrentProject(proj);
      setCurrentView(AppView.PROJECT);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentView(AppView.WELCOME);
    setCurrentProject(null);
    setIsSideMenuOpen(false);
    setIsSettingsOpen(false);
  };

  const openSettings = (tab: 'general' | 'profile' | 'accessibility' = 'general') => {
      setSettingsTab(tab);
      setIsSettingsOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (currentView === AppView.WELCOME) {
    return (
        <WelcomeScreen 
            currentLanguage={language} 
            setLanguage={setLanguage} 
            onStart={() => setCurrentView(AppView.AUTH)}
        />
    );
  }

  if (currentView === AppView.AUTH) {
    return <Auth language={language} onBack={() => setCurrentView(AppView.WELCOME)} onSuccessRegister={() => setCurrentView(AppView.TERMS)} onSuccessLogin={() => setCurrentView(AppView.HOME)} />;
  }

  if (currentView === AppView.TERMS) {
    return <TermsSetup view="TERMS" language={language} onNext={() => setCurrentView(AppView.SETUP_COMPLETE)} />;
  }

  if (currentView === AppView.SETUP_COMPLETE) {
    return <TermsSetup view="SETUP_COMPLETE" language={language} onNext={() => setCurrentView(AppView.HOME)} />;
  }

  const t = translations[language];

  return (
    <div className={`min-h-screen relative overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 font-heebo`}>
      <style>{`
        .text-lg-mode * { font-size: 110% !important; }
        .word-spacing-mode * { word-spacing: 0.16em !important; }
        .letter-spacing-mode * { letter-spacing: 0.05em !important; }
        .grayscale-mode { filter: grayscale(100%); }
        .invert-mode { filter: invert(100%); background: #111; }
        .highlight-links-mode a, .highlight-links-mode button { text-decoration: underline !important; color: #ffff00 !important; background-color: #000 !important; }
        .big-cursor-mode { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2"><path d="M5.5 1l7.5 19l2.5-7.5l7.5-2.5l-19-7.5z"/></svg>') 16 16, auto !important; }
        .hide-images-mode img, .hide-images-mode video { display: none !important; }
        .readable-font-mode * { font-family: Arial, Helvetica, sans-serif !important; }
      `}</style>

      {/* Header (Hidden on Project View) */}
      {currentView !== AppView.PROJECT && (
        <Header 
            user={user!} 
            onOpenMenu={() => setIsSideMenuOpen(true)}
            onOpenProfile={() => openSettings('profile')}
            onOpenSettings={() => openSettings('general')}
            onGoHome={() => setCurrentView(AppView.HOME)}
        />
      )}

      {currentView === AppView.HOME && (
        <main className="h-screen w-full relative flex flex-col items-center justify-center overflow-hidden">
           {/* Vibrant Background restored */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x opacity-100 z-0"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
           
           <div className="relative z-10 flex flex-col items-center gap-2 mb-32 text-center">
              <h1 className="text-4xl font-light text-white/90 drop-shadow-md">{t.hello}</h1>
              <h2 className="text-5xl font-bold text-white drop-shadow-lg">
                {user?.displayName || "Avan User"}
              </h2>
           </div>

           {/* Fixed Bottom Input */}
           <div className="fixed bottom-10 left-0 right-0 px-6 z-20 flex justify-center w-full">
              <div className="w-full max-w-2xl p-2 rounded-[2rem] flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
                 <input 
                   type="text" 
                   value={homeInput}
                   onChange={(e) => setHomeInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                   placeholder={t.typeRequest}
                   className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 text-lg placeholder-white/70"
                 />
                 <button 
                   onClick={handleCreateProject}
                   className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-900 hover:scale-110 active:scale-95 transition-transform shadow-lg"
                 >
                    <ArrowUp className="w-6 h-6" />
                 </button>
              </div>
           </div>
        </main>
      )}

      {currentView === AppView.PROJECT && currentProject && (
        <ProjectView 
            project={currentProject} 
            user={user!}
            language={language}
            onBack={() => setCurrentView(AppView.HOME)}
            onOpenProfile={() => openSettings('profile')}
            onOpenSettings={() => openSettings('general')}
        />
      )}

      {currentView === AppView.HISTORY && (
         <div className="h-screen w-full bg-gray-900 pt-20 px-4 text-white overflow-y-auto">
             {/* Vibrant BG for History too */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black z-0 fixed"></div>
            
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-6 px-2">
                    <button onClick={() => setCurrentView(AppView.HOME)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    </button>
                    <h2 className="text-2xl font-bold text-white">{t.fullHistory}</h2>
                </div>
                
                <div className="grid gap-4 pb-24">
                {savedProjects.length > 0 ? (
                    savedProjects.map((proj) => (
                        <div key={proj.id} onClick={() => handleOpenSavedProject(proj)} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2 hover:bg-white/10 hover:shadow-lg transition cursor-pointer group">
                            <div className="flex justify-between items-start">
                                <div className="font-bold text-lg text-white group-hover:text-blue-300 transition">{proj.name}</div>
                                <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">{new Date(proj.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                                <Code className="w-3 h-3" />
                                <span>{proj.currentCode ? "Includes Code" : "Draft"}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-white/40">
                        <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>{t.noHistory}</p>
                    </div>
                )}
                </div>
            </div>
         </div>
      )}

      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)}
        language={language}
        onNewChat={() => {
           setCurrentProject(null);
           setCurrentView(AppView.HOME);
           setHomeInput('');
        }}
        onHistory={() => setCurrentView(AppView.HISTORY)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        setSettings={setSettings}
        language={language}
        initialTab={settingsTab}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default App;