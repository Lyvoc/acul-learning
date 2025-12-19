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
          <p style={{ fontSize: '0.875rem', marginTop: 'var(--space-sm)' }}>
            Logged in as <strong>{user.email}</strong>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <ErrorMessage errors={errors.length > 0 ? errors : (transaction?.errors || [])} />

        {/* Permissions List */}
        {!screen?.hideScopes && screen?.scopes && screen.scopes.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: 'var(--space-md)' }}>
              {texts.scopesTitle || `${client?.name || 'This application'} will be able to:`}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {screen.scopes.map((scope) => (
                <li key={scope.value} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'start' }}>
                  <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>{scope.value}</strong>
                    {scope.description && <div style={{ color: 'var(--text-secondary)' }}>{scope.description}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
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

// import React, { useMemo } from 'react';
// import Consent from '@auth0/auth0-acul-js/consent';
// import type { Scope } from '@auth0/auth0-acul-js/consent'; // Import Scope type

// const ConsentScreen: React.FC = () => {
//   // Instantiate the SDK class for the Consent screen.
//   // useMemo ensures it's only created once per component instance.
//   const consentManager = useMemo(() => new Consent(), []);

//   const { client, organization, screen, transaction, user } = consentManager;
//   const texts = screen.texts ?? {}; // UI texts from Auth0 dashboard

//   const handleAccept = () => {
//     consentManager.accept();
//   };

//   const handleDecline = () => {
//    consentManager.deny();
//   };

//   const pageTitle = texts.title ?? 'Authorize Application';
//   const description = texts.description ?? `${client.name || 'The application'} is requesting access to your account.`;
//   const acceptButtonText = texts.acceptButtonText ?? 'Allow';
//   const declineButtonText = texts.declineButtonText ?? 'Deny';

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 antialiased">
//       <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 space-y-6">
//         {/* Client Logo and Name */}
//         <div className="flex flex-col items-center space-y-3">
//           {client.logoUrl && (
//             <img src={client.logoUrl} alt={`${client.name || 'Application'} logo`} className="h-16 w-16 rounded-full object-contain" />
//           )}
//           <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
//         </div>

//         {/* User and Organization Info */}
//         <div className="text-center text-gray-600">
//           <p>{description}</p>
//           {user.email && <p className="mt-1 text-sm">You are logged in as <span className="font-semibold">{user.email}</span>.</p>}
//           {organization?.name && (
//             <p className="mt-1 text-sm">
//               This access is being requested on behalf of the organization: <span className="font-semibold">{organization.displayName || organization.name}</span>.
//             </p>
//           )}
//         </div>

//         {/* Scopes (Permissions) Section */}
//         {!screen?.hideScopes && screen.scopes.length > 0 && (
//           <div className="border-t border-b border-gray-200 py-6">
//             <h2 className="text-lg font-semibold text-gray-700 mb-3">
//               {texts.scopesTitle ?? 'This application will be ableto:'}
//             </h2>
//             <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
//               {screen.scopes.map((scope: Scope) => (
//                 <li key={scope.value} className="flex items-start">
//                   <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   <div>
//                     <p className="text-sm font-medium text-gray-700">{scope.value}</p>
//                     <p className="text-sm font-small text-gray-700">{scope.description}</p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//         {screen?.hideScopes && (
//            <p className="text-sm text-gray-500 text-center italic">
//              {texts.scopesHiddenMessage ?? 'This application is requesting standard permissions.'}
//            </p>
//         )}


//         {/* Display transaction errors (e.g., from server validation) */}
//         {transaction.errors && transaction.errors.length > 0 && (
//           <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
//             <p className="font-bold">{texts.alertListTitle ?? 'Errors:'}</p>
//             <ul className="list-disc list-inside ml-4">
//               {transaction.errors.map((err, index) => (
//                 <li key={`tx-err-${index}`}>{err.message}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 pt-4">
//           <button
//             onClick={handleDecline}
//             className="w-full sm:w-auto flex-1 px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
//           >
//             {declineButtonText}
//           </button>
//           <button
//             onClick={handleAccept}
//             className="w-full sm:w-auto flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
//           >
//             {acceptButtonText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConsentScreen;