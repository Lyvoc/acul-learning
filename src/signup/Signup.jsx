import React, { useState, useEffect } from 'react';
import SignupSDK from '@auth0/auth0-acul-js/signup';
import { Card, CardHeader, CardContent } from '@components/Card';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { ErrorMessage } from '@components/ErrorMessage';
import logoImg from '../assets/logo.png';

/**
 * Signup Screen
 * User registration flow
 */
export const SignupScreen = () => {
  const [signupManager] = useState(() => {
    try {
      return new SignupSDK();
    } catch (error) {
      // Mock SDK for local development
      console.warn('Running in development mode with mocked Auth0 SDK');
      return {
        user: {},
        tenant: { name: 'Demo Tenant' },
        branding: {},
        transaction: {},
        getErrors: () => [],
        validateEmail: () => ({ isValid: true }),
        validatePassword: () => ({ isValid: true }),
        validateUsername: () => ({ isValid: true }),
        signup: () => Promise.resolve(),
        submit: () => Promise.resolve()
      };
    }
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [contextData, setContextData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    try {
      const context = {
        user: signupManager.user,
        tenant: signupManager.tenant,
        branding: signupManager.branding,
        transaction: signupManager.transaction
      };
      setContextData(context);
      
      const initialErrors = signupManager.getErrors() || [];
      setErrors(initialErrors);
    } catch (error) {
      console.error('Error initializing SignupScreen:', error);
    }
  }, [signupManager]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Build signup payload
      const payload = {
        email: formData.email.trim(),
        password: formData.password.trim(),
      };

      // Only include username if it's provided
      if (formData.username.trim()) {
        payload.username = formData.username.trim();
      }

      // Call SDK signup method
      await signupManager.signup(payload);
      
      const submissionErrors = signupManager.getErrors() || [];
      if (submissionErrors.length > 0) {
        setErrors(submissionErrors);
      } else {
        console.log('Signup submitted successfully');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors([{ message: error.message || 'Failed to create account' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (connection) => {
    setIsLoading(true);
    setErrors([]);

    try {
      await signupManager.continueWithFederatedLogin({ connection });
      console.log(`Social signup with ${connection} initiated`);
    } catch (error) {
      console.error('Social signup error:', error);
      setErrors([{ message: error.message || 'Social signup failed' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const alternateConnections = contextData?.transaction?.alternateConnections || [];

  return (
    <Card>
      <CardHeader
        logo={logoImg}
        title="Create Your Account"
        description="Sign up to get started"
      />

      <CardContent>
        {errors.length > 0 && <ErrorMessage errors={errors} />}

        <form onSubmit={handleSubmit} className="form">
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            autoComplete="email"
            autoFocus
            required
            disabled={isLoading}
            error={fieldErrors.email}
          />

          <Input
            label="Username (Optional)"
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Choose a username"
            autoComplete="username"
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            disabled={isLoading}
            error={fieldErrors.password}
          />

          <Button 
            type="submit" 
            variant="primary" 
            loading={isLoading}
            disabled={isLoading}
          >
            Sign Up
          </Button>
        </form>

        {alternateConnections.length > 0 && (
          <>
            <div className="divider">Or sign up with</div>
            
            <div className="social-buttons">
              {alternateConnections.map((connection) => (
                <Button
                  key={connection.name}
                  variant="social"
                  onClick={() => handleSocialSignup(connection.name)}
                  disabled={isLoading}
                >
                  {getSocialIcon(connection.name)}
                  Sign up with {connection.display_name || connection.name}
                </Button>
              ))}
            </div>
          </>
        )}

        <div className="text-center" style={{ marginTop: 'var(--space-lg)' }}>
          <span className="text-sm">Already have an account? </span>
          <a href="#" className="link">Sign in</a>
        </div>
      </CardContent>
    </Card>
  );
};

function getSocialIcon(provider) {
  const icons = {
    google: (
      <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )
  };
  
  return icons[provider.toLowerCase()] || icons.google;
}

export default SignupScreen;

// Auto-render in Auth0 ACUL environment
if (typeof window !== 'undefined') {
  const initScreen = () => {
    const container = document.getElementById('custom-prompt-container');
    if (container && !container.hasChildNodes()) {
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(container).render(<SignupScreen />);
      });
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScreen);
  } else {
    initScreen();
  }
}