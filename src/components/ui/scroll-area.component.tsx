import * as React from 'react';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { scrollHide?: boolean }
>(({ className, children, scrollHide = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden',
      scrollHide ? 'scrollbar-hide' : 'scrollbar-default',
      className
    )}
    {...props}
  >
    <div className="h-full w-full overflow-auto">
      <div className="min-h-full">{children}</div>
    </div>
  </div>
));
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
