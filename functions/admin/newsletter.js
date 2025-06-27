import { EmailService } from '../lib/email-service.js';

export async function onRequestGet({ request, env }) {
  return await handleNewsletterRequest({ request, env });
}

export async function onRequestPost({ request, env }) {
  return await handleNewsletterRequest({ request, env });
}

async function handleNewsletterRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    
    // Check authentication
    const authenticated = url.searchParams.get('authenticated') === 'true' || 
                         request.headers.get('Cookie')?.includes('admin_session=authenticated');

    if (!authenticated) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Handle newsletter sending
    if (request.method === 'POST') {
      const formData = await request.formData();
      const subject = formData.get('subject');
      const content = formData.get('content');
      const testEmail = formData.get('test_email');
      
      if (!subject || !content) {
        return generateNewsletterForm('Subject and content are required.');
      }

      // If test email is provided, send only to test email
      if (testEmail) {
        const emailService = new EmailService(env);
        try {
          await emailService.sendNewsletterEmail(testEmail, subject, content, 'test-token');
          return generateNewsletterForm(`Test email sent to ${testEmail}!`, 'success');
        } catch (error) {
          return generateNewsletterForm(`Failed to send test email: ${error.message}`);
        }
      }

      // Send to all verified subscribers
      return await sendToAllSubscribers(env, subject, content);
    }

    // Default: show newsletter form
    return generateNewsletterForm();

  } catch (error) {
    console.error('Newsletter error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function sendToAllSubscribers(env, subject, content) {
  try {
    if (!env.BLOG_SUBS) {
      return generateNewsletterForm('KV storage not available. This feature requires deployment to Cloudflare Pages.');
    }

    // Get all verified subscribers
    const { keys } = await env.BLOG_SUBS.list({ prefix: 'email:' });
    const verifiedSubscribers = [];
    
    for (const key of keys) {
      try {
        const data = await env.BLOG_SUBS.get(key.name);
        if (data) {
          const subscriber = JSON.parse(data);
          if (subscriber.subscribed && subscriber.verified) {
            subscriber.email = key.name.replace('email:', '');
            verifiedSubscribers.push(subscriber);
          }
        }
      } catch (e) {
        console.error('Error parsing subscriber data:', e);
      }
    }

    if (verifiedSubscribers.length === 0) {
      return generateNewsletterForm('No verified subscribers found.');
    }

    // Send emails
    const emailService = new EmailService(env);
    const results = [];
    
    for (const subscriber of verifiedSubscribers) {
      try {
        await emailService.sendNewsletterEmail(
          subscriber.email, 
          subject, 
          content, 
          subscriber.unsubscribeToken
        );
        results.push({ email: subscriber.email, success: true });
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        results.push({ email: subscriber.email, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return generateNewsletterForm(
      `Newsletter sent! ${successful} successful, ${failed} failed.`, 
      'success'
    );

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return generateNewsletterForm(`Error sending newsletter: ${error.message}`);
  }
}

function generateNewsletterForm(message = '', messageType = 'error') {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Send Newsletter - Adam's Blog Admin</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0a0a1a;
      color: #e0e0e0;
      margin: 0;
      padding: 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #00f2ff;
      text-align: center;
      margin-bottom: 2rem;
    }
    .newsletter-form {
      background: rgba(0, 242, 255, 0.05);
      border: 1px solid #334;
      border-radius: 8px;
      padding: 2rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #e0e0e0;
      font-weight: bold;
    }
    input[type="text"], input[type="email"], textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #334;
      border-radius: 4px;
      background: #1a1a2e;
      color: #e0e0e0;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #00f2ff;
      box-shadow: 0 0 5px rgba(0, 242, 255, 0.3);
    }
    textarea {
      height: 200px;
      resize: vertical;
    }
    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn {
      background: #1a1a2e;
      color: #e0e0e0;
      border: 1px solid #334;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    .btn:hover {
      background: rgba(0, 242, 255, 0.1);
      border-color: #00f2ff;
      color: #00f2ff;
    }
    .btn-primary {
      background: rgba(0, 242, 255, 0.2);
      border-color: #00f2ff;
      color: #00f2ff;
    }
    .btn-warning {
      background: rgba(255, 193, 7, 0.2);
      border-color: #ffc107;
      color: #ffc107;
    }
    .message {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
    .message.success {
      background: rgba(0, 242, 255, 0.1);
      color: #00f2ff;
      border: 1px solid #00f2ff;
    }
    .message.error {
      background: rgba(255, 100, 100, 0.1);
      color: #ff6464;
      border: 1px solid #ff6464;
    }
    .warning-box {
      background: rgba(255, 193, 7, 0.1);
      border: 1px solid #ffc107;
      color: #ffc107;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
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
  </style>
</head>
<body>
  <div class="container">
    <h1>📬 Send Newsletter</h1>
    
    ${message ? `<div class="message ${messageType}">${message}</div>` : ''}
    
    <div class="newsletter-form">
      <div class="warning-box">
        ⚠️ <strong>Warning:</strong> This will send an email to all verified subscribers. 
        Use the test email feature first to preview your newsletter.
      </div>
      
      <form method="post">
        <div class="form-group">
          <label for="subject">Subject Line:</label>
          <input type="text" id="subject" name="subject" required 
                 placeholder="e.g., New Blog Post: The Future of AI">
        </div>
        
        <div class="form-group">
          <label for="content">Newsletter Content (HTML):</label>
          <textarea id="content" name="content" required 
                    placeholder="Enter your newsletter content here. You can use HTML tags for formatting."></textarea>
        </div>
        
        <div class="form-group">
          <label for="test_email">Test Email (optional):</label>
          <input type="email" id="test_email" name="test_email" 
                 placeholder="your@email.com - Send test email instead of full newsletter">
        </div>
        
        <div class="button-group">
          <button type="submit" class="btn btn-warning">📧 Send Test Email</button>
          <button type="submit" class="btn btn-primary" 
                  onclick="return confirm('Are you sure you want to send this newsletter to all subscribers?')"
                  formnovalidate>📢 Send to All Subscribers</button>
        </div>
      </form>
    </div>
    
    <div class="back-link">
      <a href="/admin/subscribers">← Back to Subscribers</a> | 
      <a href="/admin">Admin Home</a> | 
      <a href="/">Blog Home</a>
    </div>
  </div>

  <script>
    // Auto-detect test vs full send
    document.querySelector('form').addEventListener('submit', function(e) {
      const testEmail = document.getElementById('test_email').value;
      const sendButton = e.submitter;
      
      if (testEmail && sendButton.classList.contains('btn-primary')) {
        alert('Test email detected. Sending to test email only.');
      }
    });
  </script>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}