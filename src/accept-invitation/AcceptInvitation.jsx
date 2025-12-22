import React, { useState, useEffect, useMemo } from 'react';
import AcceptInvitation from '@auth0/auth0-acul-js/accept-invitation';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';

/**
 * Accept Invitation Screen
 * Handles organization invitation acceptance flow
 */
export const AcceptInvitationScreen = () => { 
    const acceptInvitationManager = useMemo(() => {
        try {
            return new AcceptInvitation();
        } catch (error) {
            console.log('Error initializing AcceptInvitation SDK:', error);
            // Mock SDK for local development
            console.warn('Running in development mode with mocked Auth0 SDK');
            return {
                client: { name: 'Demo Application', logoUrl: null },
                organization: { displayName: 'Demo Organization', name: 'demo-org', id: 'org_NuioIiSZARzIcDR9' },
                user: { email: 'user@example.com' },
                screen: {
                    texts: {
                        title: "You've Been Invited!",
                    },
                    data: {
                        inviter: 'John Doe',
                        email: 'user@example.com',
                    },
                },
                transaction: { errors: [] },
                getErrors: () => [],
                acceptInvitation: () => Promise.resolve(),
            };
        }
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const { client, organization, screen, transaction } = acceptInvitationManager;

    useEffect(() => {
        try {
            const initialErrors = acceptInvitationManager.getErrors() || [];
            setErrors(initialErrors);
        } catch (error) {
            console.error('Error initializing AcceptInvitationScreen:', error);
        }
    }, [acceptInvitationManager]);

    const handleAcceptInvitation = async () => {
        setIsLoading(true);
        setErrors([]);

        try {
            await acceptInvitationManager.acceptInvitation();
            console.log('Invitation accepted');
        } catch (error) {
            console.error('Error accepting invitation:', error);
            setErrors([{ message: error.message || 'An unexpected error occurred.' }]);
        } finally {
            setIsLoading(false);
        } 
    };

    const texts = screen?.texts || {};
    const inviterName = screen?.data?.inviter;
    const inviteeEmail = screen?.data?.email;
    const orgName = organization?.displayName || organization?.name;

    return (
        <Card>
            <CardHeader>
                <h1>{texts.title || "You've Been Invited!"}</h1>
                <p>
                    {texts.description || 
                     `${inviterName || 'Someone'} has invited you${inviteeEmail ? ` (${inviteeEmail})` : ''} to join ${orgName || 'an organization'}.`}
                </p>
            </CardHeader>

            <CardContent>
                <ErrorMessage errors={errors.length > 0 ? errors : (transaction?.errors || [])} />

                {/* Invitation Details */}
                <div className="invitation-details">
                    {inviterName && (
                        <div className="detail-item">
                            <span className="detail-label">Inviter:</span>
                            <span className="detail-value">{inviterName}</span>
                        </div>
                    )}
                    {inviteeEmail && (
                        <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{inviteeEmail}</span>
                        </div>
                    )}
                    {orgName && (
                        <div className="detail-item">
                            <span className="detail-label">Organization:</span>
                            <span className="detail-value">{orgName}</span>
                        </div>
                    )}
                </div>

                {/* Accept Button */}
                <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={handleAcceptInvitation}
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {texts.buttonText || 'Accept Invitation'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default AcceptInvitationScreen;

// Auto-render in Auth0 ACUL environment
if (typeof window !== 'undefined') {
  const initScreen = () => {
    const container = document.getElementById('custom-prompt-container');
    if (container && !container.hasChildNodes()) {
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(container).render(<AcceptInvitationScreen />);
      });
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScreen);
  } else {
    initScreen();
  }
}



                