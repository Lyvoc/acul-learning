import React from 'react';
import clsx from 'clsx';

/**
 * Button Component
 * Reusable button component with variants and loading state
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className,
  ...props 
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'button',
        variant === 'primary' && 'button-primary',
        variant === 'secondary' && 'button-secondary',
        variant === 'social' && 'button-social',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" />
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};