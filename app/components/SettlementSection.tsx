'use client';

import { calculateSettlement } from '@/app/lib/settlement';
import { formatYen } from '@/app/lib/format';
import { Participant, Expense } from '@/app/types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { SettlementBarChart } from './settlement/SettlementBarChart';

interface SettlementSectionProps {
  participants: Participant[];
  expenses: Expense[];
  onReset: () => void;
}

export function SettlementSection({
  participants,
  expenses,
  onReset,
}: SettlementSectionProps) {
  const result = calculateSettlement(participants, expenses);

  const copyTransferText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard APIが使えない環境でも落ちないようにする（UXは最低限維持）
      window.prompt('コピーできなかったため、手動でコピーしてください:', text);
    }
  };

  return (
    <Section
      title={!result || result.transfers.length === 0 ? '精算' : '精算結果'}
      headerAction={
        result && result.transfers.length > 0 ? (
          <Button variant="danger" onClick={onReset}>
            すべてリセット
          </Button>
        ) : undefined
      }
    >
      {!result ? (
        <p className="text-sm text-gray-500">参加者を追加してください</p>
      ) : result.transfers.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-gray-800">
            支払いがまだありません。支払いを追加してください。
          </p>
        </div>
      ) : (
        <>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">総額:</span>
                <br/>
                <span className="font-bold text-lg text-gray-800">
                  {formatYen(result.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">1人あたり:</span>
                <br/>
                <span className="font-bold text-lg text-gray-800">
                  {result.remainder === 0
                    ? formatYen(result.perPersonShareBase)
                    : `${formatYen(result.perPersonShareBase)}（+1円 × ${result.remainder}人）`}
                </span>
              </div>
              <div>
                <span className="text-gray-600">参加者数:</span>
                <br/>
                <span className="font-bold text-lg text-gray-800">
                  {participants.length}人
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              現地支払い額/割り勘負担額の内訳
            </h3>
            <SettlementBarChart balances={result.balances} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              送金が必要な取引
            </h3>
            <div className="space-y-3">
              {result.transfers.map((transfer, index) => {
                const text = `${transfer.fromName} → ${transfer.toName}: ${formatYen(transfer.amount)}`;
                return (
                  <div
                    key={`${transfer.fromId}-${transfer.toId}-${index}`}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">
                        {transfer.fromName}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="font-medium text-gray-800">
                        {transfer.toName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-800">
                        {formatYen(transfer.amount)}
                      </span>
                      <Button
                        variant="small"
                        onClick={() => copyTransferText(text)}
                        title="コピー"
                        aria-label={`${text} をコピー`}
                      >
                        コピー
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Section>
  );
}
