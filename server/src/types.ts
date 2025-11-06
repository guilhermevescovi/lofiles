import 'express-session';

declare module 'express-session' {
  interface SessionData {
    githubToken?: string;
    githubUser?: {
      login: string;
      id: number;
      avatar_url: string;
      name: string;
      email: string;
    };
    oauthState?: string;
  }
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubUserResponse {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}
