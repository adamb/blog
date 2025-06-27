export async function onRequestGet({ request, env }) {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Adam's Blog</title>
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
    .admin-container {
      background: rgba(0, 242, 255, 0.05);
      border: 1px solid #334;
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    h1 {
      color: #00f2ff;
      margin-bottom: 1.5rem;
    }
    .admin-menu {
      display: grid;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .admin-link {
      background: #1a1a2e;
      color: #e0e0e0;
      border: 1px solid #334;
      padding: 1rem;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.2s ease;
      display: block;
    }
    .admin-link:hover {
      background: rgba(0, 242, 255, 0.1);
      border-color: #00f2ff;
      color: #00f2ff;
      transform: translateY(-1px);
    }
    .admin-link h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    .admin-link p {
      margin: 0;
      font-size: 0.9rem;
      color: #888;
    }
    .back-link {
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
  <div class="admin-container">
    <h1>🔧 Admin Dashboard</h1>
    
    <div class="admin-menu">
      <a href="/admin/subscribers" class="admin-link">
        <h3>📧 Email Subscribers</h3>
        <p>Manage newsletter subscriptions and view subscriber analytics</p>
      </a>
      
      <a href="/functions/stats" class="admin-link">
        <h3>📊 Site Analytics</h3>
        <p>View blog traffic and post performance statistics</p>
      </a>
    </div>
    
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