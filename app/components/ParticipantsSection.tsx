'use client';

import { useState, type KeyboardEvent } from 'react';
import { Participant } from '@/app/types';
import { TextField } from './forms/TextField';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { DeleteButton } from './ui/DeleteButton';
import { EditButton } from './ui/EditButton';
import { validateParticipantName, type ValidationResult } from '@/app/lib/validation';

interface ParticipantsSectionProps {
  participants: Participant[];
  onAdd: (participant: Participant) => void;
  onUpdate: (participant: Participant) => void;
  onRemove: (id: string) => void;
}

export function ParticipantsSection({
  participants,
  onAdd,
  onUpdate,
  onRemove,
}: ParticipantsSectionProps) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameValidation, setNameValidation] = useState<ValidationResult>({
    isValid: true,
  });

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setNameValidation({ isValid: true });
  };

  const handleSubmit = () => {
    const validationResult = validateParticipantName(name);
    setNameValidation(validationResult);

    if (validationResult.isValid) {
      const trimmed = name.trim();
      if (editingId) {
        onUpdate({ id: editingId, name: trimmed });
        resetForm();
        return;
      }

      const newParticipant: Participant = { id: crypto.randomUUID(), name: trimmed };
      onAdd(newParticipant);
      resetForm();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setName(participant.name);
    setNameValidation({ isValid: true });
  };

  return (
    <Section title="参加者">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
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
        <div className="flex items-end gap-2">
          {editingId && (
            <Button variant='primary-gray' onClick={resetForm}>
              キャンセル
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {editingId ? '更新' : '追加'}
          </Button>
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
                <EditButton
                  onClick={() => handleStartEdit(p)}
                  label={`${p.name}を編集`}
                />
                <DeleteButton onClick={() => onRemove(p.id)} label={`${p.name}を削除`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">参加者を追加してください</p>
      )}
    </Section>
  );
}
