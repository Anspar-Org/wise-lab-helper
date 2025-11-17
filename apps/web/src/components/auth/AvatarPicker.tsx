/**
 * AvatarPicker Component
 * Grid of avatar options using DiceBear API
 * Age-appropriate and fun for elementary students
 */

import React from 'react';
import { Shuffle } from 'lucide-react';
import type { AvatarConfig } from '@/types/auth';

export interface AvatarPickerProps {
  /** Username to use as seed for consistency */
  username: string;
  /** Called when an avatar is selected */
  onSelect: (config: AvatarConfig) => void;
  /** Currently selected avatar style */
  selectedStyle?: string;
  /** Custom className */
  className?: string;
}

// Available DiceBear styles that are age-appropriate
const AVATAR_STYLES = [
  { id: 'adventurer', name: 'Adventurer' },
  { id: 'adventurer-neutral', name: 'Adventurer Neutral' },
  { id: 'avataaars', name: 'Avataaars' },
  { id: 'avataaars-neutral', name: 'Avataaars Neutral' },
  { id: 'big-ears', name: 'Big Ears' },
  { id: 'big-ears-neutral', name: 'Big Ears Neutral' },
  { id: 'bottts', name: 'Bottts' },
  { id: 'bottts-neutral', name: 'Bottts Neutral' },
  { id: 'fun-emoji', name: 'Fun Emoji' },
  { id: 'pixel-art', name: 'Pixel Art' },
  { id: 'pixel-art-neutral', name: 'Pixel Art Neutral' },
  { id: 'lorelei', name: 'Lorelei' },
];

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  username,
  onSelect,
  selectedStyle,
  className = '',
}) => {
  const generateAvatarUrl = (style: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}`;
  };

  const handleStyleSelect = (style: string) => {
    const config: AvatarConfig = {
      style,
      seed: username,
    };
    onSelect(config);
  };

  const handleRandomize = () => {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    handleStyleSelect(randomStyle.id);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-child-lg font-semibold text-text-primary mb-2">
          Choose your avatar
        </h3>
        <p className="text-child-sm text-text-secondary">
          Pick one you like or randomize for a surprise!
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {AVATAR_STYLES.map(({ id, name }) => {
          const isSelected = selectedStyle === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleStyleSelect(id)}
              aria-pressed={isSelected}
              aria-label={`Select ${name} avatar`}
              className={`
                relative aspect-square rounded-medium overflow-hidden
                transition-all duration-fast
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                ${isSelected
                  ? 'ring-4 ring-primary scale-105 shadow-lg'
                  : 'ring-2 ring-gray-200 hover:ring-primary hover:scale-105'
                }
              `}
            >
              <img
                src={generateAvatarUrl(id)}
                alt={name}
                className="w-full h-full object-cover bg-white"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center">
                  <span className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white text-lg">
                    ✓
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-medium font-medium hover:bg-green-600 transition-colors"
        >
          <Shuffle size={20} />
          Randomize
        </button>
      </div>

      {selectedStyle && (
        <div className="flex flex-col items-center gap-3 p-4 bg-primary-50 rounded-medium">
          <p className="text-child-sm font-medium text-text-primary">
            Your selected avatar:
          </p>
          <img
            src={generateAvatarUrl(selectedStyle)}
            alt="Selected avatar"
            className="w-24 h-24 rounded-full bg-white border-4 border-primary shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;
