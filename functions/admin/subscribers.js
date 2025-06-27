export async function onRequestGet({ request, env }) {
  return await handleAdminRequest({ request, env });
}

export async function onRequestPost({ request, env }) {
  return await handleAdminRequest({ request, env });
}

async function handleAdminRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    // Handle login form submission
    if (request.method === 'POST') {
      const formData = await request.formData();
      const password = formData.get('password');
      
      if (password === 'Madrid2025') {
        // Set session cookie and redirect to admin view
        const response = new Response('', {
          status: 302,
          headers: {
            'Location': '/admin/subscribers?authenticated=true',
            'Set-Cookie': 'admin_session=authenticated; HttpOnly; Secure; SameSite=Strict; Max-Age=3600'
          }
        });
        return response;
      } else {
        return generateLoginPage('Invalid password. Please try again.');
      }
    }

    // Check authentication for GET requests
    const authenticated = url.searchParams.get('authenticated') === 'true' || 
                         request.headers.get('Cookie')?.includes('admin_session=authenticated');

    if (!authenticated) {
      return generateLoginPage();
    }

    // Handle admin actions
    if (action === 'export') {
      return await exportSubscribers(env);
    }

    if (action === 'delete' && request.method === 'POST') {
      const formData = await request.formData();
      const email = formData.get('email');
      if (email) {
        await env.BLOG_SUBS.delete(`email:${email}`);
      }
    }

    // Default: show admin dashboard
    return await generateAdminDashboard(env);

  } catch (error) {
    console.error('Admin panel error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

function generateLoginPage(errorMessage = '') {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Adam's Blog</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0a0a1a;
      color: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .login-container {
      background: rgba(0, 242, 255, 0.05);
      border: 1px solid #334;
      border-radius: 8px;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #00f2ff;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #e0e0e0;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #334;
      border-radius: 4px;
      background: #1a1a2e;
      color: #e0e0e0;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #00f2ff;
      box-shadow: 0 0 5px rgba(0, 242, 255, 0.3);
    }
    .login-btn {
      width: 100%;
      background: #1a1a2e;
      color: #e0e0e0;
      border: 1px solid #334;
      padding: 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    .login-btn:hover {
      background: rgba(0, 242, 255, 0.1);
      border-color: #00f2ff;
      color: #00f2ff;
    }
    .error {
      background: rgba(255, 100, 100, 0.1);
      color: #ff6464;
      border: 1px solid #ff6464;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
    .back-link {
      text-align: center;
      margin-top: 1rem;
    }
    .back-link a {
      color: #888;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .back-link a:hover {
      color: #00f2ff;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>🔐 Admin Access</h1>
    ${errorMessage ? `<div class="error">${errorMessage}</div>` : ''}
    <form method="post">
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required autofocus>
      </div>
      <button type="submit" class="login-btn">Login</button>
    </form>
    <div class="back-link">
      <a href="/">← Back to Blog</a>
    </div>
  </div>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function generateAdminDashboard(env) {
  try {
    // Check if KV is available (not in local dev without proper binding)
    if (!env.BLOG_SUBS) {
      return new Response(generateNoKVPage(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Get all subscribers from KV
    const { keys } = await env.BLOG_SUBS.list({ prefix: 'email:' });
    const subscribers = [];
    
    for (const key of keys) {
      try {
        const data = await env.BLOG_SUBS.get(key.name);
        if (data) {
          const subscriber = JSON.parse(data);
          subscriber.email = key.name.replace('email:', '');
          subscribers.push(subscriber);
        }
      } catch (e) {
        console.error('Error parsing subscriber data:', e);
      }
    }

    // Sort by subscription date (newest first)
    subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));

    const stats = {
      total: subscribers.length,
      verified: subscribers.filter(s => s.verified).length,
      unverified: subscribers.filter(s => !s.verified).length,
      active: subscribers.filter(s => s.subscribed && s.verified).length,
      unsubscribed: subscribers.filter(s => !s.subscribed).length
    };

    return new Response(generateAdminHTML(subscribers, stats), {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error generating admin dashboard:', error);
    return new Response('Error loading subscriber data', { status: 500 });
  }
}

function generateAdminHTML(subscribers, stats) {
  const subscriberRows = subscribers.map(subscriber => {
    const statusBadge = getStatusBadge(subscriber);
    const actionButton = subscriber.subscribed ? 
      `<button onclick="deleteSubscriber('${subscriber.email}')" class="delete-btn">Delete</button>` :
      '<span class="inactive">Unsubscribed</span>';

    return `
      <tr>
        <td>${subscriber.email}</td>
        <td>${statusBadge}</td>
        <td>${formatDate(subscriber.subscribedAt)}</td>
        <td>${subscriber.verifiedAt ? formatDate(subscriber.verifiedAt) : '-'}</td>
        <td>${subscriber.unsubscribedAt ? formatDate(subscriber.unsubscribedAt) : '-'}</td>
        <td>${actionButton}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Subscribers Admin - Adam's Blog</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0a0a1a;
      color: #e0e0e0;
      margin: 0;
      padding: 1rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #00f2ff;
      text-align: center;
      margin-bottom: 2rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: rgba(0, 242, 255, 0.05);
      border: 1px solid #334;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #00f2ff;
    }
    .stat-label {
      color: #888;
      font-size: 0.9rem;
    }
    .actions {
      margin-bottom: 1rem;
      text-align: center;
    }
    .export-btn {
      background: #1a1a2e;
      color: #e0e0e0;
      border: 1px solid #334;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-block;
      margin: 0 0.5rem;
    }
    .export-btn:hover {
      background: rgba(0, 242, 255, 0.1);
      border-color: #00f2ff;
      color: #00f2ff;
    }
    .subscribers-table {
      background: rgba(0, 242, 255, 0.05);
      border: 1px solid #334;
      border-radius: 8px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #334;
    }
    th {
      background: #1a1a2e;
      color: #00f2ff;
      font-weight: bold;
    }
    tr:hover {
      background: rgba(0, 242, 255, 0.02);
    }
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .status-active {
      background: rgba(0, 242, 255, 0.2);
      color: #00f2ff;
    }
    .status-unverified {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }
    .status-unsubscribed {
      background: rgba(255, 100, 100, 0.2);
      color: #ff6464;
    }
    .delete-btn {
      background: rgba(255, 100, 100, 0.2);
      color: #ff6464;
      border: 1px solid #ff6464;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .delete-btn:hover {
      background: rgba(255, 100, 100, 0.3);
    }
    .inactive {
      color: #888;
      font-style: italic;
    }
    .back-link {
      text-align: center;
      margin-top: 2rem;
    }
    .back-link a {
      color: #888;
      text-decoration: none;
    }
    .back-link a:hover {
      color: #00f2ff;
    }
    @media (max-width: 768px) {
      table {
        font-size: 0.8rem;
      }
      th, td {
        padding: 0.5rem 0.25rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Email Subscribers Dashboard</h1>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">Total Subscribers</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.active}</div>
        <div class="stat-label">Active Subscribers</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.unverified}</div>
        <div class="stat-label">Unverified</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.unsubscribed}</div>
        <div class="stat-label">Unsubscribed</div>
      </div>
    </div>

    <div class="actions">
      <a href="/admin/subscribers?action=export&authenticated=true" class="export-btn">📊 Export CSV</a>
      <a href="/admin/newsletter?authenticated=true" class="export-btn">📬 Send Newsletter</a>
      <button onclick="location.reload()" class="export-btn">🔄 Refresh</button>
    </div>

    <div class="subscribers-table">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Subscribed</th>
            <th>Verified</th>
            <th>Unsubscribed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${subscriberRows || '<tr><td colspan="6" style="text-align: center; color: #888;">No subscribers found</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="back-link">
      <a href="/">← Back to Blog</a>
    </div>
  </div>

  <script>
    function deleteSubscriber(email) {
      if (confirm('Are you sure you want to delete the subscription for ' + email + '?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = '<input type="hidden" name="email" value="' + email + '">';
        document.body.appendChild(form);
        form.submit();
      }
    }
  </script>
</body>
</html>
  `;
}

function getStatusBadge(subscriber) {
  if (!subscriber.subscribed) {
    return '<span class="status-badge status-unsubscribed">Unsubscribed</span>';
  } else if (!subscriber.verified) {
    return '<span class="status-badge status-unverified">Unverified</span>';
  } else {
    return '<span class="status-badge status-active">Active</span>';
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function generateNoKVPage() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KV Not Available - Admin Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0a0a1a;
      color: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .error-container {
      background: rgba(255, 100, 100, 0.05);
      border: 1px solid #ff6464;
      border-radius: 8px;
      padding: 2rem;
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    h1 {
      color: #ff6464;
      margin-bottom: 1rem;
    }
    .error-content {
      margin-bottom: 2rem;
    }
    .instructions {
      background: rgba(0, 242, 255, 0.05);
      border: 1px solid #334;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: left;
    }
    .instructions h3 {
      color: #00f2ff;
      margin-top: 0;
    }
    code {
      background: #1a1a2e;
      color: #00f2ff;
      padding: 0.2rem 0.4rem;
      border-radius: 2px;
      font-family: 'Courier New', monospace;
    }
    .back-link a {
      color: #888;
      text-decoration: none;
    }
    .back-link a:hover {
      color: #00f2ff;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>⚠️ KV Storage Not Available</h1>
    <div class="error-content">
      <p>The BLOG_SUBS KV namespace is not available in this environment.</p>
      <p>This usually happens in local development when KV bindings aren't configured.</p>
    </div>
    
    <div class="instructions">
      <h3>To use the admin panel:</h3>
      <ol>
        <li>Deploy to Cloudflare Pages, or</li>
        <li>Set up local KV namespace binding in your development environment</li>
        <li>Make sure the KV namespace IDs in <code>wrangler.toml</code> are correct</li>
      </ol>
    </div>
    
    <div class="back-link">
      <a href="/">← Back to Blog</a>
    </div>
  </div>
</body>
</html>
  `;
}

async function exportSubscribers(env) {
  try {
    if (!env.BLOG_SUBS) {
      return new Response('KV storage not available', { status: 503 });
    }

    const { keys } = await env.BLOG_SUBS.list({ prefix: 'email:' });
    const subscribers = [];
    
    for (const key of keys) {
      try {
        const data = await env.BLOG_SUBS.get(key.name);
        if (data) {
          const subscriber = JSON.parse(data);
          subscriber.email = key.name.replace('email:', '');
          subscribers.push(subscriber);
        }
      } catch (e) {
        console.error('Error parsing subscriber data:', e);
      }
    }

    // Generate CSV
    const csvHeader = 'Email,Status,Subscribed,Verified,Subscribed At,Verified At,Unsubscribed At\n';
    const csvRows = subscribers.map(s => {
      const status = !s.subscribed ? 'Unsubscribed' : !s.verified ? 'Unverified' : 'Active';
      return [
        s.email,
        status,
        s.subscribed ? 'Yes' : 'No',
        s.verified ? 'Yes' : 'No',
        s.subscribedAt || '',
        s.verifiedAt || '',
        s.unsubscribedAt || ''
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;
    const filename = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting subscribers:', error);
    return new Response('Error exporting data', { status: 500 });
  }
}