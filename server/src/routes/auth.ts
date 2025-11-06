import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { githubClient } from '../github';

const router = Router();

/**
 * GET /auth/github
 * Initiate OAuth flow by redirecting to GitHub
 */
router.get('/github', (req: Request, res: Response) => {
  try {
    // Generate CSRF protection state token
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

    const authUrl = githubClient.getAuthorizationUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
});

/**
 * GET /auth/callback
 * Handle OAuth callback from GitHub
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    // Validate parameters
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Verify CSRF state token
    if (state !== req.session.oauthState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Clear state token
    delete req.session.oauthState;

    // Exchange code for access token
    const accessToken = await githubClient.getAccessToken(code);

    // Fetch user information
    const user = await githubClient.getUser(accessToken);

    // Store in session
    req.session.githubToken = accessToken;
    req.session.githubUser = user;

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }

      // Redirect back to frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?auth=success`);
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/?auth=error`);
  }
});

/**
 * GET /auth/status
 * Check authentication status
 */
router.get('/status', (req: Request, res: Response) => {
  if (req.session.githubToken && req.session.githubUser) {
    res.json({
      authenticated: true,
      user: req.session.githubUser,
    });
  } else {
    res.json({
      authenticated: false,
      user: null,
    });
  }
});

/**
 * POST /auth/logout
 * Clear session and log out
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

export default router;
