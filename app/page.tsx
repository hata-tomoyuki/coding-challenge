'use client';

import { useEffect, useReducer } from 'react';
import { ParticipantsSection } from './components/ParticipantsSection';
import { ExpensesSection } from './components/ExpensesSection';
import { SettlementSection } from './components/SettlementSection';
import { appReducer } from './lib/reducer';
import { saveState, loadState, clearState } from './lib/storage';
import { AppState, Participant, Expense } from './types';

const initialState: AppState = {
  participants: [],
  expenses: [],
};

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初期化時にlocalStorageから状態を復元
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // 状態変更時にlocalStorageに保存
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleAddParticipant = (participant: Participant) => {
    dispatch({ type: 'ADD_PARTICIPANT', payload: participant });
  };

  const handleRemoveParticipant = (id: string) => {
    dispatch({ type: 'REMOVE_PARTICIPANT', payload: id });
  };

  const handleUpdateParticipant = (participant: Participant) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: participant });
  };

  const handleAddExpense = (expense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const handleUpdateExpense = (expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const handleRemoveExpense = (id: string) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: id });
  };

  const handleReset = () => {
    if (confirm('すべてのデータをリセットしますか？')) {
      dispatch({ type: 'RESET_ALL' });
      clearState();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            旅行費用精算アプリ
          </h1>
          <p className="text-gray-600">
            参加者と支払いを登録して、割り勘を計算しましょう
          </p>
        </header>

        <ParticipantsSection
          participants={state.participants}
          onAdd={handleAddParticipant}
          onUpdate={handleUpdateParticipant}
          onRemove={handleRemoveParticipant}
        />

        <ExpensesSection
          participants={state.participants}
          expenses={state.expenses}
          onAdd={handleAddExpense}
          onUpdate={handleUpdateExpense}
          onRemove={handleRemoveExpense}
        />

        <SettlementSection
          participants={state.participants}
          expenses={state.expenses}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
