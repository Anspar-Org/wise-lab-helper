/**
 * Icon Component
 * Wrapper for Lucide icons with consistent sizing and accessibility
 * Meets WCAG 2.1 AA accessibility standards
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon name from Lucide icon set */
  name: keyof typeof LucideIcons;
  /** Icon size preset */
  size?: 'min' | 'default' | 'large';
  /** Icon color (Tailwind class) */
  color?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'default',
  color = 'text-text-primary',
  className = '',
  ...props
}) => {
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[name] as React.FC<LucideIcons.LucideProps>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  // Size classes
  const sizeClasses = {
    min: 'w-6 h-6',      // 24px - minimum icon size
    default: 'w-11 h-11', // 44px - touch-friendly default
    large: 'w-16 h-16',   // 64px - large icon
  };

  // Combine classes
  const iconClasses = `${sizeClasses[size]} ${color} ${className}`;

  return (
    <IconComponent
      className={iconClasses}
      {...props}
    />
  );
};

export default Icon;
