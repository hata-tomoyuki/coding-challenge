'use client';

import { useMemo } from 'react';
import { Expense, Participant } from '@/app/types';

interface ExpenseListProps {
  participants: Participant[];
  expenses: Expense[];
  onRemove: (id: string) => void;
}

/**
 * 支払い一覧表示コンポーネント
 */
export function ExpenseList({
  participants,
  expenses,
  onRemove,
}: ExpenseListProps) {
  // 参加者IDから名前へのマッピングを作成（O(1)ルックアップ用）
  const participantMap = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((p) => {
      map.set(p.id, p.name);
    });
    return map;
  }, [participants]);

  const getParticipantName = (id: string): string => {
    return participantMap.get(id) || '不明';
  };

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amountYen, 0);
  }, [expenses]);

  if (expenses.length === 0) {
    return <p className="text-sm text-gray-500">支払いを追加してください</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600 mb-2">支払い一覧</h3>
      <div className="space-y-2">
        {expenses.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
          >
            <div className="flex-1">
              <span className="font-medium text-gray-800">
                {getParticipantName(e.payerId)}
              </span>
              <span className="text-gray-600 ml-2">{e.title}</span>
              <span className="text-gray-800 font-medium ml-2">
                {e.amountYen.toLocaleString('ja-JP')}円
              </span>
            </div>
            <button
              onClick={() => onRemove(e.id)}
              className="text-red-500 hover:text-red-700 text-sm font-bold ml-4"
              aria-label="削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          合計:{' '}
          <span className="font-bold text-lg text-gray-800">
            {totalAmount.toLocaleString('ja-JP')}円
          </span>
        </p>
      </div>
    </div>
  );
}
