export interface OTPAccount {
  id: string;
  issuer: string;
  label: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  type?: 'totp' | 'hotp';
  counter?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ViewState = 'list' | 'add-manual' | 'scan-qr' | 'settings';

export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark' | 'system';
