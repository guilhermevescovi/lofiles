import fetch from 'node-fetch';
import { config } from './config';
import { GitHubTokenResponse, GitHubUserResponse, GitHubUser } from './types';

export class GitHubOAuthClient {
  /**
   * Generate the GitHub OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: `http://localhost:${config.server.port}/auth/callback`,
      scope: config.github.scopes.join(' '),
      state,
    });

    return `${config.github.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<string> {
    const response = await fetch(config.github.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }

    const data = await response.json() as GitHubTokenResponse;

    if (!data.access_token) {
      throw new Error('No access token in response');
    }

    return data.access_token;
  }

  /**
   * Fetch user information from GitHub
   */
  async getUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch(config.github.userApiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get user info: ${response.status} ${errorText}`);
    }

    const data = await response.json() as GitHubUserResponse;

    return {
      login: data.login,
      id: data.id,
      avatar_url: data.avatar_url,
      name: data.name || data.login,
      email: data.email || '',
    };
  }

  /**
   * Proxy a GraphQL request to GitHub
   */
  async graphqlProxy(accessToken: string, query: string, variables?: Record<string, any>): Promise<any> {
    const response = await fetch(config.github.graphqlUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GraphQL request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

export const githubClient = new GitHubOAuthClient();
