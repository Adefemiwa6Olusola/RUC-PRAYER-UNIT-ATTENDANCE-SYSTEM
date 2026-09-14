import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`card ${className}`} style={noPadding ? { overflow: 'hidden' } : undefined}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`} style={action ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : undefined}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export default Card;
