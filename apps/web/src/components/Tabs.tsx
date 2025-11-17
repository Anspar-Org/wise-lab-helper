/**
 * Tabs Component
 * Console-style tabs with keyboard navigation
 * Meets WCAG 2.1 AA accessibility standards
 */

import React from 'react';

export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Tab label text */
  label: string;
  /** Tab content */
  content: React.ReactNode;
}

export interface TabsProps {
  /** Array of tabs (max 5-7 recommended) */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  // Find active tab content
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
    }
  };

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div
        role="tablist"
        className="flex border-b-2 border-gray-200 gap-1"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                px-6 py-3 min-h-touch
                text-child-base font-medium
                transition-all duration-fast
                border-b-2 -mb-0.5
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${
                  isActive
                    ? 'border-primary text-primary bg-primary-50'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="py-6"
      >
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;
