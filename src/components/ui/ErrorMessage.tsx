import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({
  title = 'Something interrupted your trail',
  message,
  onRetry,
  retryText = 'Try Again',
  className,
  ...props
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-xl border border-red-200 bg-red-50/60 text-earth-charcoal flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-sm text-red-900">{title}</h4>
          <p className="text-xs text-red-800 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="shrink-0 border-red-300 text-red-900 hover:bg-red-100/60"
        >
          {retryText}
        </Button>
      )}
    </div>
  );
}
