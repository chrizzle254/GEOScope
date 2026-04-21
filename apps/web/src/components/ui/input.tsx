import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 border-4 border-input bg-background px-4 text-sm text-foreground transition-colors outline-none',
        'placeholder:text-muted-foreground/60',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus:border-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
