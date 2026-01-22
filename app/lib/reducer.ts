import { AppState, AppAction } from '@/app/types';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.payload],
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
