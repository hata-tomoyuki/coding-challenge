import { AppState } from '@/app/types';

const STORAGE_KEY = 'trip-split-app-state';

/**
 * アプリケーションの状態をlocalStorageに保存する
 *
 * @param state - 保存するアプリケーション状態
 *
 * @remarks
 * ブラウザ環境でのみ動作し、エラーが発生した場合はコンソールにエラーを出力する
 */
export function saveState(state: AppState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }
}

/**
 * localStorageからアプリケーションの状態を読み込む
 *
 * @returns 読み込んだ状態、またはデータが存在しない場合はnull
 *
 * @remarks
 * ブラウザ環境でのみ動作し、エラーが発生した場合はnullを返す
 */
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

/**
 * localStorageからアプリケーションの状態を削除する
 *
 * @remarks
 * ブラウザ環境でのみ動作し、エラーが発生した場合はコンソールにエラーを出力する
 */
export function clearState(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state from localStorage:', error);
    }
  }
}
