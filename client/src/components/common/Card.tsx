import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx('bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 transition-all', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
