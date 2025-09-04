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
  Alert,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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

  const pendingByAuthor = React.useMemo(() => {
    const counts: Record<string, { login: string; avatarUrl?: string; count: number }> = {};
    const prs = data?.prsToReview?.nodes || [];
    prs.forEach(pr => {
      const login = pr.author?.login || 'unknown';
      const avatarUrl = pr.author?.avatarUrl;
      if (!counts[login]) {
        counts[login] = { login, avatarUrl, count: 0 };
      }
      counts[login].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [data?.prsToReview?.nodes]);

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
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4), 
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

              {/* Pending Reviews Ranking */}
              <Paper elevation={0} sx={{ mt: 2, width: '100%', order: 3, backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4), border: '1px solid rgba(76, 161, 163, 0.2)', borderRadius: '12px', boxShadow: 'none' }}>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Who disturbs my peace
                  </Typography>
                  {pendingByAuthor.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No pending review requests.
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {pendingByAuthor.map(({ login, avatarUrl, count }, index) => (
                        <React.Fragment key={login}>
                          <ListItem sx={{ py: 0.5 }}>
                            <ListItemAvatar>
                              <Avatar src={avatarUrl} alt={login} sx={{ width: 28, height: 28 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ mr: 2 }}>
                                    {login}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {count}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < pendingByAuthor.length - 1 && <Divider component="li" sx={{ opacity: 0.2 }} />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
