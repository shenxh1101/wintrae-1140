import React from 'react';
import { Card } from './Card';
import type { MoodType } from '../types';
import { moodEmojis } from '../data/mockData';
import { clsx } from 'clsx';

interface MoodPickerProps {
  selectedMood?: MoodType;
  onSelect: (mood: MoodType) => void;
  showLabel?: boolean;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({
  selectedMood,
  onSelect,
  showLabel = true,
}) => {
  const moods: MoodType[] = ['happy', 'excited', 'neutral', 'sad', 'angry'];

  return (
    <Card>
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">今天心情怎么样？</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => {
          const moodData = moodEmojis[mood];
          const isSelected = selectedMood === mood;

          return (
            <button
              key={mood}
              onClick={() => onSelect(mood)}
              className={clsx(
                'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200',
                isSelected
                  ? 'bg-primary-50 border-2 border-primary-500 scale-110'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              )}
            >
              <span className="text-4xl mb-1">{moodData.emoji}</span>
              {showLabel && (
                <span className="text-xs font-semibold text-gray-700">
                  {moodData.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
