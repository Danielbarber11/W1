import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, Eye, User, LogOut, Trash2, HelpCircle, Info, ArrowRight, MessageSquare, ChevronRight, Volume2, VolumeX, Type, EyeOff, MousePointer2, Lock, Save, AlertTriangle } from 'lucide-react';
import { AccessibilitySettings, UserProfile, Language } from '../types';
import { translations } from '../utils/translations';
import { auth } from '../firebase';
import { deleteUser, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  setSettings: (settings: AccessibilitySettings) => void;
  language: Language;
  initialTab: 'general' | 'profile' | 'accessibility' | 'security' | 'about' | 'help';
  user: UserProfile | null;
  onLogout: () => void;
}

type SettingsView = 'MENU' | 'GENERAL' | 'ACCESSIBILITY' | 'HELP' | 'PROFILE';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, settings, setSettings, language, initialTab, user, onLogout 
}) => {
  const t = translations[language];
  const [currentView, setCurrentView] = useState<SettingsView>('MENU');

  // Profile Edit State
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || '');
  
  // Sensitive Actions State
  const [activeAction, setActiveAction] = useState<'NONE' | 'CHANGE_PASSWORD' | 'DELETE_ACCOUNT'>('NONE');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Help Bot State
  const [helpInput, setHelpInput] = useState('');
  const [helpMessages, setHelpMessages] = useState<{role: 'user'|'bot', text: string}[]>([
      {role: 'bot', text: t.help_bot_placeholder}
  ]);

  useEffect(() => {
    if (isOpen) {
        // Reset to menu when opening
        setCurrentView('MENU'); 
        setEditName(user?.displayName || '');
        setEditPhoto(user?.photoURL || '');
        setActiveAction('NONE');
        setCurrentPassword('');
        setNewPassword('');
        setActionError('');
    }
  }, [isOpen, user]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    try {
        await updateProfile(auth.currentUser, {
            displayName: editName,
            photoURL: editPhoto
        });
        alert("Profile updated successfully!");
        window.location.reload(); 
    } catch (e) {
        alert("Error updating profile");
    }
  };

  const reauth = async () => {
      if (!auth.currentUser || !auth.currentUser.email) return;
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
  };

  const handleChangePassword = async () => {
      setActionError('');
      setIsProcessing(true);
      try {
          await reauth();
          await updatePassword(auth.currentUser!, newPassword);
          alert("Password changed successfully.");
          setActiveAction('NONE');
          setCurrentPassword('');
          setNewPassword('');
      } catch (e: any) {
          console.error(e);
          setActionError("Error: Incorrect current password or weak new password.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDeleteAccount = async () => {
      setActionError('');
      setIsProcessing(true);
      try {
          await reauth();
          await deleteUser(auth.currentUser!);
          onLogout(); // This will close modal and redirect to Welcome
      } catch (e: any) {
          console.error(e);
          setActionError("Error: Incorrect password. Cannot delete account.");
      } finally {
          setIsProcessing(false);
      }
  };

  const toggleAcc = (key: keyof AccessibilitySettings) => {
      setSettings({...settings, [key]: !settings[key]});
  };

  const resetAccessibility = () => {
      setSettings({
          ...settings,
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
      });
  };

  const handleHelpSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!helpInput.trim()) return;
      const newHistory = [...helpMessages, {role: 'user', text: helpInput}];
      newHistory.push({role: 'bot', text: "Thank you for your question. Support will check this issue."});
      setHelpMessages(newHistory as any);
      setHelpInput('');
  };

  if (!isOpen) return null;

  // Render Header (User Profile) for Menu
  const renderUserHeader = () => (
      <div className="bg-gray-50 dark:bg-white/5 p-6 border-b border-gray-200 dark:border-white/10 flex flex-col items-center text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-white/10 rounded-full">
              <X className="w-5 h-5 text-gray-800 dark:text-white" />
          </button>

          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-3">
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="bg-indigo-600 w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-white"/></div>}
          </div>
          <h2 className="text-2xl font-bold">{user?.displayName || "Guest"}</h2>
          <p className="text-gray-500 mb-4">{user?.email}</p>
          
          <button 
            onClick={() => setCurrentView('PROFILE')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-500 transition"
          >
              Profile Details
          </button>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 font-heebo overflow-hidden flex flex-col">
        
        {/* If we are in MENU mode, show the big user header at the top */}
        {currentView === 'MENU' && renderUserHeader()}
        
        {/* If we are in a sub-page, show a back header */}
        {currentView !== 'MENU' && (
            <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <button onClick={() => setCurrentView('MENU')} className="p-2 mr-2 bg-gray-200 dark:bg-white/10 rounded-full rtl:rotate-180">
                    <ArrowRight className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold uppercase tracking-wider">
                    {currentView === 'GENERAL' ? t.general : currentView === 'ACCESSIBILITY' ? t.accessibility : currentView === 'PROFILE' ? 'Profile Details' : t.help}
                </h2>
                <div className="flex-1"></div>
                <button onClick={onClose}><X className="w-6 h-6" /></button>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-[#0f0f0f]">
            
            {/* --- MAIN MENU --- */}
            {currentView === 'MENU' && (
                <div className="max-w-lg mx-auto space-y-4 pt-4">
                    <button onClick={() => setCurrentView('GENERAL')} className="w-full p-5 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                 <Monitor className="w-6 h-6" />
                             </div>
                             <div className="text-left rtl:text-right">
                                 <h3 className="font-bold text-lg">{t.general}</h3>
                                 <p className="text-sm text-gray-500">Language, Sound, Theme</p>
                             </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180" />
                    </button>

                    <button onClick={() => setCurrentView('ACCESSIBILITY')} className="w-full p-5 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                                 <Eye className="w-6 h-6" />
                             </div>
                             <div className="text-left rtl:text-right">
                                 <h3 className="font-bold text-lg">{t.accessibility}</h3>
                                 <p className="text-sm text-gray-500">10 Accessibility Tools</p>
                             </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180" />
                    </button>

                    <button onClick={() => setCurrentView('HELP')} className="w-full p-5 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                                 <HelpCircle className="w-6 h-6" />
                             </div>
                             <div className="text-left rtl:text-right">
                                 <h3 className="font-bold text-lg">{t.help}</h3>
                                 <p className="text-sm text-gray-500">Support Bot, FAQ</p>
                             </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180" />
                    </button>

                    <div className="pt-8">
                        <button onClick={onLogout} className="w-full py-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl font-bold flex items-center justify-center gap-2">
                            <LogOut className="w-5 h-5" />
                            {t.logout}
                        </button>
                    </div>
                </div>
            )}

            {/* --- PROFILE DETAILS VIEW --- */}
            {currentView === 'PROFILE' && (
                <div className="max-w-xl mx-auto space-y-8">
                    {/* Basic Info */}
                    <section className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                        <h3 className="font-bold text-lg mb-4">Update Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                            <input 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Photo URL</label>
                            <input 
                                value={editPhoto} 
                                onChange={(e) => setEditPhoto(e.target.value)} 
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20"
                            />
                        </div>
                        <button onClick={handleUpdateProfile} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> Save Details
                        </button>
                    </section>

                    {/* Change Password */}
                    <section className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
                        <h3 className="font-bold text-lg mb-4">Security</h3>
                        
                        {activeAction !== 'CHANGE_PASSWORD' ? (
                             <button 
                                onClick={() => setActiveAction('CHANGE_PASSWORD')}
                                className="w-full py-3 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2"
                             >
                                <Lock className="w-4 h-4" /> Change Password
                             </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">Please verify your current password to set a new one.</p>
                                    <input 
                                        type="password"
                                        placeholder="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full p-3 mb-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20"
                                    />
                                    <input 
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20"
                                    />
                                    {actionError && <p className="text-red-500 text-sm mt-2">{actionError}</p>}
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => setActiveAction('NONE')} className="flex-1 py-2 bg-gray-300 dark:bg-white/10 rounded-lg">Cancel</button>
                                        <button onClick={handleChangePassword} disabled={isProcessing} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">{isProcessing ? '...' : 'Update Password'}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Delete Account */}
                    <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
                        <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
                        
                        {activeAction !== 'DELETE_ACCOUNT' ? (
                            <button 
                                onClick={() => setActiveAction('DELETE_ACCOUNT')}
                                className="w-full py-3 bg-white dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Account
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                                        <AlertTriangle className="w-5 h-5" /> Warning
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                        This action is irreversible. All your projects and data will be permanently deleted.
                                        <br/><br/>
                                        <strong>Enter your password to confirm deletion:</strong>
                                    </p>
                                    <input 
                                        type="password"
                                        placeholder="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-red-300 dark:border-red-900 bg-white dark:bg-black/20"
                                    />
                                    {actionError && <p className="text-red-500 text-sm mt-2">{actionError}</p>}
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => setActiveAction('NONE')} className="flex-1 py-2 bg-gray-300 dark:bg-white/10 rounded-lg">Cancel</button>
                                        <button onClick={handleDeleteAccount} disabled={isProcessing} className="flex-1 py-2 bg-red-600 text-white rounded-lg">{isProcessing ? 'Deleting...' : 'Confirm Delete'}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* --- GENERAL VIEW --- */}
            {currentView === 'GENERAL' && (
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Theme */}
                    <section className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Sun className="w-5 h-5"/> {t.theme}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setSettings({...settings, theme: 'light'})} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 ${settings.theme === 'light' ? 'border-blue-500 bg-white dark:bg-transparent text-blue-500' : 'border-transparent bg-gray-200 dark:bg-white/10'}`}>
                                <Sun className="w-5 h-5" /> {t.light}
                            </button>
                            <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 ${settings.theme === 'dark' ? 'border-purple-500 bg-white dark:bg-transparent text-purple-500' : 'border-transparent bg-gray-200 dark:bg-white/10'}`}>
                                <Moon className="w-5 h-5" /> {t.dark}
                            </button>
                        </div>
                    </section>

                    {/* Audio */}
                    <section className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             {settings.soundEnabled ? <Volume2 className="w-6 h-6 text-green-500" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
                             <span className="font-bold text-lg">Sound Effects</span>
                         </div>
                         <button 
                            onClick={() => setSettings({...settings, soundEnabled: !settings.soundEnabled})}
                            className={`w-14 h-8 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                         >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.soundEnabled ? 'left-7' : 'left-1'}`}></div>
                         </button>
                    </section>
                </div>
            )}

            {/* --- ACCESSIBILITY VIEW --- */}
            {currentView === 'ACCESSIBILITY' && (
                <div className="max-w-4xl mx-auto">
                     <div className="flex justify-end mb-4">
                         <button onClick={resetAccessibility} className="text-sm font-bold text-blue-500 underline">{t.acc_reset}</button>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { k: 'largeText', l: t.acc_largeText, i: Type },
                                { k: 'wordSpacing', l: t.acc_wordSpacing, i: Type },
                                { k: 'letterSpacing', l: t.acc_letterSpacing, i: Type },
                                { k: 'grayscale', l: t.acc_grayscale, i: EyeOff },
                                { k: 'invertColors', l: t.acc_invertColors, i: Moon },
                                { k: 'highlightLinks', l: t.acc_highlightLinks, i: MousePointer2 },
                                { k: 'bigCursor', l: t.acc_bigCursor, i: MousePointer2 },
                                { k: 'readingGuide', l: t.acc_readingGuide, i: Minus },
                                { k: 'hideImages', l: t.acc_hideImages, i: EyeOff },
                                { k: 'readableFont', l: t.acc_readableFont, i: Type },
                            ].map((opt) => (
                                <button
                                    key={opt.k}
                                    onClick={() => toggleAcc(opt.k as any)}
                                    className={`p-6 rounded-2xl border transition-all flex items-center gap-4 text-left ${settings[opt.k as keyof AccessibilitySettings] ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-400'}`}
                                >
                                    <opt.i className="w-6 h-6" />
                                    <span className="font-bold">{opt.l}</span>
                                </button>
                            ))}
                     </div>
                </div>
            )}

            {/* --- HELP VIEW --- */}
            {currentView === 'HELP' && (
                <div className="max-w-2xl mx-auto h-full flex flex-col">
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/10 mb-6 flex flex-col min-h-[300px]">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
                                {helpMessages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-4 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-white/10'}`}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleHelpSubmit} className="flex gap-2">
                                <input 
                                value={helpInput}
                                onChange={(e) => setHelpInput(e.target.value)}
                                placeholder={t.typeRequest}
                                className="flex-1 p-4 rounded-xl border dark:border-white/10 bg-white dark:bg-black/20"
                                />
                                <button type="submit" className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500">
                                    <MessageSquare className="w-6 h-6" />
                                </button>
                            </form>
                    </div>
                    
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-400 uppercase text-sm">{t.help_common_problems}</h4>
                        <button className="w-full text-left p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 flex justify-between">
                            {t.help_q1} <Info className="w-4 h-4 opacity-50"/>
                        </button>
                        <button className="w-full text-left p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 flex justify-between">
                            {t.help_q2} <Info className="w-4 h-4 opacity-50"/>
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

// Helper component for Minus icon
const Minus = ({className}:{className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/></svg>
);

export default SettingsModal;