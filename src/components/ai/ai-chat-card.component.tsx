'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AIChatCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AIChatCard: React.FC<AIChatCardProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <Card
      className={cn('overflow-hidden', className)}
      style={style}
    >
      {children}
    </Card>
  );
};

export { AIChatCard };
export type { AIChatCardProps };
