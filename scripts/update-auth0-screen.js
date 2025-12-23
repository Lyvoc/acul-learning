#!/usr/bin/env node

/**
 * Update Auth0 ACUL Screen Configuration
 * 
 * This script updates a single Auth0 screen with Vercel deployment URLs
 */

import https from 'https';

// Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_TOKEN = process.env.AUTH0_MGMT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;
const SCREEN_NAME = process.env.SCREEN_NAME;

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

// Fetch the index.html from Vercel
function getAssetHashesFromVercel(vercelUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(vercelUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Auth0-ACUL-Updater/1.0'
      }
    };

    https.get(options, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        console.log('📦 Fetched index.html from Vercel');
        resolve(html);
      });
    }).on('error', (error) => {
      console.error('❌ Failed to fetch from Vercel:', error.message);
      reject(error);
    });
  });
}

// Extract hashes from HTML
function extractHashesFromHtml(html) {
  const hashes = {};
  
  // Extract JavaScript files
  const jsMatches = html.matchAll(/\/assets\/([^"']+\.js)/g);
  for (const match of jsMatches) {
    const filePath = match[1];
    const hashMatch = filePath.match(/\.([a-zA-Z0-9_-]+)\.js$/);
    if (hashMatch) {
      const fileName = filePath.split('/').pop().replace(/\.[a-zA-Z0-9_-]+\.js$/, '');
      hashes[fileName] = hashMatch[1];
    }
  }
  
  // Extract CSS files
  const cssMatches = html.matchAll(/\/assets\/([^"']+\.css)/g);
  for (const match of cssMatches) {
    const filePath = match[1];
    const hashMatch = filePath.match(/\.([a-zA-Z0-9_-]+)\.css$/);
    if (hashMatch) {
      const fileName = filePath.split('/').pop().replace(/\.[a-zA-Z0-9_-]+\.css$/, '');
      hashes[fileName] = hashMatch[1];
    }
  }
  
  console.log('✅ Extracted hashes from Vercel deployment:');
  Object.entries(hashes).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  return hashes;
}

// Build Auth0 configuration
function buildAuth0Config(hashes, baseUrl) {
  // Ensure URL has https:// and no trailing slash
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  const headTags = [
    {
      tag: 'base',
      attributes: {
        href: `${cleanUrl}/`
      }
    }
  ];
  
  // Add main JavaScript file
  if (hashes.index) {
    headTags.push({
      tag: 'script',
      attributes: {
        src: `${cleanUrl}/assets/index.${hashes.index}.js`,
        type: 'module',
        defer: true
      }
    });
  }
  
  // Add CSS file
  if (hashes.index) {
    headTags.push({
      tag: 'link',
      attributes: {
        rel: 'stylesheet',
        href: `${cleanUrl}/assets/index.${hashes.index}.css`
      }
    });
  }
  
  return {
    rendering_mode: 'advanced',
    head_tags: headTags
  };
}

// Update Auth0 screen configuration
function updateAuth0Screen(prompt, screen, config) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    
    const options = {
      hostname: AUTH0_DOMAIN.replace('https://', ''),
      path: `/api/v2/prompts/${prompt}/screen/${screen}/rendering`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AUTH0_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`✅ Updated ${prompt}/${screen} - Status: ${res.statusCode}`);
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          console.error(`❌ Failed to update ${prompt}/${screen} - Status: ${res.statusCode}`);
          console.error('Response:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for ${prompt}/${screen}:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Main execution
async function main() {
  try {
    // Step 1: Fetch actual deployed HTML from Vercel
    console.log('🌐 Fetching deployed assets from Vercel...');
    const html = await getAssetHashesFromVercel(VERCEL_URL);
    
    // Step 2: Extract hashes from HTML
    const hashes = extractHashesFromHtml(html);
    
    // Validate we have required hashes
    if (Object.keys(hashes).length === 0) {
      console.error('❌ No asset hashes found in HTML');
      console.error('HTML preview:', html.substring(0, 500));
      process.exit(1);
    }
    
    // Step 3: Build configuration
    const config = buildAuth0Config(hashes, VERCEL_URL);
    
    console.log('\n📝 Configuration to be applied:');
    console.log(JSON.stringify(config, null, 2));
    
    // Step 4: Update the screen
    console.log(`\n🔄 Updating ${SCREEN_NAME} screen...`);
    await updateAuth0Screen(SCREEN_NAME, SCREEN_NAME, config);
    
    console.log(`\n🎉 ${SCREEN_NAME} screen updated successfully!`);
    console.log('🔗 Screen URL:', VERCEL_URL);
    
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
