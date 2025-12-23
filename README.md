# Auth0 ACUL Demo Application

A complete demonstration of Auth0's Advanced Customizations for Universal Login (ACUL) JavaScript SDK with custom React UIs.

## 🚀 Features

- **Multiple Authentication Screens**: Login ID, Login Password, Signup, and Consent
- **Custom UI Components**: Fully customizable React components
- **Auth0 ACUL SDK Integration**: Direct integration with `@auth0/auth0-acul-js`
- **Modern Development Stack**: React 18, Vite, ES Modules
- **Responsive Design**: Mobile-friendly authentication screens
- **Error Handling**: Comprehensive error display and validation
- **Social Login Support**: Ready for Google, GitHub, and other providers
- **OAuth Consent Screen**: Permission authorization with scope display

## 📋 Prerequisites

- Node.js 18+ and npm
- Basic knowledge of React
- (Optional) Auth0 tenant with custom domain for production deployment

## 🛠️ Installation

### 1. Clone or Create Project

```bash
# Create project directory
mkdir auth0-acul-demo
cd auth0-acul-demo
```

### 2. Initialize Project

```bash
# Initialize package.json
npm init -y
```

### 3. Install Dependencies

```bash
# Core dependencies
npm install react react-dom @auth0/auth0-acul-js clsx

# Development dependencies
npm install -D vite @vitejs/plugin-react
```

### 4. Set Up Project Structure

Create the following directory structure:

```
auth0-acul-demo/
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── Input.jsx
│   ├── screens/
│   │   ├── login-id/
│   │   │   └── LoginId.jsx
│   │   ├── login-password/
│   │   │   └── LoginPassword.jsx
│   │   ├── signup/
│   │   │   └── Signup.jsx
│   │   └── consent/
│   │       └── Consent.jsx
│   ├── styles/
│   │   └── main.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

Copy all the provided files to their respective locations.

## 🚦 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

### Serve with CORS (for Auth0 Testing)

Build and serve with CORS enabled:

```bash
npm run serve
```

## 📁 Project Structure

### Components (`src/components/`)

- **Button.jsx**: Reusable button with loading states
- **Card.jsx**: Container for authentication screens
- **Input.jsx**: Form input with label and error support
- **ErrorMessage.jsx**: Consistent error display

### Screens (`src/screens/`)

- **LoginId**: First login step - captures username/email
- **LoginPassword**: Second login step - captures password
- **Signup**: User registration flow
- **Consent**: OAuth consent screen - displays requested permissions

### Styles (`src/styles/`)

- **main.css**: Global styles following Auth0 design system

## 🔧 ACUL SDK Usage

### Basic Pattern

```javascript
import LoginId from '@auth0/auth0-acul-js/login-id';

const loginIdManager = new LoginId();

// Access context
const { user, tenant, branding, transaction } = loginIdManager;

// Submit login
await loginIdManager.login({ username: 'user@example.com' });

// Get errors
const errors = loginIdManager.getErrors();
```

### Available Screens

The ACUL SDK provides these screens (import as needed):

**Login Flow:**
- `@auth0/auth0-acul-js/login-id`
- `@auth0/auth0-acul-js/login-password`
- `@auth0/auth0-acul-js/login-passwordless-email-code`
- `@auth0/auth0-acul-js/login-passwordless-sms-otp`

**Signup Flow:**
- `@auth0/auth0-acul-js/signup`
- `@auth0/auth0-acul-js/signup-id`
- `@auth0/auth0-acul-js/signup-password`

**Consent:**
- `@auth0/auth0-acul-js/consent`

**MFA:**
- `@auth0/auth0-acul-js/mfa-otp`
- `@auth0/auth0-acul-js/mfa-push-challenge-push`
- `@auth0/auth0-acul-js/mfa-webauthn-platform`

**Password Reset:**
- `@auth0/auth0-acul-js/reset-password`
- `@auth0/auth0-acul-js/reset-password-email-sent`

## 📝 Consent Screen Implementation

### Overview

The Consent screen was added to handle OAuth authorization flows where an application requests specific permissions (scopes) from a user. This screen is displayed when a third-party application needs to access user data.

### Files Added

1. **`src/consent/Consent.jsx`** - Main consent screen component 
   - Imports the `@auth0/auth0-acul-js/consent` SDK
   - Displays application information, requested scopes, and action buttons
   - Handles accept/deny consent flow

### Implementation Details

#### SDK Integration

```javascript
import ConsentSDK from '@auth0/auth0-acul-js/consent';

const consentManager = useMemo(() => new ConsentSDK(), []);
const { client, user, organization, screen, transaction } = consentManager;
```

#### Key Features

- **Client Information Display**: Shows the requesting application's name and logo
- **User Context**: Displays which account is being authorized
- **Scope List**: Renders requested permissions with descriptions
- **Accept/Deny Actions**: Buttons to allow or reject the authorization request
- **Error Handling**: Displays validation and transaction errors
- **Customizable Text**: Uses SDK-provided texts with sensible fallbacks

#### Component Structure

```jsx
<ConsentScreen>
  ├── CardHeader
  │   ├── Title (from SDK or default)
  │   ├── Description (application requesting access)
  │   └── User email display
  ├── CardContent
  │   ├── ErrorMessage (if any)
  │   ├── Scopes List (unless hideScopes is true)
  │   │   └── Each scope with checkmark, name, and description
  │   └── Action Buttons
  │       ├── Deny Button (secondary)
  │       └── Allow Button (primary, with loading state)
</ConsentScreen>
```

#### SDK Methods Used

- `consentManager.accept()` - Approve the authorization request
- `consentManager.deny()` - Reject the authorization request
- `consentManager.getErrors()` - Retrieve validation errors
- `consentManager.client` - Access client information (name, logo)
- `consentManager.screen.scopes` - Get list of requested permissions
- `consentManager.screen.texts` - Get customizable UI text

### Connection to Project

#### 1. Added to App Navigation (`src/App.jsx`)

The consent screen was integrated into the main app component's screen selector:

```javascript
const screens = {
  'login-id': { component: LoginIdScreen, label: 'Login ID' },
  'signup': { component: SignupScreen, label: 'Sign Up' },
  'consent': { component: ConsentScreen, label: 'Consent' }  // Added
};
```

This allows demo navigation between all authentication screens.

#### 2. Uses Existing Components

The consent screen leverages existing reusable components:
- **`Card`, `CardHeader`, `CardContent`** from `src/components/Card.jsx`
- **`Button`** from `src/components/Button.jsx` (with loading state support)
- **`ErrorMessage`** from `src/components/ErrorMessage.jsx`

No new components were needed, demonstrating the modularity of the component library.

#### 3. Follows Established Patterns

The implementation follows the same patterns as other screens:
- Uses `useMemo` to instantiate SDK once
- Implements loading states with `useState`
- Handles errors with local state and displays via `ErrorMessage`
- Uses async/await for SDK method calls
- Provides auto-render logic for standalone deployment

### Production Deployment

In production with Auth0:
1. Upload `Consent.jsx` to your Auth0 tenant's custom login page editor
2. Configure the consent settings in Auth0 Dashboard
3. Auth0 will automatically show this screen when an application requests user authorization
4. The SDK will be properly initialized with real transaction data

### Development Mode

The consent screen includes a mock SDK for local development:
- Returns sample client, user, and scope data
- Allows UI testing without Auth0 connection
- Console warnings indicate development mode

## 🎨 Customization

### Styling

Modify `src/styles/main.css` to change:
- Colors (CSS variables at `:root`)
- Spacing and layout
- Component styles

### Components

All components are modular and can be customized:
- Edit component files in `src/components/`
- Modify props and behavior as needed

### Branding

The SDK provides branding context from Auth0:

```javascript
const theme = loginIdManager.getCurrentThemeOptions();
// Use theme.colors, theme.fonts, etc.
```

## 🚀 Deployment

This project includes an **automated CI/CD pipeline** for deploying to Vercel with automatic Auth0 configuration updates.

### Automated Deployment (Recommended)

#### Quick Start

1. **Link to Vercel**:
   ```bash
   npm run build
   cd dist
   vercel link
   ```

2. **Configure GitHub Secrets**:
   - `VERCEL_TOKEN` - Your Vercel API token
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`
   - `AUTH0_DOMAIN` - Your Auth0 tenant domain
   - `AUTH0_MGMT_TOKEN` - Auth0 Management API token

3. **Push to GitHub**:
   ```bash
   git push origin main
   ```

The GitHub Actions workflow will automatically:
- Build your application
- Deploy to Vercel with CORS headers
- Extract file hashes from the deployment
- Update Auth0 configuration via Management API

**📖 For complete setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### What Gets Automated

✅ Build and bundle with Vite  
✅ Deploy to Vercel with production settings  
✅ Configure CORS headers automatically  
✅ Extract asset hashes from live deployment  
✅ Update Auth0 screen configurations  
✅ Zero manual file path updates  

### Manual Deployment (Alternative)

If you prefer manual deployment:

#### 1. Build Assets

```bash
npm run build
```

#### 2. Upload to CDN

Upload `dist/` contents to your CDN (AWS S3, Cloudflare, Vercel, etc.)

#### 3. Configure Auth0

Create `settings.json`:

```json
{
  "rendering_mode": "advanced",
  "context_configuration": [
    "branding.settings",
    "branding.themes.default",
    "screen.texts"
  ],
  "default_head_tags_disabled": false,
  "head_tags": [
    {
      "tag": "base",
      "attributes": {
        "href": "https://your-cdn-domain.com/"
      }
    },
    {
      "tag": "link",
      "attributes": {
        "rel": "stylesheet",
        "href": "https://your-cdn-domain.com/assets/main.[hash].css"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "https://your-cdn-domain.com/assets/main.[hash].js",
        "type": "module"
      }
    }
  ]
}
```

#### 4. Apply Configuration

Using Auth0 CLI:

```bash
npm install -g @auth0/auth0-cli
auth0 login
auth0 ul customize --rendering-mode advanced --prompt login-id --screen login-id --settings-file ./settings.json
```

Or use the Management API directly.

## 🧪 Testing Locally

For local development without Auth0:

1. The demo includes a screen selector (top-right)
2. Switch between screens to test UI
3. SDK calls will log to console
4. Mock the context data as needed

## 📝 Important Notes

- **Screen Flow**: In production, Auth0 controls screen navigation
- **Context**: Real context comes from Auth0 during authentication
- **Errors**: SDK provides error handling through `getErrors()`
- **Security**: Never expose credentials or API keys in client code

## 🔗 Resources

- [Auth0 ACUL Documentation](https://auth0.com/docs/customize/login-pages/advanced-customizations)
- [ACUL JS SDK Reference](https://auth0.github.io/universal-login/index.html)
- [ACUL Sample Repository](https://github.com/auth0-samples/auth0-acul-samples)
- [Auth0 Community Forum](https://community.auth0.com/)

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 💡 Tips

1. **Start Simple**: Begin with one screen (e.g., login-id)
2. **Test Locally**: Use the demo screen selector
3. **Customize Gradually**: Modify styles and components incrementally
4. **Follow Auth0 Patterns**: Use the provided context and methods
5. **Handle Errors**: Always check `getErrors()` after SDK calls

## ⚠️ Troubleshooting

### SDK Import Errors

Make sure you're importing from the correct path:
```javascript
import LoginId from '@auth0/auth0-acul-js/login-id'; // Correct
```

### Build Issues

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

Use the serve command with CORS:
```bash
npm run serve
```

## 🎯 Next Steps

1. ✅ Set up the basic project
2. ✅ Test screens locally
3. 🔄 Customize UI to match your brand
4. 🔄 Add additional screens as needed
5. 🔄 Deploy to CDN
6. 🔄 Configure Auth0 tenant
7. 🔄 Test in production environment

---

**Built with ❤️ using Auth0 ACUL SDK**