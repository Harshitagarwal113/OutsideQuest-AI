import React from 'react';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-earth-border bg-white/60',
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-full bg-earth-sand-light border border-earth-sand flex items-center justify-center text-earth-forest mb-4">
        {icon || <Compass className="w-7 h-7 text-earth-forest" />}
      </div>
      <h3 className="font-semibold text-base md:text-lg text-earth-charcoal mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-earth-muted max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
