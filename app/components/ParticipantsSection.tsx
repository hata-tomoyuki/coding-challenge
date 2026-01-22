'use client';

import { useState, type KeyboardEvent } from 'react';
import { Participant } from '@/app/types';
import { TextField } from './forms/TextField';
import { validateParticipantName, type ValidationResult } from '@/app/lib/validation';

interface ParticipantsSectionProps {
  participants: Participant[];
  onAdd: (participant: Participant) => void;
  onRemove: (id: string) => void;
}

export function ParticipantsSection({
  participants,
  onAdd,
  onRemove,
}: ParticipantsSectionProps) {
  const [name, setName] = useState('');
  const [nameValidation, setNameValidation] = useState<ValidationResult>({
    isValid: true,
  });

  const handleAdd = () => {
    const validationResult = validateParticipantName(name);
    setNameValidation(validationResult);

    if (validationResult.isValid) {
      const newParticipant: Participant = {
        id: crypto.randomUUID(),
        name: name.trim(),
      };
      onAdd(newParticipant);
      setName('');
      setNameValidation({ isValid: true });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">参加者</h2>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <TextField
            label="名前"
            value={name}
            onChange={setName}
            validation={nameValidation}
            placeholder="参加者の名前を入力"
            required
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      {participants.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 mb-2">参加者一覧</h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
              >
                <span className="text-sm text-gray-800">{p.name}</span>
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-bold"
                  aria-label={`${p.name}を削除`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">参加者を追加してください</p>
      )}
    </section>
  );
}
