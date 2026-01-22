'use client';

import { calculateSettlement } from '@/app/lib/settlement';
import { Participant, Expense } from '@/app/types';

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

  if (!result) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">精算</h2>
        <p className="text-sm text-gray-500">参加者を追加してください</p>
      </section>
    );
  }

  if (result.transfers.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">精算</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-gray-800">
            支払いがまだありません。支払いを追加してください。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">精算結果</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          すべてリセット
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">総額:</span>
            <span className="ml-2 font-bold text-lg text-gray-800">
              {result.totalAmount.toLocaleString('ja-JP')}円
            </span>
          </div>
          <div>
            <span className="text-gray-600">1人あたり:</span>
            <span className="ml-2 font-bold text-lg text-gray-800">
              {result.perPersonShare.toLocaleString('ja-JP')}円
            </span>
          </div>
          <div>
            <span className="text-gray-600">参加者数:</span>
            <span className="ml-2 font-bold text-lg text-gray-800">
              {participants.length}人
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          送金が必要な取引
        </h3>
        <div className="space-y-3">
          {result.transfers.map((transfer, index) => (
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
                  {transfer.amount.toLocaleString('ja-JP')}円
                </span>
                <button
                  onClick={() => {
                    const text = `${transfer.fromName} → ${transfer.toName}: ${transfer.amount.toLocaleString('ja-JP')}円`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  title="コピー"
                >
                  コピー
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
