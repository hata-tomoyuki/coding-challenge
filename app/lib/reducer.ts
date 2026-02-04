import { AppState, AppAction } from '@/app/types';

/**
 * アプリケーションの状態を管理するreducer関数
 *
 * @param state - 現在のアプリケーション状態
 * @param action - 実行するアクション（参加者の追加/削除、支払いの追加/削除、リセット、状態の読み込み）
 * @returns 新しいアプリケーション状態
 *
 * @remarks
 * - ADD_PARTICIPANT: 参加者を追加
 * - REMOVE_PARTICIPANT: 参加者を削除（関連する支払いも自動削除）
 * - ADD_EXPENSE: 支払いを追加
 * - REMOVE_EXPENSE: 支払いを削除
 * - RESET_ALL: すべてのデータをリセット
 * - LOAD_STATE: localStorageから読み込んだ状態を適用
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.payload],
      };

    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.payload),
        expenses: state.expenses.filter((e) => e.payerId !== action.payload),
      };

    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'REMOVE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };

    case 'RESET_ALL':
      return {
        participants: [],
        expenses: [],
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}
