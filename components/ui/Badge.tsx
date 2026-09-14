import React from 'react';

type BadgeVariant = 'present' | 'absent' | 'late' | 'excused' | 'active' | 'inactive';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
