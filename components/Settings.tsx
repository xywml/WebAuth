import React, { useState } from 'react';
import { OTPAccount, Language, Theme } from '../types';
import { t } from '../services/i18n';
import { Download, Upload, AlertTriangle, CheckCircle, Moon, Sun, Monitor, Globe, ChevronLeft } from 'lucide-react';

interface SettingsProps {
  accounts: OTPAccount[];
  onImport: (accounts: OTPAccount[]) => void;
  onBack: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  accounts, 
  onImport, 
  onBack,
  lang,
  setLang,
  theme,
  setTheme
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `authenticator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMsg({ text: 'Backup downloaded successfully.', type: 'success' });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        const valid = parsed.every((a: any) => a.secret && a.label);
        if (valid) {
           onImport(parsed);
           setMsg({ text: t(lang, 'importSuccess'), type: 'success' });
           setJsonInput('');
        } else {
           throw new Error("Invalid format");
        }
      } else {
        throw new Error("Input must be an array");
      }
    } catch (e) {
      setMsg({ text: t(lang, 'importError'), type: 'error' });
    }
  };

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
      {children}
    </h3>
  );

  return (
    <div className="max-w-xl mx-auto space-y-10 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-4 mb-6">
         <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-900 dark:text-gray-100" />
         </button>
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t(lang, 'settings')}</h2>
      </div>

      {msg && (
        <div className={`p-4 rounded-md flex items-center gap-3 text-sm ${
          msg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900' 
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
          {msg.text}
        </div>
      )}

      {/* Preferences Section */}
      <div>
        <SectionTitle>Preferences</SectionTitle>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          
          {/* Theme Selector */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">{t(lang, 'theme')}</span>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['light', 'system', 'dark'] as Theme[]).map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => setTheme(tVal)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    theme === tVal 
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t(lang, tVal)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <Globe size={18} />
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">{t(lang, 'language')}</span>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  lang === 'en' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  lang === 'zh' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                中文
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div>
        <SectionTitle>Data</SectionTitle>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Download size={18} />
                </div>
                <div>
                   <h4 className="font-medium text-gray-900 dark:text-gray-100">{t(lang, 'exportBackup')}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t(lang, 'exportDesc')}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleExport}
              className="w-full mt-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t(lang, 'downloadJson')}
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Upload size={18} />
              </div>
              <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{t(lang, 'importBackup')}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t(lang, 'importDesc')}</p>
              </div>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-24 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-300 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none mb-3 resize-none"
              placeholder='[{"secret": "...", "label": "..."}]'
            />
            <button 
              onClick={handleImport}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t(lang, 'importBtn')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
        <p>{t(lang, 'privacy')}</p>
      </div>
    </div>
  );
};