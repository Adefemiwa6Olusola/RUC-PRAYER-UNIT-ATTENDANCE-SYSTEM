import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row';
  className?: string;
}

export default function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  let style: React.CSSProperties = {};
  
  if (variant === 'text') {
    style = { height: '1rem', width: '100%', marginBottom: '0.5rem' };
  } else if (variant === 'card') {
    style = { height: '12rem', width: '100%' };
  } else if (variant === 'table-row') {
    style = { height: '3rem', width: '100%', marginBottom: '1rem' };
  }

  return (
    <div className={`skeleton ${className}`} style={style} />
  );
}
