import { NextResponse } from 'next/server';
import type { CurrencyCode } from '@/app/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/fx?currency=USD
 * 支払い追加時点で「1通貨（メジャー単位）= 何JPYか」を取得する
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency') as CurrencyCode | null;

  if (!currency) {
    return NextResponse.json(
      { error: 'currency is required' },
      { status: 400 }
    );
  }

  if (currency === 'JPY') {
    return NextResponse.json({
      currency,
      rateToJpy: 1,
      fetchedAt: Date.now(),
      source: 'static',
    });
  }

  // docsの例: http://api.exchangerate.host/live?access_key=...&source=GBP&currencies=USD,...
  const baseUrl = process.env.EXCHANGERATE_HOST_BASE_URL ?? 'https://api.exchangerate.host';
  const apiKey = process.env.EXCHANGERATE_HOST_API_KEY;

  const url = new URL(`${baseUrl.replace(/\/$/, '')}/live`);
  // 1通貨（メジャー単位）あたりのJPYが欲しいので source=通貨, currencies=JPY
  url.searchParams.set('source', currency);
  url.searchParams.set('currencies', 'JPY');
  url.searchParams.set('format', '1');
  if (apiKey) {
    url.searchParams.set('access_key', apiKey);
  }

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch rate: ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      success?: boolean;
      // 形式差異に対応
      rates?: Record<string, number>;
      quotes?: Record<string, number>;
      error?: unknown;
    };

    const quoteKey = `${currency}JPY`;
    const rateToJpy = data?.rates?.JPY ?? data?.quotes?.[quoteKey];
    if (typeof rateToJpy !== 'number' || !isFinite(rateToJpy) || rateToJpy <= 0) {
      return NextResponse.json(
        { error: 'Invalid rate received from provider' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      currency,
      rateToJpy,
      fetchedAt: Date.now(),
      source: 'exchangerate.host',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rate', detail: String(error) },
      { status: 502 }
    );
  }
}

