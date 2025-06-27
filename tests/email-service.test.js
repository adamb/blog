import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService, generateToken, validateEmail } from '../functions/lib/email-service.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('EmailService', () => {
  let emailService;
  let mockEnv;

  beforeEach(() => {
    mockEnv = {
      PRODUCTION: false
    };
    emailService = new EmailService(mockEnv);
    vi.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email in development mode', async () => {
      console.log = vi.fn();
      
      const result = await emailService.sendVerificationEmail('test@example.com', 'test-token');
      
      expect(result.success).toBe(true);
      expect(result.messageId).toContain('mock-verification-');
      expect(console.log).toHaveBeenCalledWith('Mock verification email:', expect.objectContaining({
        to: 'test@example.com',
        subject: 'Please verify your email subscription'
      }));
    });

    it('should use SendGrid in production with API key', async () => {
      mockEnv.PRODUCTION = true;
      mockEnv.SENDGRID_API_KEY = 'test-api-key';
      emailService = new EmailService(mockEnv);

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('mock-message-id')
        }
      });

      const result = await emailService.sendVerificationEmail('test@example.com', 'test-token');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock-message-id');
      expect(fetch).toHaveBeenCalledWith('https://api.sendgrid.com/v3/mail/send', expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json'
        }
      }));
    });

    it('should handle SendGrid errors', async () => {
      mockEnv.PRODUCTION = true;
      mockEnv.SENDGRID_API_KEY = 'test-api-key';
      emailService = new EmailService(mockEnv);

      fetch.mockResolvedValueOnce({
        ok: false,
        text: vi.fn().mockResolvedValue('SendGrid error message')
      });

      await expect(emailService.sendVerificationEmail('test@example.com', 'test-token'))
        .rejects.toThrow('SendGrid error: SendGrid error message');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with unsubscribe token', async () => {
      console.log = vi.fn();
      
      const result = await emailService.sendWelcomeEmail('test@example.com', 'unsubscribe-token');
      
      expect(result.success).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Mock welcome email:', expect.objectContaining({
        to: 'test@example.com',
        subject: 'Welcome to Adam\'s Blog!'
      }));
    });
  });

  describe('sendNewsletterEmail', () => {
    it('should send newsletter email with content and unsubscribe link', async () => {
      console.log = vi.fn();
      
      const result = await emailService.sendNewsletterEmail(
        'test@example.com', 
        'Test Newsletter', 
        '<p>Test content</p>', 
        'unsubscribe-token'
      );
      
      expect(result.success).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Mock newsletter email:', expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test Newsletter'
      }));
    });
  });

  describe('getBaseUrl', () => {
    it('should return localhost URL in development', () => {
      expect(emailService.getBaseUrl()).toBe('http://localhost:8788');
    });

    it('should return production URL in production', () => {
      mockEnv.PRODUCTION = true;
      emailService = new EmailService(mockEnv);
      expect(emailService.getBaseUrl()).toBe('https://adambeguelin.com');
    });
  });

  describe('email templates', () => {
    it('should generate verification template with correct structure', () => {
      const template = emailService.getVerificationTemplate('test@example.com', 'http://example.com/verify');
      
      expect(template.to).toBe('test@example.com');
      expect(template.from).toBe('noreply@adambeguelin.com');
      expect(template.subject).toBe('Please verify your email subscription');
      expect(template.text).toContain('http://example.com/verify');
      expect(template.html).toContain('http://example.com/verify');
      expect(template.html).toContain('Verify Email Address');
    });

    it('should generate welcome template with unsubscribe link', () => {
      const template = emailService.getWelcomeTemplate('test@example.com', 'http://example.com/unsubscribe');
      
      expect(template.to).toBe('test@example.com');
      expect(template.from).toBe('adam@adambeguelin.com');
      expect(template.subject).toBe('Welcome to Adam\'s Blog!');
      expect(template.text).toContain('http://example.com/unsubscribe');
      expect(template.html).toContain('http://example.com/unsubscribe');
    });

    it('should generate newsletter template with custom content', () => {
      const template = emailService.getNewsletterTemplate(
        'test@example.com', 
        'Custom Subject', 
        '<h2>Custom Content</h2>', 
        'http://example.com/unsubscribe'
      );
      
      expect(template.to).toBe('test@example.com');
      expect(template.from).toBe('adam@adambeguelin.com');
      expect(template.subject).toBe('Custom Subject');
      expect(template.html).toContain('<h2>Custom Content</h2>');
      expect(template.html).toContain('http://example.com/unsubscribe');
    });
  });
});

describe('generateToken', () => {
  it('should generate a 64-character hex token', () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should generate unique tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
  });
});

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('simple@domain.org')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@invalid.com')).toBe(false);
    expect(validateEmail('invalid.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('spaces @example.com')).toBe(false);
  });
});