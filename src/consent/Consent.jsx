import React, { useState, useEffect, useMemo } from 'react';
import ConsentSDK from '@auth0/auth0-acul-js/consent';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';

/**
 * Consent Screen - Simple Version
 * Displays permissions requested by an application
 */
export const ConsentScreen = () => {
  const consentManager = useMemo(() => {
    try {
      return new ConsentSDK();
    } catch (error) {
      // Mock SDK for local development
      console.warn('Running in development mode with mocked Auth0 SDK');
      return {
        client: { name: 'Demo Application', logoUrl: null },
        user: { email: 'user@example.com' },
        organization: null,
        screen: {
          texts: {},
          scopes: [
            { value: 'openid', description: 'Access your basic profile' },
            { value: 'email', description: 'Access your email address' },
            { value: 'profile', description: 'Access your full profile' }
          ],
          hideScopes: false
        },
        transaction: { errors: [] },
        getErrors: () => [],
        accept: () => Promise.resolve(),
        deny: () => Promise.resolve()
      };
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const { client, user, organization, screen, transaction } = consentManager;
  const texts = screen?.texts || {};

  useEffect(() => {
    try {
      const initialErrors = consentManager.getErrors() || [];
      setErrors(initialErrors);
    } catch (error) {
      console.error('Error initializing ConsentScreen:', error);
    }
  }, [consentManager]);

  const handleAccept = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      await consentManager.accept();
      console.log('Consent accepted');
    } catch (error) {
      console.error('Error accepting consent:', error);
      setErrors([{ message: error.message || 'Failed to accept consent' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      await consentManager.deny();
      console.log('Consent denied');
    } catch (error) {
      console.error('Error denying consent:', error);
      setErrors([{ message: error.message || 'Failed to deny consent' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h1>{texts.title || 'Authorize Application'}</h1>
        <p>
          {texts.description || `${client?.name || 'This application'} is requesting access to your account.`}
        </p>
        {user?.email && (
          <p className="user-info">
            Logged in as <strong>{user.email}</strong>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <ErrorMessage errors={errors.length > 0 ? errors : (transaction?.errors || [])} />

        {/* Permissions List */}
        {!screen?.hideScopes && screen?.scopes && screen.scopes.length > 0 && (
          <div className="permissions-section">
            <h3 className="permissions-title">
              {texts.scopesTitle || `${client?.name || 'This application'} will be able to:`}
            </h3>
            <ul className="permissions-list">
              {screen.scopes.map((scope) => (
                <li key={scope.value} className="permission-item">
                  <span className="permission-checkmark">✓</span>
                  <div className="permission-details">
                    <strong>{scope.value}</strong>
                    {scope.description && <div className="permission-description">{scope.description}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="button-group">
          <Button variant="secondary" fullWidth onClick={handleDeny} disabled={isLoading}>
            {texts.declineButtonText || 'Deny'}
          </Button>
          <Button variant="primary" fullWidth onClick={handleAccept} isLoading={isLoading} disabled={isLoading}>
            {texts.acceptButtonText || 'Allow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsentScreen;

// Auto-render in Auth0 ACUL environment
if (typeof window !== 'undefined') {
  const initScreen = () => {
    const container = document.getElementById('custom-prompt-container');
    if (container && !container.hasChildNodes()) {
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(container).render(<ConsentScreen />);
      });
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScreen);
  } else {
    initScreen();
  }
}
