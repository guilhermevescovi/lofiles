import React from 'react';
import {
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Refresh, Logout } from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { GET_WORKDAY_DASHBOARD } from '../apollo/queries';
import { WorkdayDashboardData } from '../types/github';
import TriageWidget from './widgets/TriageWidget';
import InFlightWidget from './widgets/InFlightWidget';
import OnRadarWidget from './widgets/OnRadarWidget';
import FocusWidget from './widgets/FocusWidget';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  const { data, loading, error, refetch } = useQuery<WorkdayDashboardData>(GET_WORKDAY_DASHBOARD, {
    pollInterval: 300000, // Auto-refresh every 5 minutes
    errorPolicy: 'all'
  });

  const handleRefresh = () => {
    refetch();
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data. Please check your GitHub token and try again.
          <br />
          Error: {error.message}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button onClick={handleRefresh} variant="contained">
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Dashboard Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
          {/* Column 1: Triage Widget - Most Critical */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px', height: '100%' }}>
            <TriageWidget 
              prsToReview={data?.prsToReview?.nodes || []}
              mentions={[]} // We'll implement mentions later
            />
          </Box>

          {/* Column 2: On My Radar Widget - Context Tracking */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px', height: '100%' }}>
            <OnRadarWidget 
              involvedPRs={data?.involvedPRs?.nodes || []}
              currentUser={data?.viewer?.login || ''}
            />
          </Box>

          {/* Column 3: In-Flight and Focus Stack */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: '60%', mb: 1.5 }}>
              <InFlightWidget 
                myOpenPRs={data?.myOpenPRs?.nodes || []}
                assignedIssues={data?.assignedIssues?.nodes || []}
              />
            </Box>
            
            <Box sx={{ height: 'calc(40% - 12px)' }}>
              <FocusWidget />
            </Box>
          </Box>

          {/* Column 4: User Info and GIF Display */}
          <Box sx={{ 
            flex: '0 1 auto', 
            minWidth: 'fit-content',
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start'
          }}>
            {/* Container to match GIF width */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'center' }}>
              {/* GIF Display - renders first to determine width */}
              <Box 
                component="img" 
                src="/assets/dashboard-animation.gif" 
                alt="Cozy Coding Animation"
                sx={{
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  order: 2
                }}
              />
              
              {/* User Info Bar */}
              <Box 
                sx={{ 
                  backgroundColor: '#511281', 
                  border: '1px solid rgba(76, 161, 163, 0.2)',
                  borderRadius: '12px',
                  px: 1.5,
                  py: 1,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '56px',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  order: 1
                }}
              >
              <IconButton 
                size="small"
                color="inherit" 
                onClick={handleRefresh} 
                title="Refresh"
              >
                <Refresh fontSize="small" />
              </IconButton>
              
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end', mr: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      fontSize: '12px',
                      textShadow: '1px 1px 0px #4CA1A3',
                      color: '#ffffff',
                      letterSpacing: '0.5px',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {(user.name || user.login).split(' ')[0]}
                  </Typography>
                  <Avatar 
                    src={user.avatarUrl} 
                    alt={user.login} 
                    sx={{ width: 32, height: 32 }} 
                  />
                </Box>
              )}
              
              <IconButton 
                size="small"
                color="inherit" 
                onClick={logout} 
                title="Logout"
                sx={{ 
                  border: '1px solid rgba(76, 161, 163, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 161, 163, 0.1)'
                  }
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
