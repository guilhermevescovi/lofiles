import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import { ThemeModeProvider, useThemeMode, ThemeName } from './context/ThemeContext';
import { apolloClient } from './apollo/client';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';

const lofiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#21094E',
      paper: '#511281',
    },
    primary: {
      main: '#D4FF3E',
      contrastText: '#21094E',
    },
    secondary: {
      main: '#A5E1AD',
      contrastText: '#21094E',
    },
    info: {
      main: '#D4FF3E',
    },
    success: {
      main: '#A5E1AD',
      contrastText: '#21094E',
    },
    warning: {
      main: '#FFB366',
    },
    error: {
      main: '#FF6B6B',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h6: {
      fontWeight: 600,
      color: '#ffffff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#21094E',
          backgroundImage: 'none',
          color: '#ffffff',
        },
        '#root': {
          backgroundColor: '#21094E',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgba(212, 255, 62, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderRadius: 8,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: '#D4FF3E',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#D4FF3E',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(76, 161, 163, 0.1)',
          },
        },
      },
    },
  },
});

const githubDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    primary: {
      main: '#D4FF3E',
      contrastText: '#0d1117',
    },
    secondary: {
      main: '#D4FF3E',
      contrastText: '#0d1117',
    },
    info: {
      main: '#D4FF3E',
    },
    success: {
      main: '#3fb950',
      contrastText: '#0d1117',
    },
    warning: {
      main: '#d29922',
    },
    error: {
      main: '#f85149',
    },
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e',
    },
    divider: '#30363d',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h6: {
      fontWeight: 600,
      color: '#c9d1d9',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d1117',
          backgroundImage: 'none',
          color: '#c9d1d9',
        },
        '#root': {
          backgroundColor: '#0d1117',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid #30363d',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderRadius: 8,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#8b949e',
          '&.Mui-selected': {
            color: '#D4FF3E',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#D4FF3E',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #30363d',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(212, 255, 62, 0.08)',
          },
        },
      },
    },
  },
});

const themeMap: Record<ThemeName, Theme> = {
  lofi: lofiTheme,
  githubDark: githubDarkTheme,
};

const ThemeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeName } = useThemeMode();
  const theme = themeMap[themeName];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#D4FF3E',
        fontSize: '18px',
        fontWeight: 500
      }}>
        Loading your GitHub dashboard...
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
};

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeModeProvider>
        <ThemeBridge>
          <AuthProvider>
            <FocusProvider>
              <AppContent />
            </FocusProvider>
          </AuthProvider>
        </ThemeBridge>
      </ThemeModeProvider>
    </ApolloProvider>
  );
}

export default App;
