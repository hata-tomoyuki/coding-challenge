'use client';

import { ValidationResult, parseAmount } from '@/app/lib/validation';

interface CurrencyFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationResult;
  placeholder?: string;
  required?: boolean;
}

/**
 * 金額入力フィールド（カンマ区切り対応）
 */
export function CurrencyField({
  label,
  value,
  onChange,
  validation,
  placeholder = '0',
  required = false,
}: CurrencyFieldProps) {
  const handleChange = (inputValue: string) => {
    // カンマを除去してから処理
    const normalized = inputValue.replace(/,/g, '');
    onChange(normalized);
  };

  const formatValue = (val: string): string => {
    if (!val) return '';
    const num = parseAmount(val);
    if (num === 0) return '';
    return num.toLocaleString('ja-JP');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formatValue(value)}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validation && !validation.isValid
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300'
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          円
        </span>
      </div>
      {validation && !validation.isValid && (
        <p className="mt-1 text-sm text-red-500">{validation.error}</p>
      )}
    </div>
  );
}
