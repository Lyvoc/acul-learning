import React from 'react';

/**
 * Card Component
 * Container for authentication screens
 */
export const Card = ({ children }) => {
  return (
    <div className="container">
      <div className="card">
        {children}
      </div>
    </div>
  );
};

/**
 * CardHeader Component
 */
export const CardHeader = ({ logo, title, description }) => {
  return (
    <div className="card-header">
      {logo && (
        <div className="card-logo">
          {logo}
        </div>
      )}
      {title && <h1 className="card-title">{title}</h1>}
      {description && <p className="card-description">{description}</p>}
    </div>
  );
};

/**
 * CardContent Component
 */
export const CardContent = ({ children }) => {
  return <div className="card-content">{children}</div>;
};