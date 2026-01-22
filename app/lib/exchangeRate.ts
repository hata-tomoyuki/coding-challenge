import type { CurrencyCode } from '@/app/types';

/**
 * 指定通貨の「1通貨（メジャー単位）= 何JPYか」のレートを取得する
 *
 * @param currency - 通貨コード
 * @returns レート（例: USD->JPY が 150.12 のような数値）
 * @throws 取得に失敗した場合
 */
export async function getRateToJpy(currency: CurrencyCode): Promise<number> {
  if (currency === 'JPY') return 1;

  const res = await fetch(`/api/fx?currency=${encodeURIComponent(currency)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch FX rate (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { rateToJpy?: number };
  if (typeof data.rateToJpy !== 'number' || !isFinite(data.rateToJpy) || data.rateToJpy <= 0) {
    throw new Error('Invalid FX rate response');
  }

  return data.rateToJpy;
}

