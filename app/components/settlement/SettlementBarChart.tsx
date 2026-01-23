'use client';

import type { ReactNode } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatYen } from '@/app/lib/format';
import type { PersonBalance } from '@/app/lib/settlement';

interface SettlementBarChartProps {
  balances: PersonBalance[];
}

function tickYen(value: unknown): string {
  const v = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(v)) return '';
  // モバイルで見やすいように大きい値はk表示
  if (v >= 10000) return `${Math.round(v / 1000)}k`;
  return `${v}`;
}

export function SettlementBarChart({ balances }: SettlementBarChartProps) {
  const data = balances.map((b) => ({
    name: b.name,
    paidYen: b.paidYen,
    shareYen: b.shareYen,
    deltaYen: b.deltaYen,
    isPlusOneAssignee: b.isPlusOneAssignee,
  }));

  // 参加者が多いと縦棒が潰れるので横スクロールで逃がす
  const minWidth = Math.max(360, data.length * 90);

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <div className="h-64" style={{ minWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 10 }}>
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fontSize: 12 }}
                height={40}
              />
              <YAxis tickFormatter={tickYen} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(
                  value: string | number | readonly (string | number)[] | undefined,
                  name: string | number | undefined
                ) => {
                  const key = String(name);
                  const num =
                    typeof value === 'number'
                      ? value
                      : typeof value === 'string'
                        ? Number(value)
                        : NaN;

                  if (key === 'paidYen' && Number.isFinite(num)) {
                    const formatted = formatYen(num);
                    return [formatted, '現地支払い額'];
                  }
                  if (key === 'shareYen' && Number.isFinite(num)) {
                    const formatted = formatYen(num);
                    return [formatted, '割り勘負担額'];
                  }
                  // その他の値も数値なら「円」を付ける
                  if (Number.isFinite(num)) {
                    return [formatYen(num), key];
                  }
                  return [String(value), key];
                }}
                labelFormatter={(label: ReactNode) => String(label ?? '')}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend />
              <Bar dataKey="paidYen" name="現地支払い額" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="shareYen" name="割り勘負担額" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <p>
          差額（支払い - 負担）がマイナスの人は支払い側、プラスの人は受け取り側です。
          「+1円」配分がある場合、負担額が1円だけ増える人がいます。
        </p>
      </div>
    </div>
  );
}

