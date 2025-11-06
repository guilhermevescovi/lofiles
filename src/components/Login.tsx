import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { GitHub } from '@mui/icons-material';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if redirected back from OAuth with error
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');

    if (authStatus === 'error') {
      setError('Authentication failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'success') {
      // Clean up URL and reload to trigger auth check
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);

  const handleGitHubLogin = () => {
    setLoading(true);
    setError(null);

    // Redirect to backend OAuth initiation endpoint
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <GitHub sx={{ fontSize: 60, color: '#4CA1A3' }} />

          <Typography variant="h4" component="h1" gutterBottom align="center">
            lofiles-dashboard
          </Typography>

          <Typography variant="body1" align="center" color="text.secondary">
            Your single-pane dashboard for GitHub activity.
            See what needs your attention, track your PRs, and stay focused.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GitHub />}
              onClick={handleGitHubLogin}
              color="primary"
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Sign in with GitHub'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            We only request read access to your repositories and user information.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
