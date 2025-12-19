import React from 'react';

/**
 * ErrorMessage Component
 * Displays error messages in a consistent format
 */
export const ErrorMessage = ({ message, errors }) => {
  // Handle both single message and array of errors
  const displayErrors = errors || (message ? [{ message }] : []);
  
  if (displayErrors.length === 0) return null;
  
  return (
    <div className="error-message" role="alert">
      <svg 
        className="error-icon" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      <div>
        {displayErrors.length === 1 ? (
          <p>{displayErrors[0].message || displayErrors[0].code || 'An error occurred'}</p>
        ) : (
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {displayErrors.map((error, index) => (
              <li key={index}>{error.message || error.code || 'An error occurred'}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};