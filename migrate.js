// migrate.js - KV schema migration script
// Run this script to migrate from individual visit records to aggregated per-page counters

// Usage:

// # Migrate production environment
// node migrate.js

// # Migrate preview environment
// node migrate.js --preview

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
  console.log('Loaded environment variables from .env file');
}

// You'll need to set your CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID
// environment variables to run this script
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
      
      // Check if we're entering the target environment section
      if (trimmedLine === targetSection) {
        inTargetSection = true;
        continue;
      }
      
      // Check if we're leaving the target section
      if (trimmedLine.startsWith('[') && trimmedLine !== '[[env.' + environment + '.kv_namespaces]]' && inTargetSection) {
        inTargetSection = false;
        inKvNamespaces = false;
        continue;
      }
      
      // Check if we're entering the kv_namespaces array
      if (trimmedLine === `[[env.${environment}.kv_namespaces]]` && inTargetSection) {
        inKvNamespaces = true;
        continue;
      }
      
      // Look for VISIT_LOG binding and get its ID
      if (inTargetSection && inKvNamespaces) {
        if (trimmedLine.includes('binding = "VISIT_LOG"')) {
          // Found the VISIT_LOG binding, now look for the ID in the next lines
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

// Get environment from command line args (default to production)
const environment = process.argv.includes('--preview') ? 'preview' : 'production';
const forceReset = process.argv.includes('--force');
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
    
    // Return the text directly - KV values are stored as strings
    return await response.text();
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

async function setKVValue(key, value) {
  const url = `${KV_BASE_URL}/values/${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'text/plain'
    },
    body: value
  });
  
  if (!response.ok) {
    throw new Error(`KV API request failed: ${response.status} ${response.statusText}`);
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
    
    console.log(`Fetched ${response.result.length} keys (total so far: ${allKeys.length})`);
    
  } while (cursor);
  
  return allKeys;
}

async function migrate() {
  console.log(`Starting KV schema migration for '${environment}' environment...`);
  console.log(`Using KV namespace: ${KV_NAMESPACE_ID}`);
  
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    console.error('Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables');
    process.exit(1);
  }
  
  try {
    // Check current schema version
    const currentVersionRaw = await getKVValue('schema_version');
    let currentVersion = null;
    
    if (currentVersionRaw) {
      try {
        // Try to parse as JSON first (in case it was stored as JSON)
        const parsed = JSON.parse(currentVersionRaw);
        currentVersion = parsed.value || parsed;
      } catch {
        // If not JSON, use as plain string
        currentVersion = currentVersionRaw;
      }
    }
    
    console.log('Current schema version:', currentVersion || 'none');
    
    if (currentVersion === 'v1' && !forceReset) {
      console.log('Schema is already up to date (v1). Use --force to re-run migration.');
      return;
    }
    
    if (forceReset && currentVersion === 'v1') {
      console.log('Force reset requested, re-running migration...');
    }
    
    if (!currentVersion) {
      console.log('No schema version found, assuming v0 and starting migration...');
    } else if (currentVersion !== 'v0' && currentVersion !== 'v1') {
      console.log(`Unknown schema version: ${currentVersion}, aborting migration`);
      process.exit(1);
    }
    
    // Get all visit records
    console.log('Fetching all visit records...');
    const visitKeys = await listKVKeys('visit:');
    console.log(`Found ${visitKeys.length} visit records`);
    
    if (visitKeys.length === 0) {
      console.log('No visit records found, setting schema version to v1');
      await setKVValue('schema_version', 'v1');
      return;
    }
    
    // Process visits and count by path
    const pathCounts = {};
    let processedCount = 0;
    const batchSize = 20; // Process in smaller batches to avoid rate limiting
    
    for (let i = 0; i < visitKeys.length; i += batchSize) {
      const batch = visitKeys.slice(i, i + batchSize);
      const batchPromises = batch.map(async (keyInfo) => {
        try {
          const visitData = await getKVValue(keyInfo.name);
          if (visitData) {
            const visit = JSON.parse(visitData);
            const path = visit.path || 'unknown';
            return { path, success: true };
          }
          return { success: false };
        } catch (error) {
          console.warn(`Failed to process visit record ${keyInfo.name}:`, error.message);
          return { success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Count the results
      batchResults.forEach(result => {
        if (result.success && result.path) {
          pathCounts[result.path] = (pathCounts[result.path] || 0) + 1;
        }
      });
      
      processedCount += batch.length;
      console.log(`Processed ${processedCount}/${visitKeys.length} visit records...`);
      
      // Small delay between batches to be nice to the API
      if (i + batchSize < visitKeys.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Processed ${processedCount} visit records`);
    console.log('Path counts:', pathCounts);
    
    // Store aggregated path counts
    console.log('Storing aggregated path counts...');
    for (const [path, count] of Object.entries(pathCounts)) {
      const pathKey = `path:${path}`;
      await setKVValue(pathKey, count.toString());
      console.log(`Set ${pathKey} = ${count}`);
    }
    
    // Update schema version
    await setKVValue('schema_version', 'v1');
    console.log('Schema migration completed successfully!');
    console.log('Set schema_version = v1');
    
    console.log('\\nMigration Summary:');
    console.log(`- Processed ${processedCount} visit records`);
    console.log(`- Created ${Object.keys(pathCounts).length} path counters`);
    console.log('- Updated schema version to v1');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}