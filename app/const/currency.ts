import { CurrencyCode } from "../types";

/**
 * アプリが扱う通貨コード一覧
 */
export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = [
  'JPY',
  'USD',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'HKD',
  'KRW',
  'SGD',
  'THB',
  'TWD',
  'VND',
  'INR',
] as const;

/**
 * 通貨ごとの小数桁数（メジャー単位での表示に必要）
 *
 * @remarks
 * - JPYは0桁（円）
 * - 多くの法定通貨は2桁（セントなど）
 * - ここにない通貨は2桁扱いにフォールバックする
 */
export const CURRENCY_DECIMALS: Record<CurrencyCode, number> = {
  JPY: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  CNY: 2,
  HKD: 2,
  KRW: 0,
  SGD: 2,
  THB: 2,
  TWD: 2,
  VND: 0,
  INR: 2,
};
