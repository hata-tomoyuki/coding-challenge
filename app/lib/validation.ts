export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 参加者名のバリデーション
 */
export function validateParticipantName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: '名前を入力してください' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: '名前は50文字以内で入力してください' };
  }
  return { isValid: true };
}

/**
 * 金額文字列のバリデーション（整数円のみ）
 */
export function validateAmount(amountStr: string): ValidationResult {
  const trimmed = amountStr.trim();
  if (!trimmed) {
    return { isValid: false, error: '金額を入力してください' };
  }

  // カンマを除去
  const normalized = trimmed.replace(/,/g, '');

  // 数値チェック（整数のみ）
  const num = Number(normalized);
  if (isNaN(num)) {
    return { isValid: false, error: '有効な数値を入力してください' };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: '整数円で入力してください' };
  }

  if (num < 0) {
    return { isValid: false, error: '0円以上の金額を入力してください' };
  }

  if (num > 100000000) {
    return { isValid: false, error: '金額が大きすぎます（1億円以下）' };
  }

  return { isValid: true };
}

/**
 * 金額文字列を整数円に変換（カンマ除去後）
 */
export function parseAmount(amountStr: string): number {
  const normalized = amountStr.trim().replace(/,/g, '');
  const num = Number(normalized);
  return Number.isInteger(num) && num >= 0 ? num : 0;
}

/**
 * 支払いタイトルのバリデーション
 */
export function validateExpenseTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: '支払い内容を入力してください' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: '支払い内容は100文字以内で入力してください' };
  }
  return { isValid: true };
}
