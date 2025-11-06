import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.githubToken || !req.session.githubUser) {
    res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
    return;
  }
  next();
}

/**
 * Middleware to add security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // CSRF protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
