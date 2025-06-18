export async function onRequestGet({ env }) {
  // Show migration interface
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Stats Migration - Adam's Blog</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #0a0a1a;
      color: #e0e0e0;
    }
    h1, h2 {
      color: #00f2ff;
    }
    .warning {
      background-color: #2a1a1a;
      border: 2px solid #ff6b6b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info {
      background-color: #1a1a2e;
      border: 2px solid #00f2ff;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    button {
      background-color: #00f2ff;
      color: #0a0a1a;
      border: none;
      padding: 15px 30px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px 5px;
    }
    button:hover {
      background-color: #00d4e6;
    }
    button:disabled {
      background-color: #666;
      cursor: not-allowed;
    }
    .back-link {
      color: #00f2ff;
      text-decoration: none;
      margin-bottom: 20px;
      display: inline-block;
    }
    .back-link:hover {
      text-decoration: underline;
    }
    #result {
      background-color: #1a1a2e;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
      white-space: pre-wrap;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <a href="/" class="back-link">← Back to Blog</a>
  
  <h1>Stats Migration Tool</h1>
  
  <div class="info">
    <h3>📊 V1 to V2 Schema Migration</h3>
    <p>This tool migrates your visit statistics from the old v1 schema to the new v2 cached counter system.</p>
    <p><strong>What it does:</strong></p>
    <ul>
      <li>Reads all existing visit records</li>
      <li>Creates cached counters for countries, days, and total visits</li>
      <li>Enables much faster stats page performance</li>
      <li>Sets schema version to v1 (uses v2 cached system)</li>
    </ul>
  </div>
  
  <div class="warning">
    <h3>⚠️ Important Notes</h3>
    <ul>
      <li>This is safe to run multiple times</li>
      <li>Migration may take 30-60 seconds for large datasets</li>
      <li>Your stats page will be faster after migration</li>
      <li>No data will be lost</li>
    </ul>
  </div>
  
  <button onclick="runMigration()" id="migrateBtn">
    🚀 Start Migration
  </button>
  
  <button onclick="checkStatus()" id="statusBtn">
    📊 Check Current Status
  </button>
  
  <div id="result" style="display: none;"></div>
  
  <script>
    async function runMigration() {
      const btn = document.getElementById('migrateBtn');
      const result = document.getElementById('result');
      
      btn.disabled = true;
      btn.textContent = '⏳ Migrating...';
      result.style.display = 'block';
      result.textContent = 'Starting migration...\\n';
      
      try {
        const response = await fetch('/admin-migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.text();
        
        if (response.ok) {
          result.textContent = 'Migration completed successfully!\\n\\n' + data;
          btn.textContent = '✅ Migration Complete';
        } else {
          result.textContent = 'Migration failed:\\n\\n' + data;
          btn.textContent = '❌ Migration Failed';
          btn.disabled = false;
        }
      } catch (error) {
        result.textContent = 'Network error: ' + error.message;
        btn.textContent = '❌ Migration Failed';
        btn.disabled = false;
      }
    }
    
    async function checkStatus() {
      const result = document.getElementById('result');
      result.style.display = 'block';
      result.textContent = 'Checking status...\\n';
      
      try {
        const response = await fetch('/stats');
        if (response.ok) {
          result.textContent = 'Stats page is working! Check /stats to see current schema version.';
        } else {
          result.textContent = 'Stats page error: ' + response.status;
        }
      } catch (error) {
        result.textContent = 'Error checking stats: ' + error.message;
      }
    }
  </script>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function onRequestPost({ env }) {
  const startTime = Date.now();
  console.log('Starting v1 to v2 migration...');
  
  try {
    if (!env.VISIT_LOG) {
      return new Response('KV binding not available', { status: 500 });
    }

    // Get all visit records
    const { keys } = await env.VISIT_LOG.list();
    const visitKeys = keys.filter(k => k.name.startsWith('visit:'));
    
    console.log(`Found ${visitKeys.length} visit records to process`);
    
    if (visitKeys.length === 0) {
      return new Response('No visit records found to migrate', { status: 200 });
    }

    // Process visits in batches to avoid memory issues
    const batchSize = 100;
    let totalVisits = 0;
    const countryCounts = {};
    const dayCounts = {};
    const pathCounts = {}; // Will verify against existing path: counters
    
    for (let i = 0; i < visitKeys.length; i += batchSize) {
      const batch = visitKeys.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(visitKeys.length/batchSize)}...`);
      
      const visitValues = await Promise.all(
        batch.map(key => env.VISIT_LOG.get(key.name))
      );
      
      visitValues.forEach(visitData => {
        if (visitData) {
          try {
            const parsed = JSON.parse(visitData);
            totalVisits++;
            
            // Count by country
            const country = parsed.country || 'unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
            
            // Count by day
            const day = parsed.ts.split('T')[0];
            dayCounts[day] = (dayCounts[day] || 0) + 1;
            
            // Count by path (for verification)
            const path = parsed.path || 'unknown';
            pathCounts[path] = (pathCounts[path] || 0) + 1;
            
          } catch (e) {
            console.error('Failed to parse visit data:', e);
          }
        }
      });
    }
    
    console.log(`Processed ${totalVisits} total visits`);
    console.log(`Found ${Object.keys(countryCounts).length} unique countries`);
    console.log(`Found ${Object.keys(dayCounts).length} unique days`);
    console.log(`Found ${Object.keys(pathCounts).length} unique paths`);
    
    // Prepare all counter updates
    const updates = [];
    
    // Add total visits counter
    updates.push(['total_visits', totalVisits.toString()]);
    
    // Add country counters
    Object.entries(countryCounts).forEach(([country, count]) => {
      updates.push([`country:${country}`, count.toString()]);
    });
    
    // Add day counters
    Object.entries(dayCounts).forEach(([day, count]) => {
      updates.push([`day:${day}`, count.toString()]);
    });
    
    console.log(`Preparing to write ${updates.length} counter updates...`);
    
    // Write counters in batches to avoid hitting KV limits
    const updateBatchSize = 50;
    for (let i = 0; i < updates.length; i += updateBatchSize) {
      const updateBatch = updates.slice(i, i + updateBatchSize);
      console.log(`Writing batch ${Math.floor(i/updateBatchSize) + 1}/${Math.ceil(updates.length/updateBatchSize)}...`);
      
      await Promise.all(
        updateBatch.map(([key, value]) => env.VISIT_LOG.put(key, value))
      );
    }
    
    // Set schema version to v1 (which will use the new v2 cached system)
    await env.VISIT_LOG.put('schema_version', 'v1');
    
    const totalTime = Date.now() - startTime;
    console.log(`Migration completed in ${totalTime}ms`);
    
    // Generate report
    const report = {
      success: true,
      totalTime: `${totalTime}ms`,
      visitRecordsProcessed: totalVisits,
      countersCreated: updates.length,
      breakdown: {
        countries: Object.keys(countryCounts).length,
        days: Object.keys(dayCounts).length,
        paths: Object.keys(pathCounts).length
      },
      topCountries: Object.entries(countryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      pathVerification: Object.entries(pathCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
    
    return new Response(JSON.stringify(report, null, 2), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return new Response(`Migration failed: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}