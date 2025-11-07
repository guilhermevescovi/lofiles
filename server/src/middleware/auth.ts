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
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' https://*.githubusercontent.com https://avatars.githubusercontent.com data: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' https://api.github.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strict Transport Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
