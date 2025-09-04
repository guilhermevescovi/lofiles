import React, { useState } from 'react';
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
import { keyframes } from '@mui/system';
import { Refresh, Logout } from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { GET_WORKDAY_DASHBOARD } from '../apollo/queries';
import { WorkdayDashboardData } from '../types/github';
import TriageWidget from './widgets/TriageWidget';
import InFlightWidget from './widgets/InFlightWidget';
import OnRadarWidget from './widgets/OnRadarWidget';
import FocusWidget from './widgets/FocusWidget';
import LofiPlayer from './LofiPlayer';

// Glitch keyframes for the Lo-files title
const glitchMain = keyframes`
  0% { transform: none; color: #ffffff; }
  2% { transform: translate(1px, -1px) skew(0.2deg); color: #ff69b4; }
  4% { transform: translate(-1px, 1px) skew(-0.2deg); color: #ffffff; }
  6% { transform: none; color: #ff69b4; }
  8% { transform: translate(1px, 0); color: #ffffff; }
  10% { transform: none; color: #ff69b4; }
  12% { transform: translate(-1px, 0); color: #ffffff; }
  14% { transform: none; color: #ff69b4; }
  16% { transform: none; color: #ffffff; }
  100% { transform: none; color: #ffffff; }
`;

const glitchBefore = keyframes`
  0% { clip-path: inset(0 0 0 0); transform: translate(-1px, 0); opacity: 0.7; }
  5% { clip-path: inset(10% 0 85% 0); transform: translate(-2px, -1px); }
  10% { clip-path: inset(80% 0 5% 0); transform: translate(-1px, 1px); }
  15% { clip-path: inset(40% 0 40% 0); transform: translate(-3px, 0); }
  20% { clip-path: inset(0 0 0 0); transform: translate(0, 0); opacity: 0.4; }
  100% { clip-path: inset(0 0 0 0); transform: none; opacity: 0.4; }
`;

const glitchAfter = keyframes`
  0% { clip-path: inset(0 0 0 0); transform: translate(1px, 0); opacity: 0.7; }
  5% { clip-path: inset(85% 0 10% 0); transform: translate(2px, 1px); }
  10% { clip-path: inset(5% 0 80% 0); transform: translate(1px, -1px); }
  15% { clip-path: inset(40% 0 40% 0); transform: translate(3px, 0); }
  20% { clip-path: inset(0 0 0 0); transform: translate(0, 0); opacity: 0.4; }
  100% { clip-path: inset(0 0 0 0); transform: none; opacity: 0.4; }
`;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const { data, loading, error, refetch } = useQuery<WorkdayDashboardData>(GET_WORKDAY_DASHBOARD, {
    pollInterval: 300000, // Auto-refresh every 5 minutes
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network' // Always try to fetch fresh data
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
              selectedUser={selectedUser}
              onClearFilter={() => setSelectedUser(null)}
            />
          </Box>

          {/* Column 2: On My Radar Widget - Context Tracking */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px', height: '100%' }}>
            <OnRadarWidget 
              involvedPRs={data?.involvedPRs?.nodes || []}
              currentUser={data?.viewer?.login || ''}
              isLoading={loading}
              error={error}
              onRetry={handleRefresh}
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
            
            {/* Cat Sticker between My stuff and Focus for Today */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box 
                component="img" 
                src="/assets/cat-sticker.gif" 
                alt="Cat Sticker"
                sx={{
                  height: 'auto',
                  maxHeight: '50px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'center', height: '100%' }}>
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
              
              {/* Pixel title above user card */}
              <Box sx={{ alignSelf: 'flex-end', order: 0, mb: 1, width: '100%' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    fontSize: '28px',
                    textShadow: '3px 3px 0px #4CA1A3',
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    position: 'relative',
                    display: 'inline-block',
                    animation: `${glitchMain} 2.2s infinite`,
                    '&::before': {
                      content: '"Lo-files"',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      color: '#ffffff',
                      textShadow: '3px 0 rgb(204, 0, 255)',
                      animation: `${glitchBefore} 2s infinite`,
                      pointerEvents: 'none'
                    },
                    '&::after': {
                      content: '"Lo-files"',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      color: '#ffffff',
                      textShadow: '-3px 0 #00fff9',
                      animation: `${glitchAfter} 2.4s infinite`,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  Lo-files
                </Typography>
              </Box>

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
                    {user.login}
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

              {/* Arcade Score Display */}
              <Paper 
                elevation={0} 
                sx={{ 
                  mt: 2, 
                  width: '100%', 
                  order: 3, 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '2px solid #4CA1A3', 
                  borderRadius: '8px', 
                  boxShadow: 'none',
                  p: 2
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      fontSize: '10px',
                      color: '#4CA1A3',
                      letterSpacing: '1px',
                      display: 'block',
                      mb: 1
                    }}
                  >
                    REVIEW SCORE
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      fontSize: '24px',
                      color: '#00ff00',
                      textShadow: '0 0 10px #00ff00',
                      letterSpacing: '2px',
                      lineHeight: 1,
                      mb: 0.5
                    }}
                  >
                    0000000
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      fontSize: '8px',
                      color: '#4CA1A3',
                      letterSpacing: '0.5px',
                      opacity: 0.7
                    }}
                  >
                    API COMING SOON
                  </Typography>
                </Box>
              </Paper>

              {/* Pending Reviews Ranking */}
              <Paper elevation={0} sx={{ mt: 2, width: '100%', order: 4, backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4), border: '1px solid rgba(76, 161, 163, 0.2)', borderRadius: '12px', boxShadow: 'none' }}>
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
                          <ListItem 
                            sx={{ 
                              py: 0.5,
                              cursor: 'pointer',
                              '&:hover': { 
                                backgroundColor: 'rgba(76, 161, 163, 0.1)',
                                borderRadius: 1
                              }
                            }}
                            onClick={() => setSelectedUser(login)}
                          >
                            <ListItemAvatar>
                              <Avatar src={avatarUrl} alt={login} sx={{ width: 28, height: 28 }} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      mr: 2,
                                      '&:hover': { 
                                        color: '#4CA1A3'
                                      }
                                    }}
                                  >
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

              <LofiPlayer />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
