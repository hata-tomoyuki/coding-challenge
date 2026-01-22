/**
 * 金額を日本語形式でフォーマットするユーティリティ関数
 */

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
