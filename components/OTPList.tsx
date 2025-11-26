import React, { useEffect, useState } from 'react';
import { OTPAccount, Language } from '../types';
import { generateToken, formatCode } from '../services/otpService';
import { t } from '../services/i18n';
import { Copy, Trash2, Search } from 'lucide-react';

interface OTPListProps {
  accounts: OTPAccount[];
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  lang: Language;
}

const OTPCard: React.FC<{ account: OTPAccount; onDelete: (id: string) => void; onCopy: (text: string) => void; lang: Language }> = ({ account, onDelete, onCopy, lang }) => {
  const [tokenData, setTokenData] = useState(generateToken(account));

  useEffect(() => {
    setTokenData(generateToken(account));
    const interval = setInterval(() => {
      setTokenData(generateToken(account));
    }, 1000);
    return () => clearInterval(interval);
  }, [account]);

  const progress = (tokenData.remaining / tokenData.period) * 100;
  const isWarning = tokenData.remaining <= 5;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 transition-colors group relative hover:border-gray-300 dark:hover:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="overflow-hidden pr-2">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-0.5 truncate">
            {account.issuer || t(lang, 'unknownIssuer')}
          </h3>
          <p className="text-gray-900 dark:text-gray-100 font-medium truncate w-full">
            {account.label}
          </p>
        </div>
        
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-100 dark:text-gray-800"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={`transition-all duration-1000 ease-linear ${isWarning ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
            />
          </svg>
          <span className={`absolute text-[10px] font-bold ${isWarning ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {Math.floor(tokenData.remaining)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div 
          onClick={() => onCopy(tokenData.token)}
          className={`font-mono text-3xl font-bold tracking-widest cursor-pointer select-none transition-colors ${
            isWarning ? 'text-red-500' : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {formatCode(tokenData.token)}
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
           <button 
            onClick={() => onCopy(tokenData.token)}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title={t(lang, 'copy')}
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={() => onDelete(account.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title={t(lang, 'delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const OTPList: React.FC<OTPListProps> = ({ accounts, onDelete, onCopy, lang }) => {
  const [filter, setFilter] = useState('');

  const filteredAccounts = accounts.filter(a => 
    a.label.toLowerCase().includes(filter.toLowerCase()) || 
    a.issuer.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Search Bar */}
      {accounts.length > 0 && (
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={t(lang, 'searchPlaceholder')} 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-lg py-3 pl-10 pr-4 focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
          />
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-full mb-6 text-gray-400 dark:text-gray-600">
              <div className="w-12 h-12 border-2 border-dashed border-current rounded-lg" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(lang, 'noAccounts')}</h3>
          <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
            {t(lang, 'noAccountsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredAccounts.map((account) => (
            <OTPCard key={account.id} account={account} onDelete={onDelete} onCopy={onCopy} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
};