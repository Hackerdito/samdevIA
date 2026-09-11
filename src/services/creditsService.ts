import { ModelCreditsConfig, CreditsSummary } from '../types/magnific';
import { DEFAULT_CREDITS_CONFIG, calculateEstimatedCredits } from '../constants/defaultCredits';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_CREDITS_CONFIG_KEY = 'magnific_credits_config';
const LOCAL_STORAGE_CREDITS_SUMMARY_KEY = 'magnific_credits_summary';

export function getStoredCreditsConfig(): ModelCreditsConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CREDITS_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_CREDITS_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse stored credits config:', e);
  }
  return DEFAULT_CREDITS_CONFIG;
}

export function saveStoredCreditsConfig(config: ModelCreditsConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CREDITS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save credits config:', e);
  }
}

export async function getCreditsSummary(userId?: string): Promise<CreditsSummary> {
  const defaultSummary: CreditsSummary = {
    monthlyUsed: 0,
    billingResetDay: 1,
    lastResetIso: new Date().toISOString(),
    isEnterpriseMode: false
  };

  // 1. Try local storage
  let localData: CreditsSummary = defaultSummary;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CREDITS_SUMMARY_KEY);
    if (raw) {
      localData = { ...defaultSummary, ...JSON.parse(raw) };
    }
  } catch (e) {
    // fallback
  }

  // Check if monthly cycle has rolled over based on billingResetDay
  const now = new Date();
  const lastReset = new Date(localData.lastResetIso);
  if (
    now.getMonth() !== lastReset.getMonth() &&
    now.getDate() >= localData.billingResetDay
  ) {
    localData.monthlyUsed = 0;
    localData.lastResetIso = now.toISOString();
    localStorage.setItem(LOCAL_STORAGE_CREDITS_SUMMARY_KEY, JSON.stringify(localData));
  }

  // 2. If user is logged in, sync with Firestore
  if (userId && auth.currentUser) {
    try {
      const ref = doc(db, 'users', userId);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.creditsSummary) {
          return {
            ...localData,
            ...data.creditsSummary,
          };
        }
      }
    } catch (err) {
      console.warn('Firestore credits read note:', err);
    }
  }

  return localData;
}

export function getMonthlyCreditsUsed(): number {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CREDITS_SUMMARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Number(parsed.monthlyUsed || 0);
    }
  } catch (e) {
    // fallback
  }
  return 0;
}

export const recordCreditUsage = addCreditsUsed;

export async function addCreditsUsed(amount: number, userId?: string): Promise<number> {

  const current = await getCreditsSummary(userId);
  const newTotal = (current.monthlyUsed || 0) + amount;
  const updated: CreditsSummary = {
    ...current,
    monthlyUsed: newTotal,
  };

  localStorage.setItem(LOCAL_STORAGE_CREDITS_SUMMARY_KEY, JSON.stringify(updated));

  if (userId && auth.currentUser) {
    try {
      const ref = doc(db, 'users', userId);
      await setDoc(ref, { creditsSummary: updated }, { merge: true });
    } catch (err) {
      console.warn('Firestore credits update note:', err);
    }
  }

  return newTotal;
}

export async function resetMonthlyCredits(userId?: string, newResetDay?: number): Promise<CreditsSummary> {
  const current = await getCreditsSummary(userId);
  const updated: CreditsSummary = {
    ...current,
    monthlyUsed: 0,
    lastResetIso: new Date().toISOString(),
    billingResetDay: newResetDay || current.billingResetDay || 1,
  };

  localStorage.setItem(LOCAL_STORAGE_CREDITS_SUMMARY_KEY, JSON.stringify(updated));

  if (userId && auth.currentUser) {
    try {
      const ref = doc(db, 'users', userId);
      await setDoc(ref, { creditsSummary: updated }, { merge: true });
    } catch (err) {
      console.warn('Firestore credits reset note:', err);
    }
  }

  return updated;
}

/**
 * Team Credit Usage Analytics for Business/Enterprise plans
 * Calling POST /v1/analytics/team-credit-usage via server-side proxy
 */
export async function fetchEnterpriseTeamCredits(apiKey?: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/magnific/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message || 'Error de conexión' };
  }
}
