import { describe, it, expect, beforeEach, vi } from 'vitest';
import { onRequestGet, onRequestPost } from '../functions/api/unsubscribe.js';

describe('Unsubscribe API', () => {
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
    it('should unsubscribe user successfully', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'valid-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Unsubscribed Successfully');
      expect(html).toContain('successfully unsubscribed');
      
      // Verify the subscriber was updated
      expect(mockKV.put).toHaveBeenCalledWith(
        'email:test@example.com',
        expect.stringContaining('"subscribed":false')
      );
    });

    it('should handle missing token parameter', async () => {
      const request = new Request('http://localhost/api/unsubscribe?email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(400);
      expect(html).toContain('Unsubscribe Failed');
      expect(html).toContain('Missing token or email');
    });

    it('should handle missing email parameter', async () => {
      const request = new Request('http://localhost/api/unsubscribe?token=test-token');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(400);
      expect(html).toContain('Unsubscribe Failed');
      expect(html).toContain('Missing token or email');
    });

    it('should handle subscriber not found', async () => {
      mockKV.get.mockResolvedValue(null);

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(404);
      expect(html).toContain('Subscription Not Found');
      expect(html).toContain('may have already unsubscribed');
    });

    it('should handle already unsubscribed user', async () => {
      const subscriberData = JSON.stringify({
        subscribed: false,
        verified: true,
        unsubscribeToken: 'valid-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z',
        unsubscribedAt: '2023-01-01T00:02:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Already Unsubscribed');
      expect(html).toContain('already unsubscribed');
      expect(html).not.toContain('Resubscribe'); // Should not show resubscribe option
    });

    it('should handle invalid unsubscribe token', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'correct-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);

      const request = new Request('http://localhost/api/unsubscribe?token=wrong-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(400);
      expect(html).toContain('Unsubscribe Failed');
      expect(html).toContain('Invalid unsubscribe token');
    });

    it('should normalize email addresses', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'valid-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=TEST%40EXAMPLE.COM');
      const response = await onRequestGet({ request, env: mockEnv });

      expect(response.status).toBe(200);
      expect(mockKV.get).toHaveBeenCalledWith('email:test@example.com');
    });

    it('should handle unexpected errors', async () => {
      mockKV.get.mockRejectedValue(new Error('KV error'));
      console.error = vi.fn();

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(500);
      expect(html).toContain('Unsubscribe Failed');
      expect(html).toContain('unexpected error occurred');
      expect(console.error).toHaveBeenCalled();
    });

    it('should set unsubscribedAt timestamp', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'valid-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com');
      await onRequestGet({ request, env: mockEnv });

      // Check that the stored data includes unsubscribedAt timestamp
      const savedData = JSON.parse(mockKV.put.mock.calls[0][1]);
      expect(savedData.subscribed).toBe(false);
      expect(savedData.unsubscribedAt).toBeDefined();
      expect(new Date(savedData.unsubscribedAt)).toBeInstanceOf(Date);
    });

    it('should show resubscribe option for fresh unsubscribes', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'valid-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com');
      const response = await onRequestGet({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Resubscribe');
      expect(html).toContain('Changed your mind?');
    });
  });

  describe('onRequestPost', () => {
    it('should delegate to GET handler', async () => {
      const subscriberData = JSON.stringify({
        subscribed: true,
        verified: true,
        unsubscribeToken: 'valid-token',
        subscribedAt: '2023-01-01T00:00:00.000Z',
        verifiedAt: '2023-01-01T00:01:00.000Z'
      });

      mockKV.get.mockResolvedValue(subscriberData);
      mockKV.put.mockResolvedValue();

      const request = new Request('http://localhost/api/unsubscribe?token=valid-token&email=test@example.com', {
        method: 'POST'
      });
      const response = await onRequestPost({ request, env: mockEnv });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Unsubscribed Successfully');
    });
  });
});