/**
 * AnimalGrid Component
 * 5x5 grid of animal emojis for pattern-based authentication
 * Age-appropriate for K-2 students who can't read yet
 */

import React from 'react';

export interface AnimalGridProps {
  /** Currently selected animals */
  selectedAnimals: string[];
  /** Called when an animal is selected/deselected */
  onSelect: (animal: string) => void;
  /** Maximum number of animals that can be selected */
  maxSelection?: number;
  /** Show selection count */
  showCount?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

// Define the 25 animals in order
const ANIMALS = [
  { emoji: '🐶', name: 'dog' },
  { emoji: '🐱', name: 'cat' },
  { emoji: '🐭', name: 'mouse' },
  { emoji: '🐹', name: 'hamster' },
  { emoji: '🐰', name: 'rabbit' },
  { emoji: '🦊', name: 'fox' },
  { emoji: '🐻', name: 'bear' },
  { emoji: '🐼', name: 'panda' },
  { emoji: '🐨', name: 'koala' },
  { emoji: '🐯', name: 'tiger' },
  { emoji: '🦁', name: 'lion' },
  { emoji: '🐮', name: 'cow' },
  { emoji: '🐷', name: 'pig' },
  { emoji: '🐸', name: 'frog' },
  { emoji: '🐵', name: 'monkey' },
  { emoji: '🐔', name: 'chicken' },
  { emoji: '🐧', name: 'penguin' },
  { emoji: '🐦', name: 'bird' },
  { emoji: '🐤', name: 'chick' },
  { emoji: '🐣', name: 'hatching chick' },
  { emoji: '🦆', name: 'duck' },
  { emoji: '🦅', name: 'eagle' },
  { emoji: '🦉', name: 'owl' },
  { emoji: '🦇', name: 'bat' },
  { emoji: '🐺', name: 'wolf' },
];

const AnimalGrid: React.FC<AnimalGridProps> = ({
  selectedAnimals,
  onSelect,
  maxSelection = 4,
  showCount = false,
  disabled = false,
  className = '',
}) => {
  const handleAnimalClick = (animal: string) => {
    if (disabled) return;

    const isSelected = selectedAnimals.includes(animal);

    // If already selected, allow deselection
    if (isSelected) {
      onSelect(animal);
      return;
    }

    // If not selected, check if we've reached max
    if (selectedAnimals.length >= maxSelection) {
      return;
    }

    onSelect(animal);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showCount && (
        <p className="text-center text-child-base font-medium text-text-primary">
          {selectedAnimals.length} of {maxSelection} animals selected
        </p>
      )}

      <div className="grid grid-cols-5 gap-2">
        {ANIMALS.map(({ emoji, name }) => {
          const isSelected = selectedAnimals.includes(emoji);
          const isDisabled = disabled || (!isSelected && selectedAnimals.length >= maxSelection);

          return (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAnimalClick(emoji)}
              disabled={isDisabled}
              aria-label={name}
              aria-pressed={isSelected}
              className={`
                relative min-h-touch aspect-square flex items-center justify-center
                text-4xl rounded-medium transition-all duration-fast
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                ${isSelected
                  ? 'bg-primary-100 ring-4 ring-primary scale-110 shadow-lg'
                  : 'bg-white hover:bg-primary-50 border-2 border-gray-200 hover:border-primary'
                }
                ${isDisabled && !isSelected
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95 cursor-pointer'
                }
              `}
            >
              {emoji}
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!disabled && selectedAnimals.length === maxSelection && (
        <p className="text-center text-child-base font-medium text-success">
          Great choice! ✨
        </p>
      )}
    </div>
  );
};

export default AnimalGrid;
