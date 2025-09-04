export const GITHUB_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/callback',
  SCOPE: 'repo read:user user:email',
  API_URL: 'https://api.github.com/graphql'
};

export const getGitHubAuthURL = () => {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.CLIENT_ID,
    redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
    scope: GITHUB_CONFIG.SCOPE,
    state: Math.random().toString(36).substring(2, 15)
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};
