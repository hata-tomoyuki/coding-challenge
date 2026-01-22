import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
}

/**
 * セクションラッパーコンポーネント
 * 統一されたスタイルのセクションとタイトルを提供
 */
export function Section({ title, children, headerAction }: SectionProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      {headerAction ? (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {headerAction}
        </div>
      ) : (
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}
