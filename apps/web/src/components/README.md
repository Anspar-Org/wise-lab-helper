# STEM Lab Assistant - Design System Component Library

A comprehensive, age-appropriate (9-11 years), accessible component library for the STEM Lab Assistant application. Built with React, TypeScript, and Tailwind CSS following TDD principles.

## Table of Contents

- [Overview](#overview)
- [Style Guide](#style-guide)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Accessibility](#accessibility)
- [Tailwind Conventions](#tailwind-conventions)

## Overview

This component library implements the **Discovery Lab (Palette C)** style guide with a focus on:

- **Child-friendly design** for ages 9-11
- **WCAG 2.1 AA accessibility** standards
- **Touch-friendly interactions** (44x44px minimum touch targets)
- **Console-style layout** (1920x1000px baseline)
- **Consistent spacing** and visual hierarchy

## Style Guide

### Color Palette (Discovery Lab - Default)

```css
Primary Colors:
- Indigo: #5C6BC0  (primary actions, links)
- Green: #66BB6A   (success, completion)
- Amber: #FFA726   (warnings, attention)
- Cyan: #26C6DA    (info, highlights)
- Pink: #EC407A    (accents, achievements)
- Lime: #9CCC65    (secondary actions)

Background & Text:
- Background: #FAFAFA
- Surface: #FFFFFF
- Text Primary: #424242
- Text Secondary: #757575
```

### Typography

```css
Font Family: 'Gill Sans', -apple-system, sans-serif
Font Sizes:
- XS: 12px (labels, captions)
- SM: 14px (primary text - recommended)
- Base: 16px (buttons - minimum)
- LG: 18px (small headers)
- XL: 20px (medium headers)
- 2XL: 24px (large headers)

Line Height: 1.618 (golden ratio for readability)
```

### Spacing System

Based on 4px increments:
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

### Interactive Elements

- **Buttons**: Min 48px height, 120px width
- **Touch Targets**: Min 44x44px
- **Form Inputs**: Min 40px height
- **Icons**: Min 24x24px (default 44x44px for touch)
- **Animations**: 200-300ms duration
- **Border Radius**: 4px (small), 8px (medium), 12px (large)

## Components

### Core UI Components

#### Button
Interactive button with multiple variants, sizes, and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `loading`: boolean (shows spinner, disables button)
- `disabled`: boolean
- `icon`: React.ReactNode (left icon)
- `onClick`: () => void

**Accessibility:**
- ✓ Keyboard navigation (Enter, Space)
- ✓ ARIA disabled states
- ✓ 44x44px minimum touch target
- ✓ Focus indicators

#### Input
Form input field with validation and error states.

**Props:**
- `label`: string (field label)
- `type`: 'text' | 'email' | 'password' | 'number' (default: 'text')
- `error`: string (error message)
- `required`: boolean
- `disabled`: boolean
- `placeholder`: string
- `value`: string
- `onChange`: (e) => void

**Accessibility:**
- ✓ Label association
- ✓ Error announcements (aria-invalid, aria-describedby)
- ✓ Required indicator
- ✓ 44x44px minimum touch target

#### Card
Container component with elevation and optional hover effects.

**Props:**
- `title`: string (optional header)
- `elevation`: '1' | '2' | '3' (shadow level, default: '1')
- `onClick`: () => void (makes card interactive)
- `children`: React.ReactNode

**Features:**
- Rounded corners (8px)
- Shadow elevation levels
- Hover lift effect (when clickable)
- Keyboard navigation (when clickable)

#### Icon
Wrapper for Lucide icons with consistent sizing.

**Props:**
- `name`: keyof LucideIcons (icon name from Lucide)
- `size`: 'min' | 'default' | 'large' (24px | 44px | 64px)
- `color`: string (Tailwind color class)

**Examples:**
- Star, Check, X, Heart, Settings, User, etc.
- See Lucide React documentation for full icon list

#### Avatar
User avatar with DiceBear integration and fallback options.

**Props:**
- `src`: string (image URL)
- `seed`: string (DiceBear seed for generated avatar)
- `initials`: string (fallback initials)
- `size`: 'small' | 'medium' | 'large' (32px | 48px | 64px)
- `alt`: string (accessibility text)

**Fallback Chain:**
1. Custom image (src)
2. DiceBear generated avatar (seed)
3. Initials (if provided)
4. Generic user icon

#### Badge
Small status indicator (UI element, not achievement badge).

**Props:**
- `variant`: 'primary' | 'success' | 'warning' | 'info' | 'accent'
- `size`: 'small' | 'medium' | 'large'
- `onRemove`: () => void (shows close button)
- `children`: React.ReactNode

**Use Cases:**
- Status indicators
- Labels
- Tags
- Removable filters

#### ProgressBar
Visual progress indicator with percentage display.

**Props:**
- `current`: number (current value)
- `max`: number (maximum value)
- `showPercent`: boolean (display percentage text)
- `color`: string (Tailwind bg-color class)
- `aria-label`: string (accessibility label)

**Features:**
- Animated transitions
- Automatic percentage calculation
- ARIA progressbar role

#### Tabs
Console-style tabs with keyboard navigation.

**Props:**
- `tabs`: Tab[] (array of tab objects)
- `activeTab`: string (active tab ID)
- `onTabChange`: (tabId: string) => void

**Tab Object:**
```typescript
{
  id: string;
  label: string;
  content: React.ReactNode;
}
```

**Accessibility:**
- ✓ ARIA tablist/tab/tabpanel roles
- ✓ Keyboard navigation (Arrow keys)
- ✓ Active state indicators

#### Modal
Accessible modal dialog with overlay and keyboard support.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (modal title)
- `maxWidth`: string (default: '600px')
- `children`: React.ReactNode

**Features:**
- ESC key to close
- Click overlay to close
- Prevents body scroll
- Animated entrance/exit
- Focus trap (planned)

### Layout Components

#### ConsoleContainer
Main container with 1920x1000px max dimensions.

#### Header
Fixed height (80px) header with shadow.

#### Sidebar
Fixed width (200px) sidebar with scroll.

#### MainContent
Flexible main content area with scroll.

#### Footer
Fixed height (100px) footer with border.

#### LayoutGrid
Complete layout system combining all layout components.

**Props:**
```typescript
{
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

## Usage Examples

### Example 1: Button with Icon

```tsx
import { Button, Icon } from '@components';
import { Star } from 'lucide-react';

function MyComponent() {
  return (
    <Button
      variant="primary"
      icon={<Icon name="Star" size="min" />}
      onClick={() => console.log('Clicked!')}
    >
      Favorite
    </Button>
  );
}
```

### Example 2: Form with Input and Validation

```tsx
import { Input, Button } from '@components';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        label="Email Address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        placeholder="student@school.edu"
      />
      <Button type="submit" className="mt-4">
        Login
      </Button>
    </form>
  );
}
```

### Example 3: Complete Layout with Tabs

```tsx
import { LayoutGrid, Tabs, Card, Avatar } from '@components';
import { useState } from 'react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', content: <Overview /> },
    { id: 'lessons', label: 'Lessons', content: <Lessons /> },
    { id: 'progress', label: 'Progress', content: <Progress /> },
  ];

  return (
    <LayoutGrid
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="text-child-2xl font-bold">STEM Lab</h1>
          <Avatar seed="student123" size="medium" />
        </div>
      }
      sidebar={
        <nav>
          <h2 className="text-child-lg font-semibold mb-4">Navigation</h2>
          {/* Sidebar content */}
        </nav>
      }
      footer={
        <p className="text-child-sm text-text-secondary">
          © 2024 STEM Lab Assistant
        </p>
      }
    >
      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Card>
    </LayoutGrid>
  );
}
```

## Accessibility

All components follow WCAG 2.1 AA standards:

### Keyboard Navigation
- **Tab**: Move between interactive elements
- **Enter/Space**: Activate buttons, links
- **Arrow Keys**: Navigate tabs, lists
- **ESC**: Close modals, dialogs

### Screen Reader Support
- All components have proper ARIA roles
- Form inputs have associated labels
- Error messages are announced
- Interactive elements have accessible names
- State changes are communicated

### Touch Targets
- Minimum 44x44px for all interactive elements
- Generous padding on buttons and inputs
- Touch-friendly spacing between elements

### Color Contrast
- Text meets 4.5:1 contrast ratio
- UI components meet 3:1 contrast ratio
- Focus indicators are clearly visible

## Tailwind Conventions

### Custom Classes

```css
/* Size Classes */
.min-h-touch    /* 44px - minimum touch target */
.min-h-button   /* 48px - button height */
.min-h-input    /* 40px - input height */
.min-w-button   /* 120px - button width */

/* Radius Classes */
.rounded-small  /* 4px */
.rounded-medium /* 8px */
.rounded-large  /* 12px */

/* Shadow Classes */
.shadow-elevation-1  /* Subtle shadow */
.shadow-elevation-2  /* Medium shadow */
.shadow-elevation-3  /* Strong shadow */

/* Duration Classes */
.duration-fast   /* 200ms */
.duration-normal /* 250ms */
.duration-slow   /* 300ms */

/* Console Layout */
.max-w-console   /* 1920px */
.max-h-console   /* 1000px */
```

### Typography Classes

```css
.text-child-xs    /* 12px */
.text-child-sm    /* 14px - primary text */
.text-child-base  /* 16px - buttons */
.text-child-lg    /* 18px - small headers */
.text-child-xl    /* 20px - medium headers */
.text-child-2xl   /* 24px - large headers */
```

### Color Classes

```css
/* Primary Colors */
.bg-primary, .text-primary, .border-primary
.bg-success, .text-success, .border-success
.bg-warning, .text-warning, .border-warning
.bg-info, .text-info, .border-info
.bg-accent, .text-accent, .border-accent

/* Background & Text */
.bg-background, .bg-surface
.text-text-primary, .text-text-secondary
```

## Notes for Other Agents

### Using the Design System

1. **Import components from index**:
   ```tsx
   import { Button, Input, Card } from '@components';
   ```

2. **Use Tailwind custom classes** instead of inline styles:
   ```tsx
   // Good
   <div className="min-h-touch rounded-medium shadow-elevation-1">

   // Avoid
   <div style={{ minHeight: '44px', borderRadius: '8px' }}>
   ```

3. **Follow accessibility patterns**:
   - Always provide labels for inputs
   - Use semantic HTML elements
   - Include ARIA labels for icons
   - Test keyboard navigation

4. **Respect touch targets**:
   - All interactive elements should use `min-h-touch` class
   - Ensure adequate spacing between clickable elements

5. **Use consistent colors**:
   - Primary (indigo) for main actions
   - Success (green) for completion
   - Warning (amber) for caution
   - Info (cyan) for information

### Testing

All components have comprehensive test coverage. Run tests with:

```bash
npm test                  # Run all tests
npm test -- Component.test.tsx  # Run specific test
npm test:coverage         # Generate coverage report
```

### Theme Switching (Future)

The CSS custom properties in `/src/styles/theme.css` support runtime theme switching:

```tsx
// Switch to Modern Tech palette
document.documentElement.setAttribute('data-theme', 'modern');

// Switch to Explorer palette
document.documentElement.setAttribute('data-theme', 'explorer');

// Switch back to Discovery Lab (default)
document.documentElement.setAttribute('data-theme', 'discovery');
```

## Contributing

When adding new components:

1. **Follow TDD**: Write tests first, then implementation
2. **Use TypeScript**: Strict mode, no 'any' types
3. **Add to index.ts**: Export from component index
4. **Document here**: Add usage examples and props
5. **Test accessibility**: Keyboard, screen reader, contrast
6. **Match style guide**: Colors, spacing, typography

## Questions or Issues?

Refer to the main project documentation or consult the style guide at `/style guide.md`.
