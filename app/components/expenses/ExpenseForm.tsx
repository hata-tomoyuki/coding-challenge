'use client';

import { useState } from 'react';
import { Participant, Expense } from '@/app/types';
import { CurrencyField } from '../forms/CurrencyField';
import { TextField } from '../forms/TextField';
import { SelectField } from '../forms/SelectField';
import { Button } from '../ui/Button';
import {
  validateAmount,
  validateExpenseTitle,
  parseAmount,
} from '@/app/lib/validation';

interface ExpenseFormProps {
  participants: Participant[];
  onAdd: (expense: Expense) => void;
}

/**
 * 支払い追加フォームコンポーネント
 */
export function ExpenseForm({ participants, onAdd }: ExpenseFormProps) {
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

  return (
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
        <Button
          variant="primary-green"
          onClick={handleAdd}
          disabled={!payerId || !amountStr.trim() || !title.trim()}
        >
          追加
        </Button>
      </div>
    </>
  );
}
