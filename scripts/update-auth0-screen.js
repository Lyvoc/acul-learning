#!/usr/bin/env node

/**
 * Update Auth0 ACUL Screen Configuration
 * 
 * This script updates a single Auth0 screen with asset URLs from Vercel
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_TOKEN = process.env.AUTH0_MGMT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;
const SCREEN_NAME = process.env.SCREEN_NAME;
const ASSET_LIST_FILE = process.env.ASSET_LIST_FILE;

// Validation
if (!AUTH0_DOMAIN || !AUTH0_TOKEN || !VERCEL_URL || !SCREEN_NAME) {
  console.error('❌ Missing required environment variables:');
  console.error('   - AUTH0_DOMAIN:', AUTH0_DOMAIN ? '✓' : '✗');
  console.error('   - AUTH0_MGMT_TOKEN:', AUTH0_TOKEN ? '✓' : '✗');
  console.error('   - VERCEL_URL:', VERCEL_URL ? '✓' : '✗');
  console.error('   - SCREEN_NAME:', SCREEN_NAME ? '✓' : '✗');
  process.exit(1);
}

console.log(`🚀 Updating Auth0 ${SCREEN_NAME} screen configuration...`);
console.log('📍 Auth0 Domain:', AUTH0_DOMAIN);
console.log('🌐 Vercel URL:', VERCEL_URL);

// Screen titles
const SCREEN_TITLES = {
  'login-id': 'Log in - Identifier First',
  'signup': 'Sign up',
  'consent': 'Consent'
};

// Extract asset hashes from file list
function extractHashesFromAssetList() {
  let assets;
  
  // Try to read from asset tracking file (CI environment)
  if (ASSET_LIST_FILE && fs.existsSync(ASSET_LIST_FILE)) {
    console.log('📄 Reading from asset tracking file:', ASSET_LIST_FILE);
    assets = fs.readFileSync(ASSET_LIST_FILE, 'utf8').trim().split('\n');
  } 
  // Fallback to reading from dist/assets (local environment)
  else {
    const distAssetsPath = path.join(__dirname, '../dist/assets');
    if (!fs.existsSync(distAssetsPath)) {
      console.error(`❌ Asset folder not found: ${distAssetsPath}`);
      console.error(`💡 Run: npm run build:${SCREEN_NAME}`);
      return null;
    }
    console.log('📂 Reading from dist/assets folder');
    assets = fs.readdirSync(distAssetsPath);
  }
  
  // Look for {screenName}-entry.{hash}.js and {screenName}-entry.{hash}.css
  const entryPattern = `${SCREEN_NAME}-entry`;
  const jsFile = assets.find(f => f.startsWith(entryPattern) && f.endsWith('.js'));
  const cssFile = assets.find(f => f.startsWith(entryPattern) && f.endsWith('.css'));

  if (!jsFile || !cssFile) {
    console.error(`❌ Could not find JS or CSS files in asset list for ${SCREEN_NAME}`);
    console.error('Expected pattern:', `${entryPattern}.{hash}.js/css`);
    console.error('Assets:', assets);
    return null;
  }

  const jsMatch = jsFile.match(/\.([a-zA-Z0-9_-]+)\.js$/);
  const cssMatch = cssFile.match(/\.([a-zA-Z0-9_-]+)\.css$/);
  
  if (!jsMatch || !cssMatch) {
    console.error(`❌ Could not extract hashes from filenames`);
    console.error('JS file:', jsFile);
    console.error('CSS file:', cssFile);
    return null;
  }

  return {
    jsHash: jsMatch[1],
    cssHash: cssMatch[1],
    jsUrl: `${VERCEL_URL}/assets/${jsFile}`,
    cssUrl: `${VERCEL_URL}/assets/${cssFile}`
  };
}

// Build Auth0 configuration object
function buildAuth0Config(screenName, jsUrl, cssUrl) {
  return {
    rendering_mode: 'advanced',
    head_tags: [
      {
        tag: 'script',
        attributes: {
          src: jsUrl,
          type: 'module',
          defer: true
        }
      },
      {
        tag: 'link',
        attributes: {
          rel: 'stylesheet',
          href: cssUrl
        }
      }
    ]
  };
}

// Update Auth0 screen configuration via Management API
function updateAuth0Screen(config) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    
    const options = {
      hostname: AUTH0_DOMAIN.replace('https://', ''),
      path: `/api/v2/prompts/${SCREEN_NAME}/screen/${SCREEN_NAME}/rendering`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${AUTH0_TOKEN}`,
        'User-Agent': 'Auth0-ACUL-Updater/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`✅ Successfully updated ${SCREEN_NAME}`);
          resolve(responseData);
        } else {
          console.error(`❌ Failed to update ${SCREEN_NAME}:`, res.statusCode);
          console.error('Response:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for ${SCREEN_NAME}:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Main execution
async function main() {
  try {
    // Extract asset hashes from the asset list file
    console.log('📝 Extracting asset hashes...');
    const assetInfo = extractHashesFromAssetList();
    
    if (!assetInfo) {
      throw new Error('Failed to extract asset hashes');
    }

    console.log(`📦 Found assets for ${SCREEN_NAME}:`);
    console.log(`   - JS:  ${assetInfo.jsUrl}`);
    console.log(`   - CSS: ${assetInfo.cssUrl}`);

    // Build Auth0 configuration
    const config = buildAuth0Config(SCREEN_NAME, assetInfo.jsUrl, assetInfo.cssUrl);

    console.log('\n📝 Configuration to apply:');
    console.log(JSON.stringify(config, null, 2));

    // Update Auth0
    console.log('\n🔄 Updating Auth0...');
    await updateAuth0Screen(config);

    console.log(`✨ ${SCREEN_NAME} screen updated successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
