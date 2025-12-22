import React from 'react';
import ReactDOM from 'react-dom/client';
import { AcceptInvitationScreen } from './accept-invitation/AcceptInvitation';
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
      <AcceptInvitationScreen />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
