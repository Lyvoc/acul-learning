import React from 'react';
import ReactDOM from 'react-dom/client';
import { SignupScreen } from './signup/Signup';
import './styles/main.css';

function initApp() {
  let rootElement = document.getElementById('root');

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SignupScreen />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
