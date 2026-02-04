'use client';

import { Expense, Participant } from '@/app/types';
import { Section } from './ui/Section';
import { ExpenseForm } from './expenses/ExpenseForm';
import { ExpenseList } from './expenses/ExpenseList';

interface ExpensesSectionProps {
  participants: Participant[];
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
  onUpdate: (expense: Expense) => void;
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
  onUpdate,
  onRemove,
}: ExpensesSectionProps) {
  return (
    <Section title="支払い">
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
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </>
      )}
    </Section>
  );
}
