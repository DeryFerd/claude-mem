import { describe, expect, it } from 'bun:test';
import { hasRequiredScopes } from '../../src/server/auth/required-scopes.js';

// Both auth middlewares used to carry their own copy of this rule. The rule
// itself is small, but it is the whole of scope enforcement: empty means "any
// active key", a star means "everything", and anything else is an every().
describe('hasRequiredScopes', () => {
  it('treats an empty requirement as base auth', () => {
    expect(hasRequiredScopes([], [])).toBe(true);
    expect(hasRequiredScopes(['memories:read'], [])).toBe(true);
  });

  it('accepts the wildcard scope for any requirement', () => {
    expect(hasRequiredScopes(['*'], ['memories:write'])).toBe(true);
  });

  it('requires every listed scope', () => {
    expect(hasRequiredScopes(['memories:read', 'memories:write'], ['memories:read'])).toBe(true);
    expect(hasRequiredScopes(['memories:read'], ['memories:read', 'memories:write'])).toBe(false);
    expect(hasRequiredScopes([], ['memories:read'])).toBe(false);
  });
});