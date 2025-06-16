// report.js - Generate a stats report from KV data
// Usage:
// node report.js              # production environment
// node report.js --preview    # preview environment

import { readFileSync, existsSync } from 'fs';

// Load environment variables from .env file if it exists
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

// Read namespace ID from wrangler.toml
function getNamespaceId(environment = 'production') {
  try {
    const wranglerConfig = readFileSync('wrangler.toml', 'utf8');
    const lines = wranglerConfig.split('\n');
    
    let inTargetSection = false;
    let inKvNamespaces = false;
    const targetSection = `[env.${environment}]`;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === targetSection) {
        inTargetSection = true;
        continue;
      }
      
      if (trimmedLine.startsWith('[') && trimmedLine !== '[[env.' + environment + '.kv_namespaces]]' && inTargetSection) {
        inTargetSection = false;
        inKvNamespaces = false;
        continue;
      }
      
      if (trimmedLine === `[[env.${environment}.kv_namespaces]]` && inTargetSection) {
        inKvNamespaces = true;
        continue;
      }
      
      if (inTargetSection && inKvNamespaces) {
        if (trimmedLine.includes('binding = "VISIT_LOG"')) {
          continue;
        }
        if (trimmedLine.includes('id =')) {
          const match = trimmedLine.match(/id\s*=\s*"([^"]+)"/);
          if (match) {
            return match[1];
          }
        }
      }
    }
    throw new Error(`Could not find VISIT_LOG KV namespace ID for environment '${environment}' in wrangler.toml`);
  } catch (error) {
    console.error('Error reading wrangler.toml:', error.message);
    process.exit(1);
  }
}

const environment = process.argv.includes('--preview') ? 'preview' : 'production';
const KV_NAMESPACE_ID = getNamespaceId(environment);
const KV_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}`;

async function makeKVRequest(method, path, body = null) {
  const url = `${KV_BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`KV API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function getKVValue(key) {
  try {
    const url = `${KV_BASE_URL}/values/${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      }
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`KV API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

async function listKVKeys(prefix = '') {
  const allKeys = [];
  let cursor = null;
  
  do {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (cursor) params.set('cursor', cursor);
    
    const queryString = params.toString();
    const url = `/keys${queryString ? '?' + queryString : ''}`;
    const response = await makeKVRequest('GET', url);
    
    allKeys.push(...response.result);
    cursor = response.result_info?.cursor;
    
  } while (cursor);
  
  return allKeys;
}

async function generateReport() {
  console.log(`\n📊 Visit Stats Report - ${environment.toUpperCase()} Environment`);
  console.log(`KV Namespace: ${KV_NAMESPACE_ID}`);
  console.log('='.repeat(60));
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    console.error('Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables');
    process.exit(1);
  }
  
  try {
    // Get all path keys
    console.log('Fetching path statistics...');
    const pathKeys = await listKVKeys('path:');
    
    if (pathKeys.length === 0) {
      console.log('No path statistics found. Run migration first: node migrate.js');
      return;
    }
    
    // Fetch all path counts
    const pathStats = [];
    let totalVisits = 0;
    
    for (const key of pathKeys) {
      const count = await getKVValue(key.name);
      if (count) {
        const path = key.name.replace('path:', '');
        const visits = parseInt(count);
        pathStats.push({ path, visits });
        totalVisits += visits;
      }
    }
    
    // Sort by visit count (highest first)
    pathStats.sort((a, b) => b.visits - a.visits);
    
    // Display results
    console.log(`\nTotal Visits: ${totalVisits}`);
    console.log(`Unique Pages: ${pathStats.length}\n`);
    
    console.log('📈 VISITS BY PAGE:');
    console.log('-'.repeat(60));
    console.log('Visits | Page');
    console.log('-'.repeat(60));
    
    pathStats.forEach(({ path, visits }) => {
      const percentage = ((visits / totalVisits) * 100).toFixed(1);
      console.log(`${visits.toString().padStart(6)} | ${path} (${percentage}%)`);
    });
    
    console.log('-'.repeat(60));
    console.log(`${totalVisits.toString().padStart(6)} | TOTAL`);
    
    // Top pages summary
    console.log('\n🏆 TOP 5 PAGES:');
    pathStats.slice(0, 5).forEach((stat, index) => {
      const percentage = ((stat.visits / totalVisits) * 100).toFixed(1);
      console.log(`${index + 1}. ${stat.path} - ${stat.visits} visits (${percentage}%)`);
    });
    
    // Check for schema version
    const schemaVersion = await getKVValue('schema_version');
    console.log(`\nSchema Version: ${schemaVersion || 'none'}`);
    
  } catch (error) {
    console.error('Report generation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport();
}