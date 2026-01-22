'use client';

import { ValidationResult } from '@/app/lib/validation';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationResult;
  placeholder?: string;
  required?: boolean;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TextField({
  label,
  value,
  onChange,
  validation,
  placeholder,
  required = false,
  onKeyPress,
}: TextFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          validation && !validation.isValid
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
      />
      {validation && !validation.isValid && (
        <p className="mt-1 text-sm text-red-500">{validation.error}</p>
      )}
    </div>
  );
}
