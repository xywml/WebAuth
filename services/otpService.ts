import * as OTPAuth from 'otpauth';
import { OTPAccount } from '../types';

export const parseURI = (uri: string): OTPAccount | null => {
  try {
    const parsed = OTPAuth.URI.parse(uri);
    const isTOTP = parsed instanceof OTPAuth.TOTP;
    return {
      id: crypto.randomUUID(),
      issuer: parsed.issuer || 'Unknown',
      label: parsed.label || 'Account',
      secret: parsed.secret.base32,
      algorithm: parsed.algorithm,
      digits: parsed.digits,
      period: isTOTP ? parsed.period : undefined,
      type: isTOTP ? 'totp' : 'hotp',
    };
  } catch (e) {
    console.error("Invalid OTP URI", e);
    return null;
  }
};

export const generateToken = (account: OTPAccount): { token: string; remaining: number; period: number } => {
  const totp = new OTPAuth.TOTP({
    issuer: account.issuer,
    label: account.label,
    algorithm: account.algorithm || 'SHA1',
    digits: account.digits || 6,
    period: account.period || 30,
    secret: OTPAuth.Secret.fromBase32(account.secret),
  });

  const token = totp.generate();
  const period = account.period || 30;
  const epoch = Math.floor(Date.now() / 1000);
  const remaining = period - (epoch % period);

  return { token, remaining, period };
};

export const formatCode = (code: string): string => {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  if (code.length === 8) {
    return `${code.slice(0, 4)} ${code.slice(4)}`;
  }
  return code;
};