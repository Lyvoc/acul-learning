# Deployment Guide

This guide provides comprehensive instructions for deploying your ACUL project to Vercel with automated Auth0 configuration updates.

## Overview

### Automated Vercel Deployment Pipeline

This repository includes a complete CI/CD pipeline that automatically deploys your ACUL screens to Vercel and updates Auth0 configuration whenever you push to the `main` branch.

#### Purpose

The deployment pipeline solves several challenges:

1. **Automated Asset Hosting**: Builds and deploys React screens to Vercel with proper CORS headers
2. **File Hash Synchronization**: Automatically extracts file hashes from the live deployment and updates Auth0
3. **Zero Manual Configuration**: No need to manually update Auth0 with new file paths after each build
4. **CORS Support**: Ensures assets can be loaded cross-origin from Auth0 domains

#### How It Works

```
Push to GitHub → Build React App → Deploy to Vercel → Update Auth0 Config
```

1. **Build Stage**: GitHub Actions builds your React app with Vite, generating hashed assets
2. **Deployment Stage**: Deploys assets to Vercel with CORS headers (`Access-Control-Allow-Origin: *`)
3. **Sync Stage**: Fetches `index.html` from live Vercel URL, extracts file hashes, updates Auth0 via Management API

## Setup Instructions

### 1. Create Vercel Project

First, build your project and link it to Vercel:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link to Vercel (creates new project)
cd dist
vercel link
```

When prompted:
- Choose your Vercel team/account
- Select "No" when asked to link to existing project
- Enter a unique project name (e.g., `acul-learning-production`)
- Confirm directory as `.` (current)

Get your project details:

```bash
# Get your project details
cat .vercel/project.json
```

This outputs your `projectId` and `orgId` - save these for GitHub secrets.

> ⚠️ **Important**: Use a unique project name. Vercel project names are globally unique, and reusing a name from a deleted project may inherit cached CORS headers from the previous owner.

### 2. Get Vercel API Token

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it (e.g., `GitHub Actions - ACUL Deployment`)
4. Set scope to your team/account
5. Copy the token (you won't see it again)

### 3. Get Auth0 Management API Token

1. Go to your Auth0 Dashboard → Applications → APIs
2. Select "Auth0 Management API"
3. Go to "Machine to Machine Applications" tab
4. Authorize your application with these scopes:
   - `read:prompts`
   - `update:prompts`
5. Copy the token from your application settings

### 4. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token from step 2 | `v1a2b3c4d5e6f7g8h9i0...` |
| `VERCEL_ORG_ID` | From `.vercel/project.json` | `team_xxxxxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` | `prj_xxxxxxxxxxxxx` |
| `AUTH0_DOMAIN` | Your Auth0 tenant domain | `your-tenant.auth0.com` |
| `AUTH0_MGMT_TOKEN` | Management API token from step 3 | `eyJhbGciOiJSUzI1NiIs...` |

### 5. Trigger Deployment

Push any change to trigger the deployment:

```bash
# Make any change and push
git add .
git commit -m "Trigger deployment"
git push origin main
```

Monitor progress in the **Actions** tab of your GitHub repository.

## What the GitHub Action Does

The workflow (`.github/workflows/deploy-vercel.yml`) performs these steps:

1. **📥 Checkout code**: Clones the repository
2. **🔧 Setup Node.js**: Installs Node.js 20
3. **📦 Install dependencies**: Runs `npm ci`
4. **🧹 Clean dist folder**: Removes old build artifacts
5. **🏗️ Build ACUL assets**: Runs `npm run build` with Vite
6. **📄 Copy vercel.json**: Copies configuration with CORS headers to dist folder
7. **📁 Prepare clean deployment directory**: Copies `dist/*` to `deploy-temp/` (without `package.json`/`vite.config` to prevent Vercel from rebuilding)
8. **🚀 Install Vercel CLI**: Installs latest Vercel CLI globally
9. **🚢 Deploy to Vercel**: Runs `vercel deploy --prod` from `deploy-temp/`
10. **🔄 Update Auth0 Configuration**: Executes `scripts/update-auth0-vercel.js`:
    - Fetches `index.html` from live Vercel URL
    - Extracts file hashes via regex (e.g., `index.B3xD_vzY.js`)
    - Builds Auth0 configuration with `<script>` and `<link>` tags
    - PATCH request to Auth0 Management API: `/api/v2/prompts/{screen}/screen/{screen}/rendering`
11. **✅ Deployment Complete**: Shows success message with live URL

## Vercel Configuration

The `vercel.json` file in the project root configures:

```json
{
  "version": 2,
  "builds": [],
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, OPTIONS"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

- **CORS Headers**: Allow assets to be loaded from Auth0 domains
- **Cache Control**: Optimize asset caching (1 year for immutable assets)
- **No Builds**: Prevents Vercel from rebuilding, uses pre-built artifacts

## Verifying CORS Headers

After deployment, test that CORS headers are correctly set:

```bash
# PowerShell
$response = Invoke-WebRequest -Uri 'https://your-project.vercel.app/assets/index.[hash].js' -Method Head
$response.Headers | Format-List
```

Look for:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

## Troubleshooting

### Issue: "Project not found" error

- **Cause**: `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID` secrets are incorrect
- **Solution**: Run `vercel link` again and update GitHub secrets with new values from `.vercel/project.json`

### Issue: Old CORS headers persist (wrong domain)

- **Cause**: Vercel project name was reused and has cached configuration
- **Solution**: Delete Vercel project, create a new one with a unique name, update GitHub secrets

### Issue: Auth0 not updating

- **Cause**: Invalid `AUTH0_MGMT_TOKEN` or missing API scopes
- **Solution**: Generate new Management API token with `read:prompts` and `update:prompts` scopes

### Issue: File hashes don't match

- **Cause**: Script extracts hashes from wrong URL or build output
- **Solution**: Check build output in GitHub Actions logs and verify asset paths

### Issue: Workflow fails on "Update Auth0 Configuration" step

- **Cause**: Auth0 domain or token issues
- **Solution**: Verify `AUTH0_DOMAIN` format (should be just the domain, not full URL) and token validity

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# Build the project
npm run build

# Copy vercel.json to dist
cp vercel.json dist/

# Deploy to Vercel
cd dist
vercel deploy --prod

# Update Auth0 manually
# Set environment variables
export AUTH0_DOMAIN="your-tenant.auth0.com"
export AUTH0_MGMT_TOKEN="your-token"
export VERCEL_URL="https://your-project.vercel.app"

# Run update script
node scripts/update-auth0-vercel.js
```

## Monitoring Deployments

- **GitHub Actions**: Check the Actions tab in your repository for build logs
- **Vercel Dashboard**: View deployment history and logs at [vercel.com](https://vercel.com)
- **Auth0 Dashboard**: Verify configuration updates in Auth0 Dashboard → Branding → Universal Login → Advanced Customization

## Updating Screens

To add or modify screens that get updated with Auth0:

1. Edit `scripts/update-auth0-vercel.js`
2. Update the `SCREENS_TO_UPDATE` array:
   ```javascript
   const SCREENS_TO_UPDATE = ['login-id', 'signup', 'consent', 'login-password'];
   ```
3. Commit and push changes

## Best Practices

1. **Test locally first**: Always test your changes locally before pushing
2. **Use feature branches**: Create feature branches for major changes and test deployments
3. **Monitor logs**: Check GitHub Actions and Vercel logs for any issues
4. **Backup Auth0 config**: Export your Auth0 configuration before making changes
5. **Use environment-specific tokens**: Consider separate tokens for staging and production

## Security Notes

- Never commit API tokens or secrets to the repository
- Rotate Auth0 Management API tokens regularly
- Use GitHub's environment protection rules for production deployments
- Limit Auth0 Management API token scopes to only required permissions
- Review Vercel deployment logs for sensitive information before making them public

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Auth0 ACUL Documentation](https://auth0.com/docs/customize/login-pages/advanced-customizations)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
