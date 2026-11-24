import { describe, expect, it } from 'bun:test';
import type { Request } from 'express';
import { isLocalDevBypassRequest } from '../../src/server/middleware/request-auth-helpers.js';

function request(input: { ip?: string; host?: string; forwardedFor?: string }): Request {
  return {
    ip: input.ip ?? '127.0.0.1',
    socket: { remoteAddress: input.ip ?? '127.0.0.1' },
    header: (name: string) => {
      if (name.toLowerCase() === 'host') return input.host ?? 'localhost:37777';
      if (name.toLowerCase() === 'x-forwarded-for') return input.forwardedFor ?? undefined;
      return undefined;
    },
  } as unknown as Request;
}

// The bypass exists for a developer on their own loopback. It must not survive
// a credential, a proxy, a non-loopback host header, or a different auth mode.
describe('isLocalDevBypassRequest', () => {
  it('allows an unauthenticated loopback request when the operator opts in', () => {
    expect(isLocalDevBypassRequest({
      req: request({}),
      hasCredential: false,
      authMode: 'local-dev',
      allowLocalDevBypass: true,
    })).toBe(true);
  });

  it('refuses whenever any condition is missing', () => {
    const base = {
      req: request({}),
      hasCredential: false,
      authMode: 'local-dev',
      allowLocalDevBypass: true,
    };

    expect(isLocalDevBypassRequest({ ...base, hasCredential: true })).toBe(false);
    expect(isLocalDevBypassRequest({ ...base, authMode: 'api-key' })).toBe(false);
    expect(isLocalDevBypassRequest({ ...base, allowLocalDevBypass: false })).toBe(false);
    expect(isLocalDevBypassRequest({ ...base, req: request({ host: 'example.com' }) })).toBe(false);
    expect(isLocalDevBypassRequest({ ...base, req: request({ forwardedFor: '203.0.113.10' }) })).toBe(false);
  });
});