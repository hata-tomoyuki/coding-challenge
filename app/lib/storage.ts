import { AppState } from '@/app/types';
import type { Expense } from '@/app/types';
import type { CurrencyCode } from '@/app/types';
import { getCurrencyDecimals } from '@/app/lib/currency';

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
        const parsed = JSON.parse(stored) as unknown;
        return migrateState(parsed);
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

/**
 * 旧データ形式を新しい形式へマイグレーションする
 *
 * @param state - localStorageから読み込んだ状態
 * @returns マイグレーション済み状態
 *
 * @remarks
 * 既存の国内旅行版ではExpenseに通貨情報が無かったため、以下を補完する:
 * - currency: 'JPY'
 * - amountMinor: amountYen
 * - fxRateToJpy: 1
 */
function migrateState(state: unknown): AppState {
  const obj = isRecord(state) ? state : {};

  const participantsRaw = obj.participants;
  const expensesRaw = obj.expenses;

  const participants = Array.isArray(participantsRaw)
    ? participantsRaw
        .filter(isRecord)
        .map((p) => ({
          id: String(p.id ?? crypto.randomUUID()),
          name: String(p.name ?? ''),
        }))
        .filter((p) => p.name.trim() !== '')
    : [];

  const expenses = Array.isArray(expensesRaw)
    ? expensesRaw.map((e) => migrateExpense(e))
    : [];

  return { participants, expenses };
}

function migrateExpense(expense: unknown): Expense {
  // 旧形式: { id, payerId, amountYen, title, createdAt }
  const e = isRecord(expense) ? expense : {};
  const currency = toCurrencyCode(e.currency);
  const amountYen: number = Number.isFinite(e.amountYen) ? Number(e.amountYen) : 0;

  const amountMinor =
    Number.isFinite(e.amountMinor) ? Number(e.amountMinor) : amountYen;

  const fxRateToJpy =
    Number.isFinite(e.fxRateToJpy) && Number(e.fxRateToJpy) > 0
      ? Number(e.fxRateToJpy)
      : currency === 'JPY'
        ? 1
        : 1;

  // もしamountYenが欠けている場合は、保存済みのレートから再計算（可能なら）
  const migratedAmountYen =
    Number.isFinite(e.amountYen)
      ? amountYen
      : currency === 'JPY'
        ? amountMinor
        : convertToYen(amountMinor, currency, fxRateToJpy);

  return {
    id: String(e.id ?? crypto.randomUUID()),
    payerId: String(e.payerId ?? ''),
    currency,
    amountMinor: Math.max(0, Math.trunc(amountMinor)),
    fxRateToJpy,
    amountYen: Math.max(0, Math.trunc(migratedAmountYen)),
    title: String(e.title ?? ''),
    createdAt: Number.isFinite(e.createdAt) ? Number(e.createdAt) : Date.now(),
  };
}

/**
 * 元通貨（最小単位）の金額をJPY（円）へ換算する
 *
 * @param amountMinor - 元通貨の最小単位での金額（例: USDならセント）
 * @param currency - 元通貨コード
 * @param fxRateToJpy - 「1通貨（メジャー単位）= 何JPYか」のレート
 * @returns JPY換算額（整数円）
 *
 * @remarks
 * - 浮動小数の誤差を最小化するため、最小単位→メジャー単位に戻してから換算し、最後に四捨五入する
 * - currencyがJPYの場合はamountMinor（=円）をそのまま返す
 */
function convertToYen(amountMinor: number, currency: CurrencyCode, fxRateToJpy: number): number {
  const decimals = getCurrencyDecimals(currency);
  const scale = 10 ** decimals;
  if (currency === 'JPY') return amountMinor;
  return Math.round((amountMinor / scale) * fxRateToJpy);
}

/**
 * unknown値が「オブジェクト（null以外）」かどうかを判定する型ガード
 *
 * @param value - 判定対象
 * @returns valueがRecordとして扱える場合true
 *
 * @remarks
 * JSON.parseの結果はunknownとして扱い、プロパティ参照前に必ず型ガードすることで
 * `any` を使わずに安全にマイグレーションできる。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * unknown値から安全に通貨コードを確定する
 *
 * @param value - 通貨コード候補（主にlocalStorage復元データ由来）
 * @returns サポートされている通貨コード。判定不能な場合は'JPY'にフォールバック
 *
 * @remarks
 * アプリが扱う通貨は型 `CurrencyCode` のユニオンで制限しているため、
 * 外部入力（localStorage等）からの復元時は必ずこの関数で正規化する。
 */
function toCurrencyCode(value: unknown): CurrencyCode {
  const v = typeof value === 'string' ? value.toUpperCase() : '';
  switch (v) {
    case 'JPY':
    case 'USD':
    case 'EUR':
    case 'GBP':
    case 'AUD':
    case 'CAD':
    case 'CHF':
    case 'CNY':
    case 'HKD':
    case 'KRW':
    case 'SGD':
    case 'THB':
    case 'TWD':
    case 'VND':
    case 'INR':
      return v;
    default:
      return 'JPY';
  }
}
