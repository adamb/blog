// Email service abstraction for sending verification and newsletter emails
// Supports multiple providers and local development mocks

export class EmailService {
  constructor(env) {
    this.env = env;
    this.isDev = !env.PRODUCTION;
  }

  async sendVerificationEmail(email, verifyToken) {
    const verifyLink = `${this.getBaseUrl()}/api/verify?token=${verifyToken}&email=${encodeURIComponent(email)}`;
    
    const template = this.getVerificationTemplate(email, verifyLink);
    
    if (this.isDev) {
      console.log('Mock verification email:', template);
      return { success: true, messageId: 'mock-verification-' + Date.now() };
    }

    return await this.sendEmail(template);
  }

  async sendWelcomeEmail(email, unsubscribeToken) {
    const unsubscribeLink = `${this.getBaseUrl()}/api/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(email)}`;
    
    const template = this.getWelcomeTemplate(email, unsubscribeLink);
    
    if (this.isDev) {
      console.log('Mock welcome email:', template);
      return { success: true, messageId: 'mock-welcome-' + Date.now() };
    }

    return await this.sendEmail(template);
  }

  async sendNewsletterEmail(email, subject, content, unsubscribeToken) {
    const unsubscribeLink = `${this.getBaseUrl()}/api/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(email)}`;
    
    const template = this.getNewsletterTemplate(email, subject, content, unsubscribeLink);
    
    if (this.isDev) {
      console.log('Mock newsletter email:', template);
      return { success: true, messageId: 'mock-newsletter-' + Date.now() };
    }

    return await this.sendEmail(template);
  }

  getVerificationTemplate(email, verifyLink) {
    return {
      to: email,
      from: 'noreply@adambeguelin.com',
      subject: 'Please verify your email subscription',
      text: `
Hi there!

Thanks for subscribing to Adam's Blog. Please click the link below to verify your email address:

${verifyLink}

If you didn't subscribe to this blog, you can safely ignore this email.

Best regards,
Adam's Blog
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin: 0 0 10px 0;">Adam's Blog</h1>
    <h2 style="color: #34495e; margin: 0; font-size: 18px;">Please verify your email subscription</h2>
  </div>
  
  <p>Hi there!</p>
  
  <p>Thanks for subscribing to Adam's Blog. Please click the button below to verify your email address:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verifyLink}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
      Verify Email Address
    </a>
  </div>
  
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break: break-all; color: #666; font-size: 14px;">${verifyLink}</p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    If you didn't subscribe to this blog, you can safely ignore this email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px; text-align: center;">
    Adam's Blog • <a href="https://adambeguelin.com" style="color: #3498db;">adambeguelin.com</a>
  </p>
</body>
</html>
      `.trim()
    };
  }

  getWelcomeTemplate(email, unsubscribeLink) {
    return {
      to: email,
      from: 'adam@adambeguelin.com',
      subject: 'Welcome to Adam\'s Blog!',
      text: `
Hi there!

Welcome to Adam's Blog! Your email has been verified and you're now subscribed to receive updates.

You'll get notifications when I publish new posts about:
- Technology and software development
- Creative coding and generative art
- Travel and personal reflections
- Film and culture commentary

I try to keep posts interesting and not too frequent. Thanks for joining!

Best regards,
Adam

---
To unsubscribe: ${unsubscribeLink}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Adam's Blog</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin: 0 0 10px 0;">Adam's Blog</h1>
    <h2 style="color: #34495e; margin: 0; font-size: 18px;">Welcome aboard! 🎉</h2>
  </div>
  
  <p>Hi there!</p>
  
  <p>Welcome to Adam's Blog! Your email has been verified and you're now subscribed to receive updates.</p>
  
  <p>You'll get notifications when I publish new posts about:</p>
  <ul style="padding-left: 20px;">
    <li>Technology and software development</li>
    <li>Creative coding and generative art</li>
    <li>Travel and personal reflections</li>
    <li>Film and culture commentary</li>
  </ul>
  
  <p>I try to keep posts interesting and not too frequent. Thanks for joining!</p>
  
  <p>Best regards,<br>Adam</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px; text-align: center;">
    Adam's Blog • <a href="https://adambeguelin.com" style="color: #3498db;">adambeguelin.com</a><br>
    <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe</a>
  </p>
</body>
</html>
      `.trim()
    };
  }

  getNewsletterTemplate(email, subject, content, unsubscribeLink) {
    return {
      to: email,
      from: 'adam@adambeguelin.com',
      subject: subject,
      text: `
${content}

---
Adam's Blog
To unsubscribe: ${unsubscribeLink}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin: 0 0 10px 0;">Adam's Blog</h1>
    <h2 style="color: #34495e; margin: 0; font-size: 18px;">${subject}</h2>
  </div>
  
  <div style="margin-bottom: 30px;">
    ${content}
  </div>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px; text-align: center;">
    Adam's Blog • <a href="https://adambeguelin.com" style="color: #3498db;">adambeguelin.com</a><br>
    <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe</a>
  </p>
</body>
</html>
      `.trim()
    };
  }

  async sendEmail(template) {
    // In production, integrate with your preferred email service
    // Examples: SendGrid, Mailgun, Amazon SES, Cloudflare Email Routing
    
    if (this.env.SENDGRID_API_KEY) {
      return await this.sendWithSendGrid(template);
    }
    
    if (this.env.MAILGUN_API_KEY) {
      return await this.sendWithMailgun(template);
    }

    // Fallback to mock for development
    console.log('No email service configured, using mock');
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  async sendWithSendGrid(template) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: template.to }]
        }],
        from: { email: template.from },
        subject: template.subject,
        content: [
          { type: 'text/plain', value: template.text },
          { type: 'text/html', value: template.html }
        ]
      })
    });

    if (response.ok) {
      return { success: true, messageId: response.headers.get('X-Message-Id') };
    } else {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
  }

  async sendWithMailgun(template) {
    const domain = this.env.MAILGUN_DOMAIN;
    const formData = new FormData();
    formData.append('from', template.from);
    formData.append('to', template.to);
    formData.append('subject', template.subject);
    formData.append('text', template.text);
    formData.append('html', template.html);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.env.MAILGUN_API_KEY}`)}`
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.id };
    } else {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
  }

  getBaseUrl() {
    if (this.isDev) {
      return 'http://localhost:8788'; // Cloudflare Pages dev server
    }
    return 'https://adambeguelin.com';
  }
}

export function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}