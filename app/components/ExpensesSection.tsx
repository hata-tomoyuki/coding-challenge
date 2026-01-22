'use client';

import { Expense, Participant } from '@/app/types';
import { ExpenseForm } from './expenses/ExpenseForm';
import { ExpenseList } from './expenses/ExpenseList';

interface ExpensesSectionProps {
  participants: Participant[];
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
  onRemove: (id: string) => void;
}

/**
 * 支払いセクションコンポーネント
 * フォームと一覧を統合して表示
 */
export function ExpensesSection({
  participants,
  expenses,
  onAdd,
  onRemove,
}: ExpensesSectionProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">支払い</h2>

      {participants.length === 0 ? (
        <p className="text-sm text-gray-500">
          まず参加者を追加してください
        </p>
      ) : (
        <>
          <ExpenseForm participants={participants} onAdd={onAdd} />
          <ExpenseList
            participants={participants}
            expenses={expenses}
            onRemove={onRemove}
          />
        </>
      )}
    </section>
  );
}
