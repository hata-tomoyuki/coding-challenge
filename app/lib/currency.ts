import { CURRENCY_DECIMALS } from "../const/currency";
import { CurrencyCode } from "../types";

/**
 * 通貨コードから小数桁数を取得する
 *
 * @param currency - 通貨コード
 * @returns 小数桁数（例: USDは2、JPYは0）
 */
export function getCurrencyDecimals(currency: CurrencyCode): number {
  return CURRENCY_DECIMALS[currency] ?? 2;
}

/**
 * 入力UIの末尾表示用ラベルを返す
 *
 * @param currency - 通貨コード
 * @returns 末尾表示用ラベル（JPYは「円」、それ以外は通貨コード）
 */
export function getCurrencySuffixLabel(currency: CurrencyCode): string {
  return currency === 'JPY' ? '円' : currency;
}

