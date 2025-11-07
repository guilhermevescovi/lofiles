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

    // Validate query exists and is a string
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid GraphQL query' });
    }

    // Validate query length to prevent extremely large queries
    if (query.length > 50000) {
      return res.status(400).json({ error: 'GraphQL query too large (max 50KB)' });
    }

    // Validate variables if provided
    if (variables !== undefined && typeof variables !== 'object') {
      return res.status(400).json({ error: 'Invalid variables format' });
    }

    // Use token from session
    const token = req.session.githubToken!;

    // Forward request to GitHub
    const result = await githubClient.graphqlProxy(token, query, variables);

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
