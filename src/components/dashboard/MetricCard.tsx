// src/components/dashboard/MetricCard.tsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  icon?: string;
  change?: number;
  description?: string;
  loading?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  description,
  loading = false,
  color = 'blue',
  compact = false,
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconText: 'text-blue-600 dark:text-blue-400',
      changeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      iconText: 'text-green-600 dark:text-green-400',
      changeBg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
      iconText: 'text-yellow-600 dark:text-yellow-400',
      changeBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconText: 'text-red-600 dark:text-red-400',
      changeBg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconText: 'text-purple-600 dark:text-purple-400',
      changeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    },
  };

  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className={cn(
        "animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4",
        compact && "p-3"
      )}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  };

  const formatPercent = (val: number) => {
    return `${Math.abs(val).toFixed(1)}%`;
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all",
      colors.bg,
      compact && "p-3"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn("p-2 rounded-lg", colors.iconBg)}>
              <span className={cn("text-lg", colors.iconText)}>{icon}</span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            change >= 0 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          )}>
            {change >= 0 ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <ArrowDownIcon className="h-3 w-3" />
            )}
            <span>{formatPercent(change)}</span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <h4 className={cn("text-2xl font-bold", colors.text)}>
          {formatValue(value)}
        </h4>
      </div>

      {change !== undefined && (
        <div className="flex items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          <TrendingUp className={cn(
            "h-3.5 w-3.5 mr-2",
            change >= 0 ? "text-green-500" : "text-red-500"
          )} />
          <span className={cn(
            "text-xs font-medium",
            change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {change >= 0 ? "Tendencia al alza" : "Tendencia a la baja"}
          </span>
        </div>
      )}
    </div>
  );
};