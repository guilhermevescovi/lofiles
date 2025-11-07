import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { securityHeaders } from './middleware/auth';
import authRoutes from './routes/auth';
import graphqlRoutes from './routes/graphql';

const app = express();

// Trust proxy (important for self-hosted behind reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production' && !config.server.frontendUrl.includes('localhost'), // HTTPS only in production (but allow HTTP for localhost)
    httpOnly: true,
    maxAge: config.session.maxAge,
    sameSite: config.nodeEnv === 'production' ? 'lax' : 'lax', // Use 'lax' for OAuth redirects
  },
  name: 'lofiles.sid', // Custom cookie name
}));

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window (more reasonable for OAuth flows)
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV === 'development', // Skip rate limiting in development
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: 'Too many API requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});

// API Routes with rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/graphql', apiLimiter, graphqlRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Serve static frontend in production
if (config.nodeEnv === 'production') {
  const frontendPath = path.join(__dirname, '../build');
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for all unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.server.frontendUrl}`);
  console.log(`🔐 GitHub OAuth configured: ${!!config.github.clientId}`);
});
