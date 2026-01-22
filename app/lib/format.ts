/**
 * 金額を日本語形式でフォーマットするユーティリティ関数
 */

import type { CurrencyCode } from '@/app/types';
import { getCurrencyDecimals } from '@/app/lib/currency';

/**
 * 金額を「1,234円」形式の文字列に変換する
 *
 * @param amount - フォーマットする金額（整数円）
 * @returns フォーマットされた文字列（例: "1,234円"）
 *
 * @example
 * ```typescript
 * formatYen(1234) // "1,234円"
 * formatYen(0) // "0円"
 * ```
 */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`;
}

/**
 * 元通貨（最小単位）の金額を「USD 12.34」形式にフォーマットする
 *
 * @param amountMinor - 元通貨の最小単位での金額（例: USDならセント）
 * @param currency - 通貨コード
 * @returns フォーマットされた文字列（例: "USD 12.34" / "JPY 1,234"）
 */
export function formatMoneyFromMinor(amountMinor: number, currency: CurrencyCode): string {
  const decimals = getCurrencyDecimals(currency);
  const scale = 10 ** decimals;

  const integerPart = Math.floor(amountMinor / scale);
  const fracPart = Math.abs(amountMinor % scale);
  const intFormatted = integerPart.toLocaleString('ja-JP');

  if (decimals === 0) {
    return `${currency} ${intFormatted}`;
  }

  const fracStr = String(fracPart).padStart(decimals, '0');
  return `${currency} ${intFormatted}.${fracStr}`;
}
