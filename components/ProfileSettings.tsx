import React from 'react';
import { User, LogOut, ArrowLeft, Trash2, Download, Upload, Edit2 } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { translations } from '../utils/translations';
import { auth } from '../firebase';
import { deleteUser, signOut } from 'firebase/auth';

interface ProfileSettingsProps {
  user: UserProfile;
  language: Language;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, language, onBack, onLogout }) => {
  const t = translations[language];

  const handleExportData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avan_data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Warning: This overwrites current local storage
        Object.keys(json).forEach(key => {
            localStorage.setItem(key, json[key]);
        });
        alert("Data imported successfully. App will reload.");
        window.location.reload();
      } catch (err) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
        try {
            await deleteUser(auth.currentUser!);
            onLogout();
        } catch (e) {
            alert("Error deleting account. Please login again and try.");
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-heebo pt-20 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-black z-0"></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold">{t.profile}</h1>
            </div>

            {/* Profile Card */}
            <div className="glass p-6 rounded-3xl mb-6 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl overflow-hidden mb-4 relative">
                     {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                            <User className="w-10 h-10" />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <Edit2 className="w-6 h-6 text-white" />
                     </div>
                </div>
                <h2 className="text-2xl font-bold">{user.displayName || "User"}</h2>
                <p className="text-gray-400">{user.email}</p>
                
                <div className="mt-6 flex flex-col w-full gap-3">
                     <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition">
                        <Edit2 className="w-4 h-4" />
                        {t.editProfile}
                     </button>
                     <button onClick={onLogout} className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-xl flex items-center justify-center gap-2 transition">
                        <LogOut className="w-4 h-4" />
                        {t.logout}
                     </button>
                </div>
            </div>

            {/* Data Management */}
            <div className="glass p-6 rounded-3xl mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-200">Data Management</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleExportData} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition gap-2">
                        <Download className="w-8 h-8 text-green-400" />
                        <span className="text-sm">{t.saveData}</span>
                    </button>
                    <label className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition gap-2 cursor-pointer">
                        <Upload className="w-8 h-8 text-blue-400" />
                        <span className="text-sm">{t.importData}</span>
                        <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>
                </div>
            </div>

             {/* Danger Zone */}
             <div className="p-4 border border-red-900/50 bg-red-900/10 rounded-2xl">
                <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-4 h-4" />
                    {t.deleteAccount}
                </button>
             </div>

        </div>
    </div>
  );
};

export default ProfileSettings;