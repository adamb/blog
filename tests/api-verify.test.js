import { describe, it, expect, beforeEach, vi } from 'vitest';
import { onRequestGet } from '../functions/api/verify.js';

// Mock the email service
vi.mock('../functions/lib/email-service.js', () => ({
  EmailService: class MockEmailService {
    constructor() {}
    async sendWelcomeEmail() {
      return { success: true, messageId: 'mock-welcome-id' };
    }
  }
}));

describe('Verify API', () => {
  let mockEnv;
  let mockKV;

  beforeEach(() => {
    mockKV = {
      get: vi.fn(),
      put: vi.fn()
    };
    
    mockEnv = {
      BLOG_SUBS: mockKV
    };
  });

  describe('onRequestGet', () => {
    it('should verify email successfully', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: false,
        verifyToken: 'valid-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/verify?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Email Verified!');
      expect(html).toContain('Welcome to Adam\'s Blog');
      
      // Verify the subscriber was updated
      expect(mockKV.put).toHaveBeenCalledWith(
        'email:test@example.com',
        expect.stringContaining('"verified":true')
      );
    });

    it('should handle missing token parameter', async () => {
      const request = new Request('http://localhost/api/verify?email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(400);
      expect(html).toContain('Verification Failed');
      expect(html).toContain('Missing token or email');
    });

    it('should handle missing email parameter', async () => {
      const request = new Request('http://localhost/api/verify?token=test-token');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(400);
      expect(html).toContain('Verification Failed');
      expect(html).toContain('Missing token or email');
    });

    it('should handle subscriber not found', async () => {
      mockKV.get.mockResolvedValue(null);

      const request = new Request('http://localhost/api/verify?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(404);
      expect(html).toContain('Verification Failed');
      expect(html).toContain('Subscription not found');
    });

    it('should handle already verified subscriber', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);

      const request = new Request('http://localhost/api/verify?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Already Verified');
      expect(html).toContain('already verified');
    });

    it('should handle invalid verification token', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: false,
        verifyToken: 'correct-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);

      const request = new Request('http://localhost/api/verify?token=wrong-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(400);
      expect(html).toContain('Verification Failed');
      expect(html).toContain('Invalid verification token');
    });

    it('should normalize email addresses', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: false,
        verifyToken: 'valid-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/verify?token=valid-token&email=TEST%40EXAMPLE.COM');
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.status).toBe(200);
      expect(mockKV.get).toHaveBeenCalledWith('email:test@example.com');
    });

    it('should handle welcome email sending failure gracefully', async () => {
      // Mock email service to fail
      vi.doMock('../functions/lib/email-service.js', () => ({
        EmailService: class MockEmailService {
          async sendWelcomeEmail() {
            throw new Error('Welcome email failed');
          }
        }
      }));

      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: false,
        verifyToken: 'valid-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      console.error = vi.fn(); // Mock console.error

      const request = new Request('http://localhost/api/verify?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      // Verification should still succeed even if welcome email fails
      expect(response.status).toBe(200);
      expect(html).toContain('Email Verified!');
      expect(console.error).toHaveBeenCalledWith('Failed to send welcome email:', expect.any(Error));
    });

    it('should handle unexpected errors', async () => {
      mockKV.get.mockRejectedValue(new Error('KV error'));
      console.error = vi.fn();

      const request = new Request('http://localhost/api/verify?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(500);
      expect(html).toContain('Verification Failed');
      expect(html).toContain('unexpected error occurred');
      expect(console.error).toHaveBeenCalled();
    });

    it('should remove verification token after successful verification', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: false,
        verifyToken: 'valid-token',
        unsubscribeToken: 'unsub-token',
        subscribedAt: '2023-01-01T00:00:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/verify?token=valid-token&email=test@example.com');
      await onRequestGet({ request, env: mockEnv });

      // Check that the stored data no longer includes verifyToken
      const savedData = JSON.parse(mockKV.put.mock.calls[0][1]);
      expect(savedData.verified).toBe(true);
      expect(savedData.verifiedAt).toBeDefined();
      expect(savedData.verifyToken).toBeUndefined();
      expect(savedData.unsubscribeToken).toBe('unsub-token'); // Should still exist
    });
  });
});