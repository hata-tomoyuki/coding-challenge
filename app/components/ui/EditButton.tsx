import { ButtonHTMLAttributes } from 'react';
import { FaPen } from 'react-icons/fa';

interface EditButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * 編集ボタンコンポーネント
 * アイコンベースの編集ボタン用
 */
export function EditButton({ label, className = '', ...props }: EditButtonProps) {
  return (
    <button
      className={`cursor-pointer text-gray-500 hover:text-gray-700 ${className}`}
      aria-label={label || '編集'}
      title={label || '編集'}
      {...props}
    >
      <FaPen />
    </button>
  );
}

