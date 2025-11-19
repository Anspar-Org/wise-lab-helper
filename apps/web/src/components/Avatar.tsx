/**
 * Avatar Component
 * User avatar with DiceBear API integration and fallback
 * Meets WCAG 2.1 AA accessibility standards
 */

import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  /** Avatar image URL or DiceBear seed */
  src?: string;
  /** Alt text for avatar */
  alt?: string;
  /** Avatar size */
  size?: 'small' | 'medium' | 'large';
  /** DiceBear seed for generating avatar */
  seed?: string;
  /** Fallback initials */
  initials?: string;
  /** Custom className */
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  size = 'medium',
  seed,
  initials,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Size classes
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',      // 32px
    medium: 'w-12 h-12 text-sm',   // 48px
    large: 'w-16 h-16 text-base',  // 64px
  };

  // Generate DiceBear URL if seed is provided
  const diceBearUrl = seed
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
    : null;

  // Determine final image source
  const finalSrc = src || diceBearUrl;

  // Base classes
  const baseClasses = `rounded-full bg-primary-100 flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`;

  // Show image if available and not errored
  if (finalSrc && !imageError) {
    return (
      <div className={baseClasses}>
        <img
          src={finalSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Show initials if provided
  if (initials) {
    return (
      <div className={`${baseClasses} bg-primary text-white font-semibold`}>
        {initials.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  // Show fallback icon
  return (
    <div className={`${baseClasses} bg-gray-200 text-gray-500`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
};

export default Avatar;
