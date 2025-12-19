import React from 'react';
import clsx from 'clsx';

/**
 * Input Component
 * Reusable input field with label and error support
 */
export const Input = ({ 
  label, 
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  autoComplete,
  autoFocus = false,
  ...props 
}) => {
  const inputId = id || name;
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={clsx('form-input', error && 'error')}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-sm" style={{ color: 'var(--error)' }}>
          {error}
        </span>
      )}
    </div>
  );
};