export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  payerId: string;
  amountYen: number; // 整数円のみ
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
