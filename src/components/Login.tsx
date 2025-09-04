import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  Stack
} from '@mui/material';
import { GitHub } from '@mui/icons-material';
// import { getGitHubAuthURL } from '../config/github'; // Will be used for real OAuth

const Login: React.FC = () => {
  const handleGitHubLogin = () => {
    // For now, we'll simulate the OAuth flow via a single prompt with instructions
    const token = prompt(
      [
        'Use a GitHub Personal Access Token to sign in (demo mode).',
        '',
        'Required token scopes (as per README):',
        "- repo",
        "- read:user",
        "- read:org",
        "- read:discussion",
        '',
        'How to generate:',
        '- GitHub Settings > Developer settings > Personal access tokens',
        "- Create a classic token with the scopes above",
        '',
        'Paste your token below:'
      ].join('\n')
    );
    if (token) {
      localStorage.setItem('github_token', token);
      // Remove any existing user data to force a fresh fetch
      localStorage.removeItem('github_user');
      window.location.reload();
    }
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
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GitHub />}
              onClick={handleGitHubLogin}
              color="primary"
            >
              Sign in with GitHub
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
