// SPDX-License-Identifier: Apache-2.0
//
// The one scope check both API-key backends use. An empty requirement means
// "any active key" (base auth), a star grant means everything, and otherwise
// every required scope must be present.

export function hasRequiredScopes(grantedScopes: string[], requiredScopes: string[]): boolean {
  if (requiredScopes.length === 0 || grantedScopes.includes('*')) {
    return true;
  }
  return requiredScopes.every(scope => grantedScopes.includes(scope));
}