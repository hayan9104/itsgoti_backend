#!/usr/bin/env node
/**
 * GOTI Theme CLI
 *
 * Usage:
 *   node scripts/goti-cli.js list                          - List all themes
 *   node scripts/goti-cli.js pull <themeId> [folder]       - Pull theme to local folder
 *   node scripts/goti-cli.js push <themeId> [folder]       - Push local folder to theme
 *   node scripts/goti-cli.js preview <themeId>             - Open preview URL
 *
 * Environment:
 *   GOTI_SERVER_URL  - Server URL (default: http://localhost:5000)
 *   GOTI_TOKEN       - JWT auth token (required for authenticated operations)
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.GOTI_SERVER_URL || 'http://localhost:5000';
const TOKEN = process.env.GOTI_TOKEN || '';

// Simple HTTP request helper (no external dependencies)
function apiRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, SERVER_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Commands
async function listThemes() {
  const result = await apiRequest('GET', '/api/themes');
  console.log('\n  Themes:\n');
  if (result.data.length === 0) {
    console.log('  No themes found. Create one in the admin panel first.\n');
    return;
  }
  for (const theme of result.data) {
    const badge = theme.isLive ? ' [LIVE]' : ' [DRAFT]';
    const date = new Date(theme.updatedAt).toLocaleString();
    console.log(`  ${theme._id}  ${theme.name}${badge}`);
    console.log(`    Last saved: ${date}\n`);
  }
}

async function pullTheme(themeId, folder) {
  if (!themeId) {
    console.error('Error: Please provide a theme ID. Run "list" to see available themes.');
    process.exit(1);
  }

  const outputDir = folder || path.join(process.cwd(), `theme-${themeId}`);
  console.log(`\n  Pulling theme ${themeId}...`);

  const result = await apiRequest('GET', `/api/themes/${themeId}/all-pages`);
  const { name, pages, customCSS, config } = result.data;

  ensureDir(outputDir);
  ensureDir(path.join(outputDir, 'pages'));

  // Write each page as a separate JSON file
  for (const [pageName, pageData] of Object.entries(pages)) {
    const filePath = path.join(outputDir, 'pages', `${pageName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
    console.log(`  - Pulled page: ${pageName}`);
  }

  // Write custom CSS
  fs.writeFileSync(path.join(outputDir, 'custom.css'), customCSS || '');
  console.log('  - Pulled custom.css');

  // Write config
  fs.writeFileSync(
    path.join(outputDir, 'config.json'),
    JSON.stringify(config || {}, null, 2)
  );
  console.log('  - Pulled config.json');

  // Write theme metadata
  fs.writeFileSync(
    path.join(outputDir, 'theme.json'),
    JSON.stringify({ id: themeId, name, pulledAt: new Date().toISOString() }, null, 2)
  );

  console.log(`\n  Theme "${name}" pulled to: ${outputDir}`);
  console.log('  Edit the files in VS Code, then run push to upload.\n');
}

async function pushTheme(themeId, folder) {
  if (!themeId) {
    console.error('Error: Please provide a theme ID. Run "list" to see available themes.');
    process.exit(1);
  }

  const inputDir = folder || path.join(process.cwd(), `theme-${themeId}`);

  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Folder not found: ${inputDir}`);
    console.error('Pull the theme first, or specify the folder path.');
    process.exit(1);
  }

  console.log(`\n  Pushing theme ${themeId} from: ${inputDir}`);

  // Read all page files
  const pagesDir = path.join(inputDir, 'pages');
  const pages = {};

  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const pageName = path.basename(file, '.json');
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
      pages[pageName] = JSON.parse(content);
      console.log(`  - Pushing page: ${pageName}`);
    }
  }

  // Read custom CSS
  let customCSS = '';
  const cssPath = path.join(inputDir, 'custom.css');
  if (fs.existsSync(cssPath)) {
    customCSS = fs.readFileSync(cssPath, 'utf-8');
    console.log('  - Pushing custom.css');
  }

  // Read config
  let config = {};
  const configPath = path.join(inputDir, 'config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('  - Pushing config.json');
  }

  // Push to server
  const result = await apiRequest('PUT', `/api/themes/${themeId}/all-pages`, {
    pages,
    customCSS,
    config,
  });

  console.log(`\n  Theme "${result.data.name}" updated successfully!`);
  if (result.data.isLive) {
    console.log('  WARNING: This is the LIVE theme. Changes are visible to visitors immediately.\n');
  } else {
    console.log('  This is a draft theme. Publish it from the admin panel when ready.\n');
  }
}

function previewTheme(themeId) {
  if (!themeId) {
    console.error('Error: Please provide a theme ID.');
    process.exit(1);
  }
  const previewUrl = `${SERVER_URL.replace(':5000', ':3000')}/?themeId=${themeId}&editor=true`;
  console.log(`\n  Preview URL: ${previewUrl}`);
  console.log('  Open this URL in your browser to preview the theme.\n');

  // Try to open in default browser
  const { exec } = require('child_process');
  const platform = process.platform;
  const cmd =
    platform === 'win32' ? 'start' : platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${cmd} "${previewUrl}"`);
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!TOKEN && command !== 'list') {
    // Try to read token from .goti-token file
    const tokenFile = path.join(process.cwd(), '.goti-token');
    if (fs.existsSync(tokenFile)) {
      process.env.GOTI_TOKEN = fs.readFileSync(tokenFile, 'utf-8').trim();
    }
  }

  console.log('\n  GOTI Theme CLI');
  console.log('  ──────────────');

  try {
    switch (command) {
      case 'list':
        await listThemes();
        break;
      case 'pull':
        await pullTheme(args[1], args[2]);
        break;
      case 'push':
        await pushTheme(args[1], args[2]);
        break;
      case 'preview':
        previewTheme(args[1]);
        break;
      default:
        console.log('\n  Usage:');
        console.log('    node scripts/goti-cli.js list                     List all themes');
        console.log('    node scripts/goti-cli.js pull <themeId> [folder]  Pull theme to local');
        console.log('    node scripts/goti-cli.js push <themeId> [folder]  Push local to theme');
        console.log('    node scripts/goti-cli.js preview <themeId>        Open preview URL');
        console.log('\n  Environment variables:');
        console.log('    GOTI_SERVER_URL  Server URL (default: http://localhost:5000)');
        console.log('    GOTI_TOKEN       JWT auth token');
        console.log('\n  Or create a .goti-token file with your JWT token.\n');
    }
  } catch (error) {
    console.error(`\n  Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
