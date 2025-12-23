#!/usr/bin/env node

/**
 * Update Auth0 ACUL Screen Configuration
 * 
 * This script updates a single Auth0 screen with asset URLs from Vercel
 */

import https from 'https';
import fs from 'fs';

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
  if (!ASSET_LIST_FILE || !fs.existsSync(ASSET_LIST_FILE)) {
    console.error(`❌ Asset list file not found: ${ASSET_LIST_FILE}`);
    return null;
  }

  const assets = fs.readFileSync(ASSET_LIST_FILE, 'utf8').trim().split('\n');
  
  const jsFile = assets.find(f => f.match(/^index\.([a-zA-Z0-9]+)\.js$/));
  const cssFile = assets.find(f => f.match(/^index\.([a-zA-Z0-9]+)\.css$/));

  if (!jsFile || !cssFile) {
    console.error(`❌ Could not find JS or CSS files in asset list for ${SCREEN_NAME}`);
    console.error('Assets:', assets);
    return null;
  }

  const jsHash = jsFile.match(/^index\.([a-zA-Z0-9]+)\.js$/)[1];
  const cssHash = cssFile.match(/^index\.([a-zA-Z0-9]+)\.css$/)[1];

  return {
    jsHash,
    cssHash,
    jsUrl: `${VERCEL_URL}/assets/${jsFile}`,
    cssUrl: `${VERCEL_URL}/assets/${cssFile}`
  };
}

// Build Auth0 configuration object
function buildAuth0Config(screenName, jsUrl, cssUrl) {
  const title = SCREEN_TITLES[screenName] || screenName;
  
  return {
    name: screenName,
    title: title,
    version: 'v2',
    library_url: jsUrl,
    stylesheet_url: cssUrl,
    metadata: {
      updated_at: new Date().toISOString(),
      deployment_url: VERCEL_URL,
      deployment_type: 'vercel'
    }
  };
}

// Update Auth0 screen configuration via Management API
function updateAuth0Screen(config) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    
    const options = {
      hostname: AUTH0_DOMAIN,
      path: `/api/v2/acul/screens/${config.name}`,
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
        if (res.statusCode === 200) {
          console.log(`✅ Successfully updated ${config.name}`);
          resolve(responseData);
        } else {
          console.error(`❌ Failed to update ${config.name}:`, res.statusCode);
          console.error('Response:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for ${config.name}:`, error.message);
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

    // Update Auth0
    console.log('🔄 Updating Auth0...');
    await updateAuth0Screen(config);

    console.log(`✨ ${SCREEN_NAME} screen updated successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
