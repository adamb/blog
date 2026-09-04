import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('transform.js', () => {
  it('targets the current Workers AI fast model', () => {
    const src = fs.readFileSync('functions/transform.js', 'utf8');
    expect(src).toMatch(/@cf\/meta\/llama-3\.1-8b-instruct-fast/);
    expect(src).not.toMatch(/@cf\/meta\/llama-3\.1-8b-instruct'/);
  });
});
