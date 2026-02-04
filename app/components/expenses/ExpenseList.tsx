'use client';

import { useMemo, useState } from 'react';
import type { CurrencyCode, Expense, Participant } from '@/app/types';
import { formatMoneyFromMinor, formatYen } from '@/app/lib/format';
import { getCurrencyDecimals } from '@/app/lib/currency';
import { SUPPORTED_CURRENCIES } from '@/app/const/currency';
import { getRateToJpy } from '@/app/lib/exchangeRate';
import type { ValidationResult } from '@/app/lib/validation';
import { validateMoney, validateExpenseTitle, parseMoneyToMinor } from '@/app/lib/validation';
import { DeleteButton } from '../ui/DeleteButton';
import { Button } from '../ui/Button';
import { SelectField } from '../forms/SelectField';
import { CurrencyField } from '../forms/CurrencyField';
import { TextField } from '../forms/TextField';

interface ExpenseListProps {
  participants: Participant[];
  expenses: Expense[];
  onUpdate: (expense: Expense) => void;
  onRemove: (id: string) => void;
}

/**
 * 支払い一覧表示コンポーネント
 */
export function ExpenseList({
  participants,
  expenses,
  onUpdate,
  onRemove,
}: ExpenseListProps) {
  const [editing, setEditing] = useState<Expense | null>(null);

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

  const openEdit = (e: Expense) => setEditing(e);
  const closeEdit = () => setEditing(null);

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
                {e.currency === 'JPY'
                  ? formatYen(e.amountYen)
                  : `${formatMoneyFromMinor(e.amountMinor, e.currency)}（= ${formatYen(e.amountYen)}）`}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="secondary" onClick={() => openEdit(e)} aria-label="編集">
                編集
              </Button>
              <DeleteButton onClick={() => onRemove(e.id)} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          合計:{' '}
          <span className="font-bold text-lg text-gray-800">
            {formatYen(totalAmount)}
          </span>
        </p>
      </div>

      {editing && (
        <ExpenseEditModal
          participants={participants}
          expense={editing}
          onCancel={closeEdit}
          onSave={(updated) => {
            onUpdate(updated);
            closeEdit();
          }}
        />
      )}
    </div>
  );
}

function ExpenseEditModal({
  participants,
  expense,
  onCancel,
  onSave,
}: {
  participants: Participant[];
  expense: Expense;
  onCancel: () => void;
  onSave: (expense: Expense) => void;
}) {
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
