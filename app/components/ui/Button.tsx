import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary-blue' | 'primary-green' | 'primary-gray' | 'danger' | 'secondary' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * ボタンコンポーネント
 * 統一されたスタイルのボタンを提供
 */
export function Button({
  variant = 'primary-blue',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'cursor-pointer rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses: Record<ButtonVariant, string> = {
    'primary-blue': 'px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed',
    'primary-green': 'px-6 py-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed',
    'primary-gray': 'px-6 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed',
    'danger': 'px-4 py-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 text-sm',
    'secondary': 'px-3 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400',
    'small': 'px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:ring-gray-400',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
