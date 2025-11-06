import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { githubClient } from '../github';

const router = Router();

/**
 * POST /graphql
 * Proxy GraphQL requests to GitHub API
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { query, variables } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing GraphQL query' });
    }

    // Use token from session
    const token = req.session.githubToken!;
    console.log('GraphQL proxy - Token exists:', !!token);
    console.log('GraphQL proxy - User:', req.session.githubUser?.login);

    // Forward request to GitHub
    const result = await githubClient.graphqlProxy(token, query, variables);
    console.log('GraphQL proxy - Result received:', !!result);

    res.json(result);
  } catch (error) {
    console.error('GraphQL proxy error:', error);

    if (error instanceof Error) {
      res.status(500).json({
        error: 'GraphQL request failed',
        message: error.message,
      });
    } else {
      res.status(500).json({
        error: 'GraphQL request failed',
        message: 'Unknown error',
      });
    }
  }
});

export default router;
