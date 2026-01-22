import type { CurrencyCode } from '@/app/types';
import { getCurrencyDecimals } from '@/app/lib/currency';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 参加者名のバリデーション
 *
 * @param name - 検証する参加者名
 * @returns バリデーション結果（有効な場合はisValid: true、無効な場合はエラーメッセージ付き）
 *
 * @remarks
 * - 空文字列は無効
 * - 50文字を超える場合は無効
 * - 前後の空白は自動的にトリムされる
 */
export function validateParticipantName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: '名前を入力してください' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: '名前は50文字以内で入力してください' };
  }
  return { isValid: true };
}

/**
 * 金額文字列のバリデーション（整数円のみ）
 *
 * @param amountStr - 検証する金額文字列（カンマ区切り可）
 * @returns バリデーション結果（有効な場合はisValid: true、無効な場合はエラーメッセージ付き）
 *
 * @remarks
 * - カンマは自動的に除去される
 * - 整数のみ有効（小数は無効）
 * - 0円以上、1億円以下が有効範囲
 * - 空文字列は無効
 */
export function validateAmount(amountStr: string): ValidationResult {
  return validateMoney(amountStr, 'JPY');
}

/**
 * 金額文字列を整数円に変換（カンマ除去後）
 *
 * @param amountStr - 変換する金額文字列（カンマ区切り可）
 * @returns 変換された整数円の金額。無効な値の場合は0を返す
 *
 * @remarks
 * - カンマは自動的に除去される
 * - 整数でない場合や負の値の場合は0を返す
 */
export function parseAmount(amountStr: string): number {
  return parseMoneyToMinor(amountStr, 'JPY');
}

/**
 * 通貨に応じた金額入力のバリデーション（最小単位で整数化して保持する前提）
 *
 * @param amountStr - 検証する金額文字列（カンマ区切り可、小数は通貨の小数桁数まで許可）
 * @param currency - 通貨コード
 * @returns バリデーション結果
 */
export function validateMoney(amountStr: string, currency: CurrencyCode): ValidationResult {
  const trimmed = amountStr.trim();
  if (!trimmed) {
    return { isValid: false, error: '金額を入力してください' };
  }

  const decimals = getCurrencyDecimals(currency);
  const normalized = trimmed.replace(/,/g, '');

  // 小数桁数に合わせたフォーマットを許可
  const pattern =
    decimals === 0 ? /^\d+$/ : new RegExp(`^\\d+(?:\\.\\d{0,${decimals}})?$`);
  if (!pattern.test(normalized)) {
    return {
      isValid: false,
      error: decimals === 0 ? '整数で入力してください' : `小数は${decimals}桁まで入力できます`,
    };
  }

  const minor = parseDecimalToMinor(normalized, decimals);
  if (minor === null) {
    return { isValid: false, error: '有効な数値を入力してください' };
  }

  if (minor < 0) {
    return { isValid: false, error: '0以上の金額を入力してください' };
  }

  // 上限（メジャー単位で1億までを目安）
  const maxMinor = 100000000 * 10 ** decimals;
  if (minor > maxMinor) {
    return { isValid: false, error: '金額が大きすぎます' };
  }

  return { isValid: true };
}

/**
 * 通貨に応じた金額入力を最小単位の整数に変換する
 *
 * @param amountStr - 変換する金額文字列
 * @param currency - 通貨コード
 * @returns 最小単位の整数。無効な値の場合は0を返す
 */
export function parseMoneyToMinor(amountStr: string, currency: CurrencyCode): number {
  const decimals = getCurrencyDecimals(currency);
  const normalized = amountStr.trim().replace(/,/g, '');
  const minor = parseDecimalToMinor(normalized, decimals);
  return minor !== null && minor >= 0 ? minor : 0;
}

/**
 * 小数文字列を「最小単位の整数」に変換する（浮動小数を使わない）
 *
 * @param value - 正規化済みの数値文字列（カンマ除去済み）
 * @param decimals - 小数桁数
 * @returns 最小単位の整数、または変換不能な場合はnull
 */
function parseDecimalToMinor(value: string, decimals: number): number | null {
  if (!value) return null;
  if (value.startsWith('.')) value = `0${value}`;

  const [intPartRaw, fracPartRaw = ''] = value.split('.');
  if (!intPartRaw) return null;

  const intPart = intPartRaw.replace(/^0+(?=\d)/, '') || '0';
  const fracPart = fracPartRaw;

  if (decimals === 0) {
    const num = Number(intPart);
    return Number.isSafeInteger(num) ? num : null;
  }

  const padded = fracPart.padEnd(decimals, '0').slice(0, decimals);
  const minorStr = `${intPart}${padded}`;
  const num = Number(minorStr);
  if (!Number.isSafeInteger(num)) return null;
  return num;
}

/**
 * 支払いタイトルのバリデーション
 *
 * @param title - 検証する支払いタイトル
 * @returns バリデーション結果（有効な場合はisValid: true、無効な場合はエラーメッセージ付き）
 *
 * @remarks
 * - 空文字列は無効
 * - 100文字を超える場合は無効
 * - 前後の空白は自動的にトリムされる
 */
export function validateExpenseTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: '支払い内容を入力してください' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: '支払い内容は100文字以内で入力してください' };
  }
  return { isValid: true };
}
