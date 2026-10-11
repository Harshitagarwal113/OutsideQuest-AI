import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subtext?: string;
}

export function LoadingState({
  message = 'Preparing your outdoor adventure...',
  subtext,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center text-earth-charcoal',
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-earth-sage-light flex items-center justify-center mb-3">
        <Loader2 className="w-6 h-6 text-earth-forest animate-spin motion-reduce:animate-none" />
      </div>
      <p className="font-medium text-sm text-earth-charcoal">{message}</p>
      {subtext && <p className="text-xs text-earth-muted mt-1 max-w-xs">{subtext}</p>}
    </div>
  );
}
