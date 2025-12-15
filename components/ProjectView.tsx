import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, Paperclip, Code, Eye, Sparkles, Copy, Download, Save, Settings } from 'lucide-react';
import { Project, ChatMessage, UserProfile, Language } from '../types';
import { generateCodeResponse } from '../services/geminiService';
import { translations } from '../utils/translations';

interface ProjectViewProps {
  project: Project;
  user: UserProfile;
  language: Language;
  onBack: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, user, language, onBack, onOpenProfile, onOpenSettings }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`project_${project.id}_messages`);
    return saved ? JSON.parse(saved) : (project.messages || []);
  });
  
  const [codePreview, setCodePreview] = useState<string>(() => {
    const saved = localStorage.getItem(`project_${project.id}_code`);
    return saved || project.currentCode || '';
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [showWorkspace, setShowWorkspace] = useState(false);
  
  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(project.name);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(`project_${project.id}_messages`, JSON.stringify(messages));
    localStorage.setItem(`project_${project.id}_code`, codePreview);
  }, [messages, codePreview, project.id]);

  // Auto-Start AI Generation if it's a new project
  useEffect(() => {
    const initAI = async () => {
        if (messages.length === 1 && messages[0].role === 'user' && !codePreview && !isTyping) {
            setIsTyping(true);
            const initialRequest = messages[0].text;
            const aiResponseText = await generateCodeResponse(initialRequest, [], '', language);
            processAIResponse(aiResponseText);
        }
    };
    initAI();
  }, []);

  const processAIResponse = (aiResponseText: string) => {
    const codeBlockRegex = /```html\n([\s\S]*?)```|```([\s\S]*?)```/i;
    const match = aiResponseText.match(codeBlockRegex);
    
    let displayMessage = aiResponseText;
    let newCode = null;

    if (match) {
      newCode = match[1] || match[2];
      displayMessage = aiResponseText.replace(match[0], '').trim();
      if (!displayMessage) {
        displayMessage = t.websiteReady;
      }
    }

    if (newCode) {
      setCodePreview(newCode);
      setShowWorkspace(true);
      setViewMode('preview');
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: displayMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const historyText = messages.slice(-3).map(m => m.text); 
    const aiResponseText = await generateCodeResponse(userText, historyText, codePreview, language);
    processAIResponse(aiResponseText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Read file content
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            // Append file content to the input buffer
            setInput(prev => prev + `\n\n[FILE CONTENT: ${file.name}]\n${content}\n[/FILE]\n`);
        };
        reader.readAsText(file);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codePreview);
    alert(t.copyCode + " OK");
  };

  const handleDownloadCode = () => {
    const blob = new Blob([codePreview], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveProject = () => {
    const savedProjectsStr = localStorage.getItem('savedProjects');
    let savedProjects: Project[] = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
    savedProjects = savedProjects.filter(p => p.id !== project.id);
    const projectToSave: Project = { ...project, name: projectName || "Untitled Project", currentCode: codePreview, messages: messages };
    savedProjects.unshift(projectToSave);
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
    setIsSaveModalOpen(false);
    alert(t.projectSaved);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden relative font-heebo text-gray-900 dark:text-white">
      
      {/* Top Header - Project View specific */}
      <div className="absolute top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-4 pt-4 bg-gradient-to-b from-white/90 dark:from-gray-900/90 to-transparent pointer-events-none">
          
          {/* Left Side (Back) */}
          <div className="pointer-events-auto">
             <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20">
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
             </button>
          </div>

          {/* Center (Toggle) */}
          <div className="pointer-events-auto flex items-center gap-3">
             <div className="h-12 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-full border border-gray-200 dark:border-white/10 flex items-center p-1 shadow-xl">
                    <button 
                        onClick={() => { setShowWorkspace(true); setViewMode('preview'); }}
                        className={`px-6 h-full rounded-full text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'preview' && showWorkspace ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.preview}</span>
                    </button>
                    <button 
                        onClick={() => { setShowWorkspace(true); setViewMode('code'); }}
                        className={`px-6 h-full rounded-full text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'code' && showWorkspace ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                        <Code className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.code}</span>
                    </button>
             </div>
          </div>
          
          {/* Right Side (Settings + Profile) */}
          <div className="pointer-events-auto flex items-center gap-2">
             <button onClick={onOpenSettings} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20">
                <Settings className="w-5 h-5" />
             </button>
             <button onClick={onOpenSettings} className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : <div className="bg-indigo-600 w-full h-full flex items-center justify-center"><User className="w-5 h-5 text-white"/></div>}
             </button>
          </div>
      </div>

      {/* Workspace Overlay */}
      <div className={`fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#1e1e1e] transition-all duration-300 transform ${showWorkspace ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
         <div className="h-14 flex items-center justify-between px-4 bg-gray-100 dark:bg-black/40 border-b border-gray-200 dark:border-white/5">
             <div className="flex items-center gap-2">
                 <button onClick={() => setShowWorkspace(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                     <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 rtl:rotate-180" />
                 </button>
                 <span className="font-bold text-gray-700 dark:text-gray-200">{viewMode === 'preview' ? t.preview : t.code}</span>
             </div>
             
             {viewMode === 'code' && (
                <div className="flex items-center gap-2">
                    <button onClick={handleCopyCode} title={t.copyCode} className="p-2 hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300">
                        <Copy className="w-5 h-5" />
                    </button>
                    <button onClick={handleDownloadCode} title={t.downloadCode} className="p-2 hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsSaveModalOpen(true)} title={t.saveProject} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">{t.save}</span>
                    </button>
                </div>
             )}

             {viewMode === 'preview' && (
                 <div className="flex bg-gray-200 dark:bg-white/10 rounded-lg p-1">
                     <button onClick={() => setViewMode('preview')} className={`px-3 py-1 rounded-md text-sm transition ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.preview}</button>
                     <button onClick={() => setViewMode('code')} className={`px-3 py-1 rounded-md text-sm transition ${viewMode === 'code' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{t.code}</button>
                 </div>
             )}
         </div>

         <div className="flex-1 relative overflow-hidden">
             {viewMode === 'preview' ? (
                 <iframe 
                    title="preview"
                    srcDoc={codePreview}
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts"
                 />
             ) : (
                 <div className="w-full h-full overflow-auto custom-scrollbar p-4">
                     <pre className="font-mono text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{codePreview}</pre>
                 </div>
             )}
         </div>
      </div>

      {/* Save Project Modal */}
      {isSaveModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t.saveProject}</h3>
                  <input 
                    type="text" 
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder={t.projectNamePlaceholder}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex gap-3">
                      <button onClick={() => setIsSaveModalOpen(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium">{t.cancel}</button>
                      <button onClick={handleSaveProject} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">{t.save}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col pt-20 pb-24 relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
             {messages.length === 0 && (
                 <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-50">
                     <Sparkles className="w-16 h-16 mb-4" />
                     <p>{t.describeProject}</p>
                 </div>
             )}
             {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-white/5'}`}>
                  {msg.text.split('[FILE CONTENT:').map((part, i) => i === 0 ? part : `\n[File Attached]`).join('')}
                </div>
              </div>
            ))}
            
            {/* Thinking Animation (Eye) */}
            {isTyping && (
                <div className="flex justify-end w-full">
                    <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-6 py-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 animate-pulse rounded-full"></div>
                            <Eye className="w-6 h-6 text-blue-500 animate-pulse" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide animate-pulse">
                            {t.generating}
                        </span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 p-4 z-30 pb-6 sm:pb-4">
            <div className="max-w-4xl mx-auto relative flex items-end bg-gray-100 dark:bg-black/40 rounded-3xl border border-gray-200 dark:border-white/10 p-1.5 shadow-lg">
                
                <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept=".html,.css,.js,.txt,.json,.ts,.tsx" />
                <button onClick={handleFileUpload} disabled={isTyping} className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition">
                    <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isTyping ? t.generating : t.typeRequest}
                  disabled={isTyping}
                  className="flex-1 p-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 resize-none h-12 max-h-32 focus:outline-none custom-scrollbar disabled:opacity-50"
                />
                
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="m-1 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all shadow-md"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>
      </div>
      
    </div>
  );
};

export default ProjectView;