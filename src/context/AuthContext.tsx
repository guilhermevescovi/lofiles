import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apolloClient } from '../apollo/client';
import { GET_CURRENT_USER } from '../apollo/queries';

interface User {
  login: string;
  avatarUrl: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  setUserAndToken: (user: User, token: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (token: string) => {
    try {
      const result = await apolloClient.query({
        query: GET_CURRENT_USER,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      
      const userData = {
        login: result.data.viewer.login,
        name: result.data.viewer.name || result.data.viewer.login,
        avatarUrl: result.data.viewer.avatarUrl,
      };
      
      setUser(userData);
      setToken(token);
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_user');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check if user is already logged in (token stored in localStorage)
      const storedToken = localStorage.getItem('github_token');
      const storedUser = localStorage.getItem('github_user');
      
      if (storedToken) {
        if (storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            // If stored user data is corrupted, fetch fresh data
            await fetchUserData(storedToken);
          }
        } else {
          // We have a token but no user data, fetch it
          await fetchUserData(storedToken);
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = () => {
    // This will be handled by redirecting to GitHub OAuth
    window.location.href = '/auth/github';
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  };

  const setUserAndToken = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('github_token', newToken);
    localStorage.setItem('github_user', JSON.stringify(newUser));
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    setUserAndToken,
    isAuthenticated: !!user && !!token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
