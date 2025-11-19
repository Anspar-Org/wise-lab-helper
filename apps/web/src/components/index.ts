/**
 * STEM Lab Assistant - Design System Component Library
 * Centralized exports for all design system components
 *
 * Usage:
 * import { Button, Input, Card } from '@components';
 */

// Core UI Components
export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Card } from './Card';
export type { CardProps } from './Card';

export { default as Icon } from './Icon';
export type { IconProps } from './Icon';

export { default as Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { default as Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { default as ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { default as Tabs } from './Tabs';
export type { TabsProps, Tab } from './Tabs';

export { default as Modal } from './Modal';
export type { ModalProps } from './Modal';

// Layout Components
export {
  ConsoleContainer,
  Header,
  Sidebar,
  MainContent,
  Footer,
  LayoutGrid,
} from './Layout';

export type {
  ConsoleContainerProps,
  HeaderProps,
  SidebarProps,
  MainContentProps,
  FooterProps,
  LayoutGridProps,
} from './Layout';
