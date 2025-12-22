# Build Configuration Guide

## Purpose
This document explains the dual-mode build configuration for ACUL (Auth0 Custom Universal Login) screens. The setup enables:
- **Local development** with a screen selector for easy testing and iteration across all screens
- **Production builds** of individual screens (without navigation) ready for Auth0 Management API upload

This approach separates development convenience from production requirements, ensuring Auth0 only receives the specific screen needed without extra navigation UI.

---

## Build Modes

This project supports two build modes:

## Development Mode (Local Testing)
For local development with screen selector and navigation between all screens:

```bash
npm run dev
```

This opens the app at http://localhost:3000 with a screen selector that lets you navigate between all screens.

## Production Mode (Auth0 Upload)
For building individual screens to upload to Auth0:

### Build specific screens:
```bash
npm run build:signup              # Build only the signup screen
npm run build:login-id            # Build only the login-id screen
npm run build:consent             # Build only the consent screen
npm run build:accept-invitation   # Build only the accept-invitation screen
```

Each build creates a `dist/` folder containing only that specific screen without the navigation selector.

### Output files:
After running a build command, you'll find in the `dist/` folder:
- `assets/signup-entry.*.js` (main JavaScript)
- `assets/signup-entry.*.css` (styles)
- `assets/vendor.*.js` (React and dependencies)

These files are ready to be uploaded to Auth0 via the Management API.

## How it works

- **Development**: Uses [src/main.jsx](src/main.jsx) which renders [src/App.jsx](src/App.jsx) with screen selector
- **Production**: Uses screen-specific entry files:
  - [src/signup-entry.jsx](src/signup-entry.jsx)
  - [src/login-id-entry.jsx](src/login-id-entry.jsx)
  - [src/consent-entry.jsx](src/consent-entry.jsx)
  - [src/accept-invitation-entry.jsx](src/accept-invitation-entry.jsx)

Each entry file renders only its specific screen component without any navigation.
