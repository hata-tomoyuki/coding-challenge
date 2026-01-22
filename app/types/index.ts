export interface Participant {
  id: string;
  name: string;
}

export type CurrencyCode =
  | 'JPY'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'CNY'
  | 'HKD'
  | 'KRW'
  | 'SGD'
  | 'THB'
  | 'TWD'
  | 'VND'
  | 'INR';

export interface Expense {
  id: string;
  payerId: string;
  /** 元通貨コード（JPY固定ではない） */
  currency: CurrencyCode;
  /** 元通貨の最小単位（例: USDならセント、JPYなら円）で保持する整数 */
  amountMinor: number;
  /** 支払い追加時点で取得した「1通貨（メジャー単位）= 何JPYか」のレート（固定） */
  fxRateToJpy: number;
  /** JPY換算額（整数円）。精算ロジックはこれを使用する */
  amountYen: number;
  title: string;
  createdAt: number; // timestamp
}

export interface AppState {
  participants: Participant[];
  expenses: Expense[];
}

export type AppAction =
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'REMOVE_PARTICIPANT'; payload: string } // id
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string } // id
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_STATE'; payload: AppState };
