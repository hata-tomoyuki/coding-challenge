'use client';

import { useState, type KeyboardEvent } from 'react';
import { Participant } from '@/app/types';
import { TextField } from './forms/TextField';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { DeleteButton } from './ui/DeleteButton';
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
    <Section title="参加者">
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
          <Button onClick={handleAdd} disabled={!name.trim()}>
            追加
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
