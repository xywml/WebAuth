import React, { useState, useEffect } from 'react';
import { OTPAccount, ViewState, Language, Theme } from './types';
import { OTPList } from './components/OTPList';
import { AddAccount } from './components/AddAccount';
import { QRScanner } from './components/QRScanner';
import { Settings } from './components/Settings';
import { parseURI } from './services/otpService';
import { t } from './services/i18n';
import { Plus, ScanLine, Settings as SettingsIcon, Shield, Menu } from 'lucide-react';

export default function App() {
  const [accounts, setAccounts] = useState<OTPAccount[]>([]);
  const [view, setView] = useState<ViewState>('list');
  
  // State initialization with lazy loading from localStorage
  const [lang, setLang] = useState<Language>(() => 
    (localStorage.getItem('app_lang') as Language) || 'en'
  );
  
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('app_theme') as Theme) || 'system'
  );

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Load Accounts
  useEffect(() => {
    const saved = localStorage.getItem('otp_accounts');
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load accounts", e);
      }
    }
  }, []);

  // Save Accounts
  useEffect(() => {
    localStorage.setItem('otp_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddAccount = (newAccount: OTPAccount) => {
    if (accounts.some(a => a.secret === newAccount.secret)) {
      showToast(t(lang, 'accountExists'), 'error');
      return;
    }
    setAccounts(prev => [...prev, newAccount]);
    setView('list');
    showToast(t(lang, 'accountAdded'));
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t(lang, 'confirmDelete'))) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      showToast(t(lang, 'delete'));
    }
  };

  const handleImport = (imported: OTPAccount[]) => {
    const currentSecrets = new Set(accounts.map(a => a.secret));
    const toAdd = imported.filter(a => !currentSecrets.has(a.secret));
    
    if (toAdd.length > 0) {
      setAccounts(prev => [...prev, ...toAdd]);
      showToast(t(lang, 'importSuccess'));
    } else {
      showToast(t(lang, 'importError'), 'error'); // Using reuse generic error for empty import or specifically add new key
    }
  };

  const handleScan = (data: string) => {
    const parsed = parseURI(data);
    if (parsed) {
      handleAddAccount(parsed);
    } else {
      showToast(t(lang, 'invalidQR'), 'error');
      setView('list');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    showToast(t(lang, 'copied'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* Header - Minimalist, No Gradients */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('list')}>
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Shield size={18} className="text-white dark:text-black" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">{t(lang, 'appName')}</h1>
          </div>

          <div className="flex items-center gap-2">
            {view === 'list' && (
              <>
                <button 
                  onClick={() => setView('scan-qr')}
                  className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all md:hidden"
                  title={t(lang, 'scanQR')}
                >
                  <ScanLine size={20} />
                </button>
                <button 
                  onClick={() => setView('scan-qr')}
                  className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                >
                  <ScanLine size={16} />
                  <span>{t(lang, 'scanQR')}</span>
                </button>
                
                <button 
                  onClick={() => setView('add-manual')}
                  className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black p-2 rounded-full md:rounded-md md:px-3 md:py-1.5 md:flex md:items-center md:gap-2 transition-all"
                >
                  <Plus size={20} className="md:w-4 md:h-4" />
                  <span className="hidden md:inline text-sm font-medium">{t(lang, 'addAccount')}</span>
                </button>
              </>
            )}
             <button 
              onClick={() => setView(view === 'settings' ? 'list' : 'settings')}
              className={`p-2 rounded-md transition-all ${view === 'settings' ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={t(lang, 'settings')}
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {view === 'list' && (
          <OTPList 
            accounts={accounts} 
            onDelete={handleDelete} 
            onCopy={handleCopy}
            lang={lang}
          />
        )}

        {view === 'add-manual' && (
          <AddAccount 
            onAdd={handleAddAccount} 
            onCancel={() => setView('list')}
            lang={lang}
          />
        )}

        {view === 'settings' && (
          <Settings 
            accounts={accounts} 
            onImport={handleImport}
            onBack={() => setView('list')}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Fullscreen Overlays */}
      {view === 'scan-qr' && (
        <QRScanner onScan={handleScan} onClose={() => setView('list')} />
      )}

      {/* Toast Notification - Minimalist */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium border ${
            toast.type === 'error' 
              ? 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' 
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
          }`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}