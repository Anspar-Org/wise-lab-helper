---
applyTo: "apps/web/**/*.{ts,tsx,js,jsx}"
---

# Frontend Development Instructions

## Overview

The frontend is a React 18 application with TypeScript, built with Vite and styled with Tailwind CSS. It follows the style guide defined in `style guide.md`.

**Current Status**: Frontend is planned but not yet implemented. These instructions prepare for future development.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling (configured per style guide)
- **Zustand** for state management
- **React Router** for navigation
- **React Query** for API data fetching
- **Zod** for runtime validation
- **Vitest + React Testing Library** for testing

## Component Architecture

### Component Structure

```
apps/web/src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   └── Avatar/
│   ├── layout/           # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── features/         # Feature-specific components
│       ├── auth/
│       ├── lessons/
│       └── notebook/
├── pages/                # Page components
│   ├── Home/
│   ├── Dashboard/
│   ├── Lessons/
│   └── Notebook/
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
├── services/             # API services
├── utils/                # Utility functions
└── types/                # TypeScript types
```

## UI/UX Guidelines (from style guide.md)

### Core Philosophy

- **Single-screen, non-scrolling interface** (1920x1000px baseline)
- **Console game-style UI** with all elements discoverable
- No "below the fold" hidden functionality
- Scrolling ONLY for variable-length content (lists, galleries)

### Typography

```typescript
// Font configuration in Tailwind
const config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Gill Sans', 'Sassoon Primary', 'Comic Sans MS', 'sans-serif']
      },
      fontSize: {
        'body-primary': '14pt',   // Ages 9-10
        'body-secondary': '12pt', // Ages 10-11
        'header-sm': '18pt',
        'header-lg': '24pt',
        'button': '16pt'
      }
    }
  }
};
```

### Color Palette (Palette C: Discovery Lab)

```typescript
// tailwind.config.js
colors: {
  primary: {
    indigo: '#5C6BC0',
    green: '#66BB6A',
    amber: '#FFA726'
  },
  secondary: {
    cyan: '#26C6DA',
    pink: '#EC407A',
    lime: '#9CCC65'
  },
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: {
    primary: '#424242',
    secondary: '#757575'
  }
}
```

**Note**: Allow users to select from three palettes in preferences.

### Interactive Elements

```typescript
// Component design constraints
const CONSTRAINTS = {
  button: {
    minHeight: '48px',
    minWidth: '120px'
  },
  touchTarget: {
    minSize: '44px' // 44x44px minimum
  },
  formControl: {
    minHeight: '40px'
  },
  animation: {
    duration: '200-300ms'
  }
};
```

### Layout Structure

```tsx
// Main layout template
<div className="h-screen flex flex-col">
  {/* Header: 80px */}
  <header className="h-20 bg-surface shadow">
    {/* Navigation, user info, global actions */}
  </header>

  <div className="flex flex-1 overflow-hidden">
    {/* Sidebar: 200px */}
    <aside className="w-50 bg-surface border-r">
      {/* Tool selection, primary navigation */}
    </aside>

    {/* Main content area */}
    <main className="flex-1 overflow-auto p-6">
      {/* Primary content/workspace */}
    </main>

    {/* Right panel: 300px (optional) */}
    <aside className="w-75 bg-surface border-l p-4">
      {/* Properties, details, help */}
    </aside>
  </div>

  {/* Footer: 100px */}
  <footer className="h-25 bg-surface border-t">
    {/* Status, progress, quick actions */}
  </footer>
</div>
```

## Component Development Pattern

### Component Template

```tsx
// components/common/Button/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-button rounded-lg transition-colors',
          'min-h-[48px] min-w-[120px]',
          {
            'bg-primary-indigo text-white hover:bg-primary-indigo/90': variant === 'primary',
            'bg-secondary-cyan text-white hover:bg-secondary-cyan/90': variant === 'secondary',
            'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Component Tests

```tsx
// components/common/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-indigo');
  });

  it('meets minimum size requirements', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-h-[48px]', 'min-w-[120px]');
  });
});
```

## State Management (Zustand)

### Store Structure

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'student' | 'coach' | 'admin';
  avatarConfig: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        // Implementation
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## API Integration (React Query)

### API Service

```typescript
// services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### React Query Hooks

```typescript
// hooks/useLessons.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  gradeLevel: number[];
}

export const useLessons = (filters?: any) => {
  return useQuery({
    queryKey: ['lessons', filters],
    queryFn: async () => {
      const response = await api.get('/lessons', { params: filters });
      return response.data.data as Lesson[];
    },
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonData: Partial<Lesson>) => {
      const response = await api.post('/lessons', lessonData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
};
```

## Authentication Flow

### Student PIN Authentication

```tsx
// pages/Login/StudentPinLogin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';

export const StudentPinLogin = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ username, pin, authType: 'pin' });
      navigate('/dashboard');
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-body-primary mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full min-h-[40px] px-4 rounded-lg border"
          required
        />
      </div>

      <div>
        <label className="block text-body-primary mb-2">
          PIN
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full min-h-[40px] px-4 rounded-lg border text-center text-2xl tracking-widest"
          required
        />
      </div>

      <Button type="submit" variant="primary" className="w-full">
        Log In
      </Button>
    </form>
  );
};
```

### Animal Grid Authentication

```tsx
// pages/Login/AnimalGridLogin.tsx
// For K-2 students - order-independent animal selection
// Implementation details based on requirements
```

## Routing

```tsx
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lessons"
          element={
            <ProtectedRoute>
              <LessonsPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// Always include proper ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// Use semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
};

// Focus management
const buttonRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  buttonRef.current?.focus();
}, []);
```

### Color Contrast

Ensure text meets WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio

## Age-Appropriate Design (Ages 9-11)

### Visual Design

- Large, clear text (14-16pt minimum)
- High contrast colors
- Generous spacing between elements
- Clear visual feedback for actions
- Celebratory animations for achievements

### Interaction Design

- Simple, direct navigation
- Immediate feedback for all actions
- Clear progress indicators
- Undo functionality where appropriate
- Help text readily available

### Content Guidelines

- Use simple, clear language
- Sentence case (avoid all caps)
- Short paragraphs
- Visual aids and icons
- Positive, encouraging tone

## Performance Optimization

```typescript
// Code splitting
const DashboardPage = lazy(() => import('@/pages/Dashboard'));

// Memoization
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* ... */}</div>;
});

// Virtualized lists for large datasets
import { FixedSizeList } from 'react-window';

// Image optimization
<img
  src={imageUrl}
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

## Testing Strategy

### Component Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LessonCard', () => {
  it('displays lesson information', () => {
    const lesson = {
      id: '1',
      title: 'Engineering Design Process',
      description: 'Learn the steps...',
      category: 'methodology',
    };

    render(<LessonCard lesson={lesson} />);

    expect(screen.getByText('Engineering Design Process')).toBeInTheDocument();
  });

  it('navigates to lesson when clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<LessonCard lesson={lesson} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: 'Start Lesson' }));
    expect(onNavigate).toHaveBeenCalledWith(lesson.id);
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('student can complete a lesson', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="username"]', 'alice');
  await page.fill('[name="pin"]', '1234');
  await page.click('button[type="submit"]');

  // Navigate to lessons
  await page.click('text=Lessons');
  await expect(page).toHaveURL('/lessons');

  // Start a lesson
  await page.click('text=Engineering Design Process');
  await page.click('text=Start Lesson');

  // Complete steps
  await page.click('text=Next Step');
  await page.click('text=Next Step');
  await page.click('text=Complete Lesson');

  // Verify completion
  await expect(page.locator('text=Lesson Completed!')).toBeVisible();
});
```

## Common Issues

1. **CORS errors**: Ensure API CORS is configured properly
2. **State persistence**: Check localStorage/sessionStorage
3. **Token expiration**: Implement token refresh logic
4. **Route protection**: Verify auth checks on protected routes
5. **Form validation**: Use Zod schemas consistently

## Resources

- React documentation: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- Zustand: https://zustand-demo.pmnd.rs/
- React Query: https://tanstack.com/query/latest
- Style guide: `style guide.md`
- UI/UX requirements: `AI_AGENT_PROMPT.md`
