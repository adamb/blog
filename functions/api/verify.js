import { EmailService } from '../lib/email-service.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    // Validate parameters
    if (!token || !email) {
      return new Response(generateErrorPage('Invalid verification link. Missing token or email.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Get subscriber data
    const subscriberData = await env.BLOG_SUBS.get(`email:${normalizedEmail}`);
    if (!subscriberData) {
      return new Response(generateErrorPage('Subscription not found. You may need to subscribe again.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const subscriber = JSON.parse(subscriberData);

    // Check if already verified
    if (subscriber.verified) {
      return new Response(generateSuccessPage('Your email is already verified! You\'re all set to receive updates.', true), {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Verify token
    if (subscriber.verifyToken !== token) {
      return new Response(generateErrorPage('Invalid verification token. Please check your email for the correct link.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Mark as verified
    subscriber.verified = true;
    subscriber.verifiedAt = new Date().toISOString();
    // Clear the verification token as it's no longer needed
    delete subscriber.verifyToken;

    await env.BLOG_SUBS.put(`email:${normalizedEmail}`, JSON.stringify(subscriber));

    // Send welcome email
    try {
      const emailService = new EmailService(env);
      await emailService.sendWelcomeEmail(normalizedEmail, subscriber.unsubscribeToken);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    return new Response(generateSuccessPage('Email verified successfully! Welcome to Adam\'s Blog. You should receive a welcome email shortly.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(generateErrorPage('An unexpected error occurred during verification. Please try again or contact support.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function generateSuccessPage(message, alreadyVerified = false) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verified - Adam's Blog</title>
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
      color: #27ae60;
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
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      color: #7f8c8d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>${alreadyVerified ? 'Already Verified' : 'Email Verified!'}</h1>
    <div class="message">
      ${message}
    </div>
    <a href="/" class="button">Visit Blog</a>
    <a href="/about" class="button">About Adam</a>
    <div class="footer">
      <p>Thanks for subscribing to Adam's Blog!</p>
      <p>You'll receive notifications when new posts are published.</p>
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
  <title>Verification Error - Adam's Blog</title>
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
    .button.secondary {
      background: #95a5a6;
    }
    .button.secondary:hover {
      background: #7f8c8d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">❌</div>
    <h1>Verification Failed</h1>
    <div class="message">
      ${message}
    </div>
    <a href="/api/subscribe" class="button">Subscribe Again</a>
    <a href="/" class="button secondary">Visit Blog</a>
  </div>
</body>
</html>
  `;
}