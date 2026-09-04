import { describe, it, expect, vi } from 'vitest';

// Pages Function module
import { onRequestGet } from '../functions/ga.js';

describe('ga.js Pages Function', () => {
  it('returns no-op when GA_MEASUREMENT_ID is missing', async () => {
    const res = await onRequestGet({ env: {} });
    const body = await res.text();
    expect(res.headers.get('Content-Type')).toMatch(/javascript/);
    expect(body).toMatch(/GA not configured/);
    expect(body).not.toMatch(/gtag/);
  });

  it('returns no-op for invalid IDs', async () => {
    const res = await onRequestGet({ env: { GA_MEASUREMENT_ID: 'UA-12345' } });
    const body = await res.text();
    expect(body).toMatch(/GA not configured/);
  });

  it('emits gtag loader for a valid G- ID', async () => {
    const res = await onRequestGet({ env: { GA_MEASUREMENT_ID: 'G-TESTID01' } });
    const body = await res.text();
    expect(body).toMatch(/gtag\('config', "G-TESTID01"\)/);
    expect(body).toMatch(/googletagmanager\.com\/gtag\/js\?id=/);
  });
});
