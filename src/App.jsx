import React, { useState } from 'react';
import { LoginIdScreen } from './login-id/LoginId';
import { SignupScreen } from './signup/Signup';
import { ConsentScreen } from './consent/Consent';
import './styles/main.css';

/**
 * Main App Component
 * Manages screen navigation for demo purposes
 */
function App() {
  const [currentScreen, setCurrentScreen] = useState('signup');

  const screens = {
    'login-id': {
      component: LoginIdScreen,
      label: 'Login ID',
      description: 'Enter username/email'
    },
    'signup': {
      component: SignupScreen,
      label: 'Sign Up',
      description: 'Create account'
    },
    'consent': {
      component: ConsentScreen,
      label: 'Consent',
      description: 'Authorize permissions'
    }
  };

  const CurrentScreenComponent = screens[currentScreen].component;

  return (
    <div className="app">
      {/* Screen Selector - For Demo Purposes Only */}
      <div className="screen-selector">
        <div className="screen-selector-title">Demo Screens</div>
        <div className="screen-selector-list">
          {Object.entries(screens).map(([key, screen]) => (
            <button
              key={key}
              onClick={() => setCurrentScreen(key)}
              className={`screen-selector-button ${currentScreen === key ? 'active' : ''}`}
              title={screen.description}
            >
              {screen.label}
            </button>
          ))}
        </div>
        <div style={{ 
          marginTop: 'var(--space-md)', 
          padding: 'var(--space-sm)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <strong>Note:</strong> This selector is for demo purposes. In production, Auth0 controls screen flow.
        </div>
      </div>

      {/* Current Screen */}
      <CurrentScreenComponent />
    </div>
  );
}

export default App;