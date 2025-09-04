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
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#511281', borderBottom: '1px solid rgba(76, 161, 163, 0.3)', flexShrink: 0 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My GitHub Workday
          </Typography>
          
          <IconButton color="inherit" onClick={handleRefresh} title="Refresh">
            <Refresh />
          </IconButton>
          
          {user && (
            <>
              <Avatar 
                src={user.avatarUrl} 
                alt={user.login} 
                sx={{ width: 32, height: 32, mx: 1 }} 
              />
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.name || user.login}
              </Typography>
            </>
          )}
          
          <IconButton color="inherit" onClick={logout} title="Logout">
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Dashboard Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Column 1: Triage Widget - Most Critical */}
          <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
            <Box sx={{ height: '100%' }}>
              <TriageWidget 
                prsToReview={data?.prsToReview?.nodes || []}
                mentions={[]} // We'll implement mentions later
              />
            </Box>
          </Grid>

          {/* Column 2: On My Radar Widget - Context Tracking */}
          <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%' }}>
            <Box sx={{ height: '100%' }}>
              <OnRadarWidget 
                involvedPRs={data?.involvedPRs?.nodes || []}
                currentUser={data?.viewer?.login || ''}
              />
            </Box>
          </Grid>

          {/* Column 3: In-Flight and Focus Stack */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: '60%', mb: 1.5 }}>
              <InFlightWidget 
                myOpenPRs={data?.myOpenPRs?.nodes || []}
                assignedIssues={data?.assignedIssues?.nodes || []}
              />
            </Box>
            
            <Box sx={{ height: 'calc(40% - 12px)' }}>
              <FocusWidget />
            </Box>
          </Grid>

          {/* Column 4: GIF Display - Thin right column */}
          <Grid size={{ xs: 12, lg: 2 }} sx={{ height: '100%' }}>
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start',
                paddingTop: 0
              }}
            >
              <Box 
                component="img" 
                src="/assets/dashboard-animation.gif" 
                alt="Cozy Coding Animation"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
