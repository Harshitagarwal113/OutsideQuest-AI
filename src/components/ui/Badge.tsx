import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'sage' | 'sand' | 'accent' | 'charcoal' | 'outline';
}

export function Badge({
  className,
  variant = 'forest',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    forest: 'bg-earth-forest text-white',
    sage: 'bg-earth-sage-light text-earth-forest border border-earth-sage',
    sand: 'bg-earth-sand text-earth-charcoal',
    accent: 'bg-earth-accent/15 text-earth-accent border border-earth-accent/30',
    charcoal: 'bg-earth-charcoal text-white',
    outline: 'border border-earth-border text-earth-charcoal bg-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
