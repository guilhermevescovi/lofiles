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
    // For now, we'll simulate the OAuth flow
    // In a real app, you'd need a backend to handle the OAuth callback
    // const authUrl = getGitHubAuthURL(); // This would be used for real OAuth
    
    // For demonstration purposes, we'll show an alert with instructions
    alert(`
      To complete the OAuth setup:
      
      1. Create a GitHub OAuth App at https://github.com/settings/applications/new
      2. Set Authorization callback URL to: http://localhost:3000/callback  
      3. Copy the Client ID to a .env file as REACT_APP_GITHUB_CLIENT_ID
      4. For this demo, you can manually add a token:
         - Go to GitHub Settings > Developer settings > Personal access tokens
         - Generate a token with 'repo' and 'read:user' scopes
         - We'll use localStorage for this demo
    `);
    
    // For demo purposes, let's prompt for a token
    const token = prompt('Enter your GitHub Personal Access Token (for demo):');
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
            My GitHub Workday
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
