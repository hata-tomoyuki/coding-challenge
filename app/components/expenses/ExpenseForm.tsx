'use client';

import { useState } from 'react';
import type { CurrencyCode } from '@/app/types';
import { Participant, Expense } from '@/app/types';
import { CurrencyField } from '../forms/CurrencyField';
import { TextField } from '../forms/TextField';
import { SelectField } from '../forms/SelectField';
import { Button } from '../ui/Button';
import { getCurrencyDecimals } from '@/app/lib/currency';
import { getRateToJpy } from '@/app/lib/exchangeRate';
import {
  validateMoney,
  validateExpenseTitle,
  parseMoneyToMinor,
} from '@/app/lib/validation';
import { SUPPORTED_CURRENCIES } from '@/app/const/currency';

interface ExpenseFormProps {
  participants: Participant[];
  onAdd: (expense: Expense) => void;
}

/**
 * 支払い追加フォームコンポーネント
 */
export function ExpenseForm({ participants, onAdd }: ExpenseFormProps) {
  const [payerId, setPayerId] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('JPY');
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [fxError, setFxError] = useState<string | null>(null);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [amountValidation, setAmountValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });
  const [titleValidation, setTitleValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });

  const handleAdd = async () => {
    const amountResult = validateMoney(amountStr, currency);
    const titleResult = validateExpenseTitle(title);

    setAmountValidation(amountResult);
    setTitleValidation(titleResult);
    setFxError(null);

    if (!payerId) {
      return;
    }

    if (amountResult.isValid && titleResult.isValid) {
      try {
        setIsFetchingRate(true);

        const amountMinor = parseMoneyToMinor(amountStr, currency);
        const fxRateToJpy = await getRateToJpy(currency);

        const decimals = getCurrencyDecimals(currency);
        const scale = 10 ** decimals;
        const amountYen =
          currency === 'JPY'
            ? amountMinor
            : Math.round((amountMinor / scale) * fxRateToJpy);

        const newExpense: Expense = {
          id: crypto.randomUUID(),
          payerId,
          currency,
          amountMinor,
          fxRateToJpy,
          amountYen,
          title: title.trim(),
          createdAt: Date.now(),
        };

        onAdd(newExpense);
        setPayerId('');
        setCurrency('JPY');
        setAmountStr('');
        setTitle('');
        setAmountValidation({ isValid: true });
        setTitleValidation({ isValid: true });
      } catch (error) {
        setFxError('為替レートの取得に失敗しました。時間をおいて再試行してください。');
        console.error(error);
      } finally {
        setIsFetchingRate(false);
      }
    }
  };

  const participantOptions = participants.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({
    value: c,
    label: c === 'JPY' ? 'JPY（円）' : c,
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <SelectField
          label="支払った人"
          value={payerId}
          onChange={setPayerId}
          options={participantOptions}
          placeholder="選択してください"
          required
        />
        <SelectField
          label="通貨"
          value={currency}
          onChange={(v) => setCurrency(v as CurrencyCode)}
          options={currencyOptions}
          required
        />
        <CurrencyField
          label="金額"
          value={amountStr}
          onChange={setAmountStr}
          currency={currency}
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
      {fxError && <p className="mb-3 text-sm text-red-500">{fxError}</p>}
      <div className="mb-4">
        <Button
          variant="primary-green"
          onClick={handleAdd}
          disabled={!payerId || !amountStr.trim() || !title.trim() || isFetchingRate}
        >
          {isFetchingRate ? '為替取得中…' : '追加'}
        </Button>
      </div>
    </>
  );
}
