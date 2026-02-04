'use client';

import { useState } from 'react';
import type { CurrencyCode, Expense, Participant } from '@/app/types';
import { SUPPORTED_CURRENCIES } from '@/app/const/currency';
import { getCurrencyDecimals } from '@/app/lib/currency';
import { getRateToJpy } from '@/app/lib/exchangeRate';
import {
  parseMoneyToMinor,
  validateExpenseTitle,
  validateMoney,
  type ValidationResult,
} from '@/app/lib/validation';
import { Button } from '../ui/Button';
import { CurrencyField } from '../forms/CurrencyField';
import { SelectField } from '../forms/SelectField';
import { TextField } from '../forms/TextField';

interface ExpenseEditModalProps {
  participants: Participant[];
  expense: Expense;
  onCancel: () => void;
  onSave: (expense: Expense) => void;
}

export function ExpenseEditModal({
  participants,
  expense,
  onCancel,
  onSave,
}: ExpenseEditModalProps) {
  const [payerId, setPayerId] = useState(expense.payerId);
  const [currency, setCurrency] = useState<CurrencyCode>(expense.currency);
  const [amountStr, setAmountStr] = useState(() => {
    const decimals = getCurrencyDecimals(expense.currency);
    const scale = 10 ** decimals;
    if (decimals === 0) return String(expense.amountMinor);
    const major = expense.amountMinor / scale;
    // 余計な末尾0は表示しない（入力しやすさ優先）
    return String(major);
  });
  const [title, setTitle] = useState(expense.title);
  const [amountValidation, setAmountValidation] = useState<ValidationResult>({
    isValid: true,
  });
  const [titleValidation, setTitleValidation] = useState<ValidationResult>({
    isValid: true,
  });
  const [fxError, setFxError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const participantOptions = participants.map((p) => ({ value: p.id, label: p.name }));
  const currencyOptions = SUPPORTED_CURRENCIES.map((c: CurrencyCode) => ({
    value: c,
    label: c === 'JPY' ? 'JPY（円）' : c,
  }));

  const handleSave = async () => {
    const amountResult = validateMoney(amountStr, currency);
    const titleResult = validateExpenseTitle(title);
    setAmountValidation(amountResult);
    setTitleValidation(titleResult);
    setFxError(null);

    if (!payerId) return;
    if (!amountResult.isValid || !titleResult.isValid) return;

    try {
      setIsSaving(true);

      const amountMinor = parseMoneyToMinor(amountStr, currency);

      // 通貨が同じなら既存レートを維持（同通貨での金額変更などは当時レートのまま）
      // 通貨が変わった場合は、その編集時点のレートを取得して固定
      const fxRateToJpy =
        currency === expense.currency ? expense.fxRateToJpy : await getRateToJpy(currency);

      const decimals = getCurrencyDecimals(currency);
      const scale = 10 ** decimals;
      const amountYen =
        currency === 'JPY'
          ? amountMinor
          : Math.round((amountMinor / scale) * fxRateToJpy);

      onSave({
        ...expense,
        payerId,
        currency,
        amountMinor,
        fxRateToJpy,
        amountYen,
        title: title.trim(),
      });
    } catch (error) {
      setFxError('為替レートの取得に失敗しました。時間をおいて再試行してください。');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h4 className="text-lg font-semibold text-gray-800">支払いを編集</h4>
          <Button variant="secondary" onClick={onCancel} aria-label="閉じる">
            閉じる
          </Button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="支払った人"
              value={payerId}
              onChange={setPayerId}
              options={participantOptions}
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
              required
            />
            <TextField
              label="支払い内容"
              value={title}
              onChange={setTitle}
              validation={titleValidation}
              required
            />
          </div>
          {fxError && <p className="text-sm text-red-500">{fxError}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <Button variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            variant="primary-green"
            onClick={handleSave}
            disabled={isSaving || !payerId || !amountStr.trim() || !title.trim()}
          >
            {isSaving ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  );
}

