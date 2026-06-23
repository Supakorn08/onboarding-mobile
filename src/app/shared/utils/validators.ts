const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (v: string): boolean => EMAIL_RE.test(v.trim());
export const isValidJuristicId = (v: string): boolean => /^\d{13}$/.test(v.trim());
