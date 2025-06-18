export async function onRequestGet({ env }) {
  const startTime = Date.now();
  console.log('Stats generation started');
  
  try {
    // Check schema version
    const schemaVersionRaw = await env.VISIT_LOG.get('schema_version');
    let schemaVersion = null;
    
    if (schemaVersionRaw) {
      try {
        // Try to parse as JSON first (in case it was stored as JSON)
        const parsed = JSON.parse(schemaVersionRaw);
        schemaVersion = parsed.value || parsed;
      } catch {
        // If not JSON, use as plain string
        schemaVersion = schemaVersionRaw;
      }
    }
    
    const useV1Schema = schemaVersion === 'v1';
    console.log('Schema version detected:', schemaVersion, 'useV1Schema:', useV1Schema);
    
    let pathCounts = {};
    let totalVisits = 0;
    let recentVisits = [];
    let dayCounts = {};
    let countryCounts = {};
    let uniqueIPs = new Set();
    
    if (useV1Schema) {
      // Use efficient v1 schema with pre-computed path counters
      console.log('Using v1 schema for fast stats');
      
      // Get all keys and separate by type
      const { keys } = await env.VISIT_LOG.list();
      const pathKeys = keys.filter(k => k.name.startsWith('path:'));
      const visitKeys = keys.filter(k => k.name.startsWith('visit:'));
      
      // Get path counts from pre-computed counters (batched)
      console.log(`Fetching ${pathKeys.length} path counters...`);
      const pathCountsStart = Date.now();
      const pathValues = await Promise.all(
        pathKeys.map(key => env.VISIT_LOG.get(key.name))
      );
      console.log(`Path counters fetched in ${Date.now() - pathCountsStart}ms`);
      
      pathKeys.forEach((key, index) => {
        const count = pathValues[index];
        if (count) {
          const path = key.name.replace('path:', '');
          const countNum = parseInt(count);
          pathCounts[path] = countNum;
          totalVisits += countNum;
        }
      });
      
      // Get recent visits (limit to 50 for performance)
      const recentVisitKeys = visitKeys
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, 50);
      
      // Get recent visits (batched)
      console.log(`Fetching ${recentVisitKeys.length} recent visits...`);
      const visitsStart = Date.now();
      const visitValues = await Promise.all(
        recentVisitKeys.map(key => env.VISIT_LOG.get(key.name))
      );
      console.log(`Recent visits fetched in ${Date.now() - visitsStart}ms`);
      
      visitValues.forEach(visitData => {
        if (visitData) {
          try {
            const parsed = JSON.parse(visitData);
            recentVisits.push(parsed);
            uniqueIPs.add(parsed.ip);
            
            // Count by day
            const day = parsed.ts.split('T')[0];
            dayCounts[day] = (dayCounts[day] || 0) + 1;
            
            // Count by country
            const country = parsed.country || 'unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          } catch (e) {
            console.error('Failed to parse visit data:', e);
          }
        }
      });
      
    } else {
      // Fallback to v0 schema (compute everything from visit records)
      console.log('Using v0 schema - computing stats from visit records');
      
      const { keys } = await env.VISIT_LOG.list();
      const visitKeys = keys.filter(k => k.name.startsWith('visit:'));
      
      // Process all visits (slower but works with old schema) - batched
      console.log(`Processing ${visitKeys.length} visit records (v0 schema)...`);
      const v0Start = Date.now();
      const allVisitValues = await Promise.all(
        visitKeys.map(key => env.VISIT_LOG.get(key.name))
      );
      console.log(`All visits fetched in ${Date.now() - v0Start}ms`);
      
      allVisitValues.forEach(visitData => {
        if (visitData) {
          try {
            const parsed = JSON.parse(visitData);
            recentVisits.push(parsed);
            uniqueIPs.add(parsed.ip);
            
            // Count by path
            const path = parsed.path || 'unknown';
            pathCounts[path] = (pathCounts[path] || 0) + 1;
            
            // Count by day
            const day = parsed.ts.split('T')[0];
            dayCounts[day] = (dayCounts[day] || 0) + 1;
            
            // Count by country
            const country = parsed.country || 'unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          } catch (e) {
            console.error('Failed to parse visit data:', e);
          }
        }
      });
      
      totalVisits = recentVisits.length;
      // Sort recent visits by timestamp and limit to 50
      recentVisits.sort((a, b) => new Date(b.ts) - new Date(a.ts));
      recentVisits = recentVisits.slice(0, 50);
    }
    
    // Sort recent visits by timestamp
    recentVisits.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // Generate HTML report
    console.log(`Stats generation completed in ${Date.now() - startTime}ms`);
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Visit Statistics - Adam's Blog</title>
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
    .stat-box {
      background-color: #1a1a2e;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      border-left: 4px solid #00f2ff;
    }
    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #00f2ff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      border: 1px solid #334;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #1a1a2e;
      color: #00f2ff;
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
  </style>
</head>
<body>
  <a href="/" class="back-link">← Back to Blog</a>
  
  <h1>Visit Statistics</h1>
  <div style="text-align: center; margin-bottom: 1rem; color: #666; font-size: 0.9rem;">
    Schema: ${useV1Schema ? 'v1 (fast)' : 'v0 (computed)'}
  </div>
  
  <div class="stat-box">
    <div>Total Visits</div>
    <div class="stat-number">${totalVisits}</div>
  </div>
  
  <div class="stat-box">
    <div>Unique IPs</div>
    <div class="stat-number">${uniqueIPs.size}</div>
  </div>

  <h2>Visits by Page</h2>
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Visits</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(pathCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([path, count]) => `
          <tr>
            <td>${path}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
    </tbody>
  </table>

  <h2>Visits by Day</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Visits</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(dayCounts)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([day, count]) => `
          <tr>
            <td>${day}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
    </tbody>
  </table>

  <h2>Visits by Country</h2>
  <table>
    <thead>
      <tr>
        <th>Country</th>
        <th>Visits</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(countryCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([country, count]) => `
          <tr>
            <td>${country.toUpperCase()}</td>
            <td>${count}</td>
          </tr>
        `).join('')}
    </tbody>
  </table>

  <h2>Recent Visits</h2>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Path</th>
        <th>IP</th>
        <th>Country</th>
      </tr>
    </thead>
    <tbody>
      ${recentVisits.slice(0, 20).map(visit => `
        <tr>
          <td>${new Date(visit.ts).toLocaleString()}</td>
          <td>${visit.path || 'unknown'}</td>
          <td>${visit.ip}</td>
          <td>${(visit.country || 'unknown').toUpperCase()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
      },
    });

  } catch (error) {
    console.error('Error generating stats:', error);
    return new Response('Error generating statistics', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}