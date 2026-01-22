import { ButtonHTMLAttributes } from 'react';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * 削除ボタンコンポーネント
 * アイコンベースの削除ボタン用
 */
export function DeleteButton({
  label,
  className = '',
  ...props
}: DeleteButtonProps) {
  return (
    <button
      className={`text-red-500 hover:text-red-700 text-sm font-bold ${className}`}
      aria-label={label || '削除'}
      {...props}
    >
      ×
    </button>
  );
}
