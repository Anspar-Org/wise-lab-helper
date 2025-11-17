/**
 * Layout Components
 * Console-style layout system (1920x1000px baseline)
 * Components: ConsoleContainer, Header, Sidebar, MainContent, Footer
 */

import React from 'react';

// ===== Console Container =====
export interface ConsoleContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ConsoleContainer: React.FC<ConsoleContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-console max-h-console mx-auto bg-background ${className}`}
    >
      {children}
    </div>
  );
};

// ===== Header =====
export interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ children, className = '' }) => {
  return (
    <header
      className={`h-20 bg-surface shadow-elevation-1 flex items-center px-6 ${className}`}
      role="banner"
    >
      {children}
    </header>
  );
};

// ===== Sidebar =====
export interface SidebarProps {
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className = '',
}) => {
  return (
    <aside
      className={`w-50 bg-surface border-r border-gray-200 p-4 overflow-y-auto ${className}`}
      role="complementary"
    >
      {children}
    </aside>
  );
};

// ===== Main Content =====
export interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <main className={`flex-1 p-6 overflow-y-auto ${className}`} role="main">
      {children}
    </main>
  );
};

// ===== Footer =====
export interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ children, className = '' }) => {
  return (
    <footer
      className={`h-25 bg-surface border-t border-gray-200 flex items-center px-6 ${className}`}
      role="contentinfo"
    >
      {children}
    </footer>
  );
};

// ===== Layout Grid =====
export interface LayoutGridProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const LayoutGrid: React.FC<LayoutGridProps> = ({
  header,
  sidebar,
  children,
  footer,
  className = '',
}) => {
  return (
    <ConsoleContainer className={className}>
      <div className="flex flex-col h-full">
        {header && <Header>{header}</Header>}

        <div className="flex flex-1 overflow-hidden">
          {sidebar && <Sidebar>{sidebar}</Sidebar>}
          <MainContent>{children}</MainContent>
        </div>

        {footer && <Footer>{footer}</Footer>}
      </div>
    </ConsoleContainer>
  );
};
