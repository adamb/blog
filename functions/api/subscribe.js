import { EmailService, generateToken, validateEmail } from '../lib/email-service.js';

export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let email;

    // Handle both JSON and form data
    if (contentType.includes('application/json')) {
      const data = await request.json();
      email = data.email;
    } else {
      const formData = await request.formData();
      email = formData.get('email');
    }

    // Validate email
    if (!email) {
      return new Response(JSON.stringify({ 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ 
        error: 'Please enter a valid email address' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Check if already subscribed
    const existingSubscriber = await env.BLOG_SUBS.get(`email:${email}`);
    if (existingSubscriber) {
      const subscriber = JSON.parse(existingSubscriber);
      
      if (subscriber.verified) {
        return new Response(JSON.stringify({ 
          message: 'You are already subscribed!',
          alreadySubscribed: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // If not verified, we'll resend verification email
      console.log('Resending verification email for', email);
    }

    // Generate tokens
    const verifyToken = generateToken();
    const unsubscribeToken = generateToken();
    const now = new Date().toISOString();

    // Store subscriber data
    const subscriberData = {
      subscribed: true,
      verified: false,
      verifyToken: verifyToken,
      unsubscribeToken: unsubscribeToken,
      subscribedAt: now,
      verifiedAt: null,
      unsubscribedAt: null
    };

    await env.BLOG_SUBS.put(`email:${email}`, JSON.stringify(subscriberData));

    // Send verification email
    const emailService = new EmailService(env);
    try {
      const result = await emailService.sendVerificationEmail(email, verifyToken);
      
      if (result.success) {
        return new Response(JSON.stringify({
          message: 'Please check your email to verify your subscription!',
          success: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error('Failed to send verification email');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Clean up failed subscription
      await env.BLOG_SUBS.delete(`email:${email}`);
      
      return new Response(JSON.stringify({
        error: 'Failed to send verification email. Please try again later.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests for the subscription form
export async function onRequestGet({ request, env }) {
  // Return a simple subscription form for non-HTMX requests
  return new Response(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscribe to Adam's Blog</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .form-group { margin: 20px 0; }
    input[type="email"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2980b9; }
    .message { padding: 10px; margin: 10px 0; border-radius: 4px; }
    .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  </style>
</head>
<body>
  <h1>Subscribe to Adam's Blog</h1>
  <p>Get notified when I publish new posts about technology, creative coding, travel, and culture.</p>
  
  <form id="subscribe-form" action="/api/subscribe" method="post">
    <div class="form-group">
      <label for="email">Email Address:</label>
      <input type="email" id="email" name="email" required placeholder="your@email.com">
    </div>
    <button type="submit">Subscribe</button>
  </form>
  
  <div id="message"></div>
  
  <script>
    document.getElementById('subscribe-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const messageDiv = document.getElementById('message');
      
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success || data.alreadySubscribed) {
          messageDiv.innerHTML = '<div class="message success">' + data.message + '</div>';
          document.getElementById('email').value = '';
        } else {
          messageDiv.innerHTML = '<div class="message error">' + (data.error || 'An error occurred') + '</div>';
        }
      } catch (error) {
        messageDiv.innerHTML = '<div class="message error">Network error. Please try again.</div>';
      }
    });
  </script>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}