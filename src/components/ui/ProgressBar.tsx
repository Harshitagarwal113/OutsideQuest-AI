import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  label?: string;
  variant?: 'forest' | 'accent' | 'sage';
}

export function ProgressBar({
  value,
  label,
  variant = 'forest',
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const fillColors = {
    forest: 'bg-earth-forest',
    accent: 'bg-earth-accent',
    sage: 'bg-earth-sage-dark',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)} {...props}>
      {label && (
        <div className="flex justify-between items-center text-xs font-medium text-earth-muted">
          <span>{label}</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
        className="w-full bg-earth-sand h-2.5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            fillColors[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
