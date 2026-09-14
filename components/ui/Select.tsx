'use client';

import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, options, placeholder = 'Select an option', className = '', ...props }, ref) => {
    const errorClass = error ? 'input-error' : '';

    return (
      <div className="form-group">
        {label && (
          <label className="form-label">
            {icon && <span style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`select ${errorClass} ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
