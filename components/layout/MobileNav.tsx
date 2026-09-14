'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  navLinks: Array<{ href: string; label: string }>;
}

export default function MobileNav({ isOpen, onClose, currentPath, navLinks }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-nav-overlay" onClick={onClose} />
      <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
        <div className="mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${currentPath === link.href ? 'mobile-nav-link-active' : ''}`}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
          <button 
            className="btn btn-danger mt-4" 
            style={{ width: '100%' }}
            onClick={() => {
              console.log('Logout');
              onClose();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
