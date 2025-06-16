export async function onRequestGet({ env }) {
  try {
    // Get all keys from KV
    const { keys } = await env.VISIT_LOG.list();
    
    // Separate different types of keys
    const visitKeys = keys.filter(k => k.name.startsWith('visit:'));
    const pathKeys = keys.filter(k => k.name.startsWith('path:'));
    
    // Get path counts efficiently from aggregated counters
    const pathCounts = {};
    let totalVisitsFromPaths = 0;
    
    for (const key of pathKeys) {
      const count = await env.VISIT_LOG.get(key.name);
      if (count) {
        const path = key.name.replace('path:', '');
        const countNum = parseInt(count);
        pathCounts[path] = countNum;
        totalVisitsFromPaths += countNum;
      }
    }

    // Get recent visits for the "Recent Visits" section and daily stats
    // We'll still process recent visits but limit to last 50 for performance
    const recentVisitKeys = visitKeys
      .sort((a, b) => b.name.localeCompare(a.name)) // Sort by timestamp (newest first)
      .slice(0, 50);
    
    const recentVisits = [];
    const dayCounts = {};
    const uniqueIPs = new Set();
    
    for (const key of recentVisitKeys) {
      const visitData = await env.VISIT_LOG.get(key.name);
      if (visitData) {
        try {
          const parsed = JSON.parse(visitData);
          recentVisits.push(parsed);
          uniqueIPs.add(parsed.ip);
          
          // Count by day
          const day = parsed.ts.split('T')[0];
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        } catch (e) {
          console.error('Failed to parse visit data:', e);
        }
      }
    }

    // Use total from path counters if available, otherwise fall back to visit count
    const totalVisits = totalVisitsFromPaths > 0 ? totalVisitsFromPaths : visitKeys.length;
    
    // Sort recent visits by timestamp
    recentVisits.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // Generate HTML report
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

  <h2>Recent Visits</h2>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Path</th>
        <th>IP</th>
      </tr>
    </thead>
    <tbody>
      ${recentVisits.slice(0, 20).map(visit => `
        <tr>
          <td>${new Date(visit.ts).toLocaleString()}</td>
          <td>${visit.path || 'unknown'}</td>
          <td>${visit.ip}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
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