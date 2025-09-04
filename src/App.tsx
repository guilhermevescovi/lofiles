import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import { apolloClient } from './apollo/client';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#21094E', // Main background
      paper: '#511281',   // Card/widget backgrounds
    },
    primary: {
      main: '#4CA1A3',    // Accent secondary (teal)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#A5E1AD',    // Accent highlights (light green)
      contrastText: '#21094E',
    },
    info: {
      main: '#4CA1A3',    // Teal for info elements
    },
    success: {
      main: '#A5E1AD',    // Light green for success
      contrastText: '#21094E',
    },
    warning: {
      main: '#FFB366',    // Warm orange for warnings
    },
    error: {
      main: '#FF6B6B',    // Soft red for errors
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgba(76, 161, 163, 0.2)', // Subtle teal border
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
            color: '#4CA1A3',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#4CA1A3',
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

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#4CA1A3',
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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <FocusProvider>
            <AppContent />
          </FocusProvider>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
