import React, { useState } from 'react';
import { OTPAccount, Language } from '../types';
import { t } from '../services/i18n';
import * as OTPAuth from 'otpauth';

interface AddAccountProps {
  onAdd: (account: OTPAccount) => void;
  onCancel: () => void;
  lang: Language;
}

export const AddAccount: React.FC<AddAccountProps> = ({ onAdd, onCancel, lang }) => {
  const [issuer, setIssuer] = useState('');
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!secret || !label) {
      setError(t(lang, 'requiredFields'));
      return;
    }

    try {
      const cleanedSecret = secret.replace(/\s/g, '').toUpperCase();
      OTPAuth.Secret.fromBase32(cleanedSecret);

      const newAccount: OTPAccount = {
        id: crypto.randomUUID(),
        issuer: issuer.trim() || 'Custom',
        label: label.trim(),
        secret: cleanedSecret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        type: 'totp'
      };

      onAdd(newAccount);
    } catch (err) {
      setError(t(lang, 'invalidSecret'));
    }
  };

  return (
    <div className="max-w-md mx-auto animate-[slideUp_0.2s_ease-out]">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t(lang, 'manualEntry')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t(lang, 'issuer')}
          </label>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder-gray-400"
            placeholder="e.g. Google, Amazon"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t(lang, 'accountName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder-gray-400"
            placeholder="e.g. user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t(lang, 'secretKey')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all font-mono uppercase placeholder-gray-400"
            placeholder="JBSWY3DPEHPK3PXP"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t(lang, 'cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {t(lang, 'save')}
          </button>
        </div>
      </form>
    </div>
  );
};