import { describe, it, expect, beforeEach, vi } from 'vitest';
import { onRequestPost, onRequestGet } from '../functions/api/subscribe.js';

// Mock the email service
vi.mock('../functions/lib/email-service.js', () => ({
  EmailService: class MockEmailService {
    constructor() {}
    async sendVerificationEmail() {
      return { success: true, messageId: 'mock-id' };
    }
  },
  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  generateToken: () => 'mock-token-64-chars'
}));

describe('Subscribe API', () => {
  let mockEnv;
  let mockKV;

  beforeEach(() => {
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    
    mockEnv = {
      BLOG_SUBS: mockKV
    };
  });

  describe('onRequestPost', () => {
    it('should handle JSON requests successfully', async () => {
      mockKV.get.mockResolvedValue(null); // No existing subscriber
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('check your email');
      expect(mockKV.put).toHaveBeenCalledWith(
        'email:test@example.com',
        expect.stringContaining('"verified":false')
      );
    });

    it('should handle form data requests', async () => {
      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue();

      const formData = new FormData();
      formData.append('email', 'test@example.com');

      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        body: formData
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject requests without email', async () => {
      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
    });

    it('should reject invalid email addresses', async () => {
      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' })
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please enter a valid email address');
    });

    it('should handle already verified subscribers', async () => {
      const existingSubscriber = JSON.stringify({
        subscribed: true,
        verified: true,
        verifyToken: 'old-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(existingSubscriber);

      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alreadySubscribed).toBe(true);
      expect(data.message).toContain('already subscribed');
    });

    it('should resend verification for unverified subscribers', async () => {
      const existingSubscriber = JSON.stringify({
        subscribed: true,
        verified: false,
        verifyToken: 'old-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z'
      });

      mockKV.get.mockResolvedValue(existingSubscriber);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockKV.put).toHaveBeenCalledWith(
        'email:test@example.com',
        expect.stringContaining('"verified":false')
      );
    });

    it('should normalize email addresses', async () => {
      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '  TEST@EXAMPLE.COM  ' })
      });

      const response = await onRequestPost({ request, env: mockEnv });
      
      expect(mockKV.get).toHaveBeenCalledWith('email:test@example.com');
      expect(mockKV.put).toHaveBeenCalledWith(
        'email:test@example.com',
        expect.any(String)
      );
    });

    it('should clean up on email sending failure', async () => {
      // Mock email service to fail
      vi.doMock('../functions/lib/email-service.js', () => ({
        EmailService: class MockEmailService {
          async sendVerificationEmail() {
            throw new Error('Email sending failed');
          }
        },
        validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        generateToken: () => 'mock-token-64-chars'
      }));

      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue();
      mockKV.delete.mockResolvedValue();

      const request = new Request('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      const response = await onRequestPost({ request, env: mockEnv });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to send verification email');
      expect(mockKV.delete).toHaveBeenCalledWith('email:test@example.com');
    });
  });

  describe('onRequestGet', () => {
    it('should return subscription form HTML', async () => {
      const request = new Request('http://localhost/api/subscribe');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/html');
      expect(html).toContain('<form');
      expect(html).toContain('Subscribe to Adam\'s Blog');
      expect(html).toContain('input type="email"');
    });
  });
});