import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      cookies: Record<string, string | undefined>;
    }
  }
}

export type { Request };
