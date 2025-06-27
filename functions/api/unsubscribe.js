export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    // Validate parameters
    if (!token || !email) {
      return new Response(generateErrorPage('Invalid unsubscribe link. Missing token or email.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Get subscriber data
    const subscriberData = await env.BLOG_SUBS.get(`email:${normalizedEmail}`);
    if (!subscriberData) {
      return new Response(generateNotFoundPage('Subscription not found. You may have already unsubscribed.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const subscriber = JSON.parse(subscriberData);

    // Check if already unsubscribed
    if (!subscriber.subscribed) {
      return new Response(generateSuccessPage('You have already unsubscribed from Adam\'s Blog.', true), {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Verify unsubscribe token
    if (subscriber.unsubscribeToken !== token) {
      return new Response(generateErrorPage('Invalid unsubscribe token. Please use the link from your email.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Mark as unsubscribed
    subscriber.subscribed = false;
    subscriber.unsubscribedAt = new Date().toISOString();

    await env.BLOG_SUBS.put(`email:${normalizedEmail}`, JSON.stringify(subscriber));

    return new Response(generateSuccessPage('You have been successfully unsubscribed from Adam\'s Blog.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(generateErrorPage('An unexpected error occurred. Please try again or contact support.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Also handle POST requests for API compatibility
export async function onRequestPost({ request, env }) {
  return await onRequestGet({ request, env });
}

function generateSuccessPage(message, alreadyUnsubscribed = false) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - Adam's Blog</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 600px; 
      margin: 50px auto; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    .success-icon {
      font-size: 48px;
      color: #f39c12;
      margin-bottom: 20px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .message {
      color: #34495e;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px;
    }
    .button:hover {
      background: #2980b9;
    }
    .button.secondary {
      background: #95a5a6;
    }
    .button.secondary:hover {
      background: #7f8c8d;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      color: #7f8c8d;
      font-size: 14px;
    }
    .resubscribe-info {
      background: #e8f6ff;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
      color: #2c3e50;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">📤</div>
    <h1>${alreadyUnsubscribed ? 'Already Unsubscribed' : 'Unsubscribed Successfully'}</h1>
    <div class="message">
      ${message}
    </div>
    
    ${alreadyUnsubscribed ? '' : `
    <div class="resubscribe-info">
      <strong>Changed your mind?</strong><br>
      You can resubscribe anytime using the subscription form on the blog.
    </div>
    `}
    
    <a href="/" class="button">Visit Blog</a>
    ${alreadyUnsubscribed ? '' : '<a href="/api/subscribe" class="button secondary">Resubscribe</a>'}
    
    <div class="footer">
      <p>Sorry to see you go! 👋</p>
      <p>You will no longer receive email notifications from Adam's Blog.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateErrorPage(message) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe Error - Adam's Blog</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 600px; 
      margin: 50px auto; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    .error-icon {
      font-size: 48px;
      color: #e74c3c;
      margin-bottom: 20px;
    }
    h1 {
      color: #c0392b;
      margin-bottom: 20px;
    }
    .message {
      color: #34495e;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px;
    }
    .button:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">❌</div>
    <h1>Unsubscribe Failed</h1>
    <div class="message">
      ${message}
    </div>
    <a href="/" class="button">Visit Blog</a>
  </div>
</body>
</html>
  `;
}

function generateNotFoundPage(message) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Not Found - Adam's Blog</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 600px; 
      margin: 50px auto; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    .info-icon {
      font-size: 48px;
      color: #f39c12;
      margin-bottom: 20px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .message {
      color: #34495e;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px;
    }
    .button:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="info-icon">🔍</div>
    <h1>Subscription Not Found</h1>
    <div class="message">
      ${message}
    </div>
    <a href="/" class="button">Visit Blog</a>
  </div>
</body>
</html>
  `;
}