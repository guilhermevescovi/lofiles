import dotenv from 'dotenv';
import path from 'path';

// Load .env from parent directory (repository root)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userApiUrl: 'https://api.github.com/user',
    graphqlUrl: 'https://api.github.com/graphql',
    scopes: ['repo', 'read:user', 'read:org', 'read:discussion'],
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Validation
if (!config.github.clientId && config.nodeEnv === 'production') {
  throw new Error('GITHUB_CLIENT_ID is required in production');
}

if (!config.github.clientSecret && config.nodeEnv === 'production') {
  throw new Error('GITHUB_CLIENT_SECRET is required in production');
}

if (config.session.secret === 'change-this-secret-in-production' && config.nodeEnv === 'production') {
  throw new Error('SESSION_SECRET must be set to a secure random value in production');
}
