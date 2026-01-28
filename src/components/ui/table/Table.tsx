// src/components/ui/table/Table.tsx (versión simplificada)
import React from 'react';
import { cn } from '../../../lib/utils';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <table className={cn('w-full text-sm', className)} {...props}>
      {children}
    </table>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => {
  return (
    <thead className={cn('', className)} {...props}>
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className, ...props }) => {
  return (
    <tbody className={cn('divide-y divide-gray-100 dark:divide-gray-800', className)} {...props}>
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => {
  return (
    <tr className={cn('', className)} {...props}>
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className, 
  isHeader = false,
  ...props 
}) => {
  const Component = isHeader ? 'th' : 'td';
  return (
    <Component
      className={cn(
        'py-3 px-4 text-left',
        isHeader 
          ? 'font-medium text-gray-500 dark:text-gray-400 text-xs' 
          : 'text-gray-500 dark:text-gray-400 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};