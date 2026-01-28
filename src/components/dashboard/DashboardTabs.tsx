// src/components/dashboard/DashboardTabs.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface DashboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto pb-1 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group relative flex items-center whitespace-nowrap py-3 px-1 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </div>
              {/* Indicator */}
              <span className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all',
                activeTab === tab.id
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : 'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
              )} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};