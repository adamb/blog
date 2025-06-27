// Vitest setup file
import { vi } from 'vitest';

// Mock global crypto API for token generation
global.crypto = {
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  })
};

// Mock Request and Response constructors for Cloudflare Workers environment
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map();
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
    
    this.body = options.body;
  }
  
  get(key) {
    return this.headers.get(key.toLowerCase());
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async formData() {
    if (this.body instanceof FormData) {
      return this.body;
    }
    throw new Error('Body is not FormData');
  }
};

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map();
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }
  
  get(key) {
    return this.headers.get(key.toLowerCase());
  }
  
  async text() {
    return this.body;
  }
  
  async json() {
    return JSON.parse(this.body);
  }
};

global.FormData = class MockFormData {
  constructor() {
    this.data = new Map();
  }
  
  append(key, value) {
    this.data.set(key, value);
  }
  
  get(key) {
    return this.data.get(key);
  }
};

global.URL = class MockURL {
  constructor(url) {
    const parts = url.split('?');
    this.pathname = parts[0];
    this.searchParams = new URLSearchParams(parts[1] || '');
  }
};