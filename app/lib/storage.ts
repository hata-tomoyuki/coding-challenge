import { AppState } from '@/app/types';

const STORAGE_KEY = 'trip-split-app-state';

export function saveState(state: AppState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }
}

export function loadState(): AppState | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AppState;
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
  }
  return null;
}

export function clearState(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state from localStorage:', error);
    }
  }
}
