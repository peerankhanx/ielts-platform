import { randomBytes, createHash } from 'crypto';

/**
 * Generates opaque, cryptographically random tokens (refresh tokens, email
 * verification, password reset). Only the SHA-256 hash is ever persisted —
 * the raw token is shown to the user exactly once and can't be recovered
 * from the database.
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
