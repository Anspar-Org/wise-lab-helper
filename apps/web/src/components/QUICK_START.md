# Design System Quick Start Guide

Quick reference for using the STEM Lab Assistant component library.

## Import Components

```tsx
// Import from the component index
import { Button, Input, Card, Icon, Tabs } from '@components';

// Or import individually
import Button from '@components/Button';
```

## Most Common Patterns

### 1. Simple Button

```tsx
<Button onClick={handleClick}>
  Click Me
</Button>
```

### 2. Button with Icon

```tsx
import { Star } from 'lucide-react';

<Button
  variant="primary"
  icon={<Icon name="Star" size="min" />}
>
  Favorite
</Button>
```

### 3. Form Input with Validation

```tsx
const [value, setValue] = useState('');
const [error, setError] = useState('');

<Input
  label="Email"
  type="email"
  required
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  placeholder="student@school.edu"
/>
```

### 4. Card Container

```tsx
<Card title="My Card" elevation="1">
  <p>Card content goes here</p>
</Card>
```

### 5. Tabs Navigation

```tsx
const [activeTab, setActiveTab] = useState('tab1');

const tabs = [
  { id: 'tab1', label: 'Overview', content: <Overview /> },
  { id: 'tab2', label: 'Details', content: <Details /> },
];

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### 6. Modal Dialog

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to continue?</p>
  <div className="flex gap-4 mt-4">
    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

### 7. Complete Page Layout

```tsx
import { LayoutGrid } from '@components';

function MyPage() {
  return (
    <LayoutGrid
      header={<h1>STEM Lab</h1>}
      sidebar={<nav>Navigation here</nav>}
      footer={<p>© 2024</p>}
    >
      {/* Main content */}
      <Card>
        <h2>Welcome!</h2>
      </Card>
    </LayoutGrid>
  );
}
```

## Component Cheat Sheet

| Component | Key Props | Use Case |
|-----------|-----------|----------|
| **Button** | `variant`, `size`, `loading`, `icon` | Actions, forms, navigation |
| **Input** | `label`, `type`, `error`, `required` | Forms, search, data entry |
| **Card** | `title`, `elevation`, `onClick` | Content containers |
| **Icon** | `name`, `size`, `color` | Visual indicators |
| **Avatar** | `src`, `seed`, `initials`, `size` | User profiles |
| **Badge** | `variant`, `onRemove` | Status, labels, tags |
| **ProgressBar** | `current`, `max`, `showPercent` | Loading, progress |
| **Tabs** | `tabs`, `activeTab`, `onTabChange` | Content organization |
| **Modal** | `isOpen`, `onClose`, `title` | Dialogs, confirmations |

## Styling Tips

### Use Custom Classes

```tsx
// Good - uses custom design system classes
<Button className="min-h-touch rounded-medium">Click</Button>

// Avoid - inline styles
<Button style={{ minHeight: '44px' }}>Click</Button>
```

### Color Variants

- **Primary** (indigo): Main actions, CTAs
- **Success** (green): Completion, positive actions
- **Warning** (amber): Caution, alerts
- **Info** (cyan): Information, tips
- **Accent** (pink): Highlights, special features

### Spacing

Use Tailwind spacing: `p-4`, `m-6`, `gap-3`, etc.
- 4 = 16px
- 6 = 24px
- 8 = 32px

## Accessibility Checklist

- [ ] All inputs have labels
- [ ] Buttons have descriptive text or aria-label
- [ ] Images have alt text
- [ ] Interactive elements are keyboard accessible
- [ ] Color is not the only indicator (use icons + text)
- [ ] Touch targets are at least 44x44px

## Common Issues

### Icon Not Showing

```tsx
// Wrong - importing from wrong package
import { Star } from 'react-icons';

// Correct - use our Icon component
import { Icon } from '@components';
<Icon name="Star" />

// Or use lucide-react directly
import { Star } from 'lucide-react';
<Star className="w-6 h-6" />
```

### TypeScript Errors

Make sure you're using the correct prop types:

```tsx
// Type error - variant doesn't exist
<Button variant="danger">Delete</Button>

// Correct - use valid variants
<Button variant="primary">Delete</Button>
```

### Styling Not Applied

Import the theme CSS in your main file:

```tsx
// In main.tsx or App.tsx
import '@/styles/theme.css';
```

## Need Help?

- Check `/src/components/README.md` for full documentation
- Look at component test files for usage examples
- Review Tailwind config at `/apps/web/tailwind.config.js`
