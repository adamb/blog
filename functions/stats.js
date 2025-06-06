export async function onRequestGet({ env }) {
  try {
    // Get all visit logs from KV
    const { keys } = await env.VISIT_LOG.list();
    const visits = [];
    
    // Fetch all visit data
    for (const key of keys) {
      const visitData = await env.VISIT_LOG.get(key.name);
      if (visitData) {
        try {
          const parsed = JSON.parse(visitData);
          visits.push(parsed);
        } catch (e) {
          console.error('Failed to parse visit data:', e);
        }
      }
    }

    // Sort visits by timestamp (newest first)
    visits.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // Calculate stats
    const totalVisits = visits.length;
    const uniqueIPs = new Set(visits.map(v => v.ip)).size;
    
    // Count visits by path
    const pathCounts = {};
    visits.forEach(visit => {
      const path = visit.path || 'unknown';
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    });

    // Count visits by day
    const dayCounts = {};
    visits.forEach(visit => {
      const day = visit.ts.split('T')[0]; // Get YYYY-MM-DD
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

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
    <div class="stat-number">${uniqueIPs}</div>
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
      ${visits.slice(0, 20).map(visit => `
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