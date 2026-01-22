'use client';

import { useState } from 'react';
import { Expense, Participant } from '@/app/types';
import { CurrencyField } from './forms/CurrencyField';
import { TextField } from './forms/TextField';
import { SelectField } from './forms/SelectField';
import {
  validateAmount,
  validateExpenseTitle,
  parseAmount,
} from '@/app/lib/validation';

interface ExpensesSectionProps {
  participants: Participant[];
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
  onRemove: (id: string) => void;
}

export function ExpensesSection({
  participants,
  expenses,
  onAdd,
  onRemove,
}: ExpensesSectionProps) {
  const [payerId, setPayerId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [amountValidation, setAmountValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });
  const [titleValidation, setTitleValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });

  const handleAdd = () => {
    const amountResult = validateAmount(amountStr);
    const titleResult = validateExpenseTitle(title);

    setAmountValidation(amountResult);
    setTitleValidation(titleResult);

    if (!payerId) {
      return;
    }

    if (amountResult.isValid && titleResult.isValid) {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        payerId,
        amountYen: parseAmount(amountStr),
        title: title.trim(),
        createdAt: Date.now(),
      };
      onAdd(newExpense);
      setPayerId('');
      setAmountStr('');
      setTitle('');
      setAmountValidation({ isValid: true });
      setTitleValidation({ isValid: true });
    }
  };

  const participantOptions = participants.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const getParticipantName = (id: string) => {
    return participants.find((p) => p.id === id)?.name || '不明';
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">支払い</h2>

      {participants.length === 0 ? (
        <p className="text-sm text-gray-500">
          まず参加者を追加してください
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SelectField
              label="支払った人"
              value={payerId}
              onChange={setPayerId}
              options={participantOptions}
              placeholder="選択してください"
              required
            />
            <CurrencyField
              label="金額"
              value={amountStr}
              onChange={setAmountStr}
              validation={amountValidation}
              placeholder="0"
              required
            />
            <TextField
              label="支払い内容"
              value={title}
              onChange={setTitle}
              validation={titleValidation}
              placeholder="例: ホテル代"
              required
            />
          </div>
          <div className="mb-4">
            <button
              onClick={handleAdd}
              disabled={!payerId || !amountStr.trim() || !title.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              追加
            </button>
          </div>

          {expenses.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                支払い一覧
              </h3>
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
                    {expenses
                      .reduce((sum, e) => sum + e.amountYen, 0)
                      .toLocaleString('ja-JP')}
                    円
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">支払いを追加してください</p>
          )}
        </>
      )}
    </section>
  );
}
