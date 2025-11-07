import React, { useState, useCallback } from 'react';
import {
  Typography,
  Avatar,
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Logout, GitHub, GraphicEq } from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useFocus } from '../context/FocusContext';
import { useBrowserNotifications } from '../hooks/useBrowserNotifications';
import ReviewRequestsWidget from './widgets/ReviewRequestsWidget';
import MyStuffWidget from './widgets/MyStuffWidget';
import OnMyRadarWidget from './widgets/OnMyRadarWidget';
import FocusForTodayWidget from './widgets/FocusForTodayWidget';
import LofiPlayer from './LofiPlayer';
import WhoBothersMeWidget from './widgets/WhoBothersMeWidget';
import { GET_PRS_TO_REVIEW } from '../apollo/queries';
import type { PullRequest } from '../types/github';
import NotificationHighlightsDropdown from './NotificationHighlightsDropdown';

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
  const { themeName, toggleTheme } = useThemeMode();
  const isLofiTheme = themeName === 'lofi';
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const { data: prsData, loading: prsLoading, error: prsError, refetch: refetchPrs } = useQuery(GET_PRS_TO_REVIEW, {
    pollInterval: 300000,
    fetchPolicy: 'cache-and-network'
  });
  const prsToReview = (prsData?.prsToReview?.nodes as PullRequest[]) ?? [];
  const [isManualRefreshingPrs, setIsManualRefreshingPrs] = useState(false);
  const { focusItems } = useFocus();

  // Browser notifications
  const {
    requestPermission,
    getPreferences,
    setPreferences,
    isSupported,
    permission,
  } = useBrowserNotifications(prsToReview, focusItems);

  const handleRefreshPrs = useCallback(async () => {
    setIsManualRefreshingPrs(true);
    try {
      await refetchPrs();
    } finally {
      setIsManualRefreshingPrs(false);
    }
  }, [refetchPrs]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Dashboard Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
          {/* Column 1: Review Requests - Most Critical */}
          <Box sx={{ flex: '1 1 0', minWidth: '320px', height: '100%' }}>
            <ReviewRequestsWidget 
              selectedAuthor={selectedAuthor}
              onClearFilter={() => setSelectedAuthor(null)}
              prs={prsToReview}
              loading={prsLoading}
              errorMessage={prsError?.message}
              onRefresh={handleRefreshPrs}
              isRefreshing={isManualRefreshingPrs}
            />
          </Box>

          {/* Column 2: On My Radar - Context Tracking */}
          <Box sx={{ flex: '1 1 0', minWidth: '320px', height: '100%' }}>
            <OnMyRadarWidget />
          </Box>

          {/* Column 3: My Stuff and Focus Stack */}
          <Box sx={{ flex: '1 1 0', minWidth: '340px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: '60%', mb: 1.5 }}>
              <MyStuffWidget />
            </Box>
            
            {/* Cat Sticker between My stuff and Focus for Today */}
            {isLofiTheme && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box 
                  component="img" 
                  src={`${process.env.PUBLIC_URL}/assets/cat-sticker.gif`} 
                  alt="Cat Sticker"
                  sx={{
                    height: 'auto',
                    maxHeight: '50px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            )}
            
            <Box sx={{ height: 'calc(40% - 12px)' }}>
              <FocusForTodayWidget />
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
              {isLofiTheme && (
                <Box 
                  component="img" 
                  src={`${process.env.PUBLIC_URL}/assets/dashboard-animation.gif`} 
                  alt="Cozy Coding Animation"
                  sx={{
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    order: 2
                  }}
                />
              )}
              
              {/* Pixel title above user card */}
              <Box sx={{ alignSelf: 'flex-end', order: 0, mb: 1, width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: isLofiTheme ? '"Press Start 2P", "Courier New", monospace' : undefined,
                    fontSize: '28px',
                    textShadow: isLofiTheme ? '3px 3px 0px #4CA1A3' : 'none',
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    position: 'relative',
                    display: 'inline-block',
                    animation: isLofiTheme ? `${glitchMain} 2.2s infinite` : 'none',
                    ...(isLofiTheme
                      ? {
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
                        }
                      : {})
                  }}
                >
                  Lo-files
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto' }}>
                  <Tooltip title={isLofiTheme ? 'Switch to GitHub Dark theme' : 'Switch to Lo-fi vibe theme'}>
                    <IconButton
                      color="inherit"
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.divider,
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6)
                      }}
                    >
                      {isLofiTheme ? <GitHub fontSize="small" /> : <GraphicEq fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <NotificationHighlightsDropdown
                    reviewRequests={prsToReview}
                    focusItems={focusItems}
                    loading={prsLoading || isManualRefreshingPrs}
                    onRefresh={handleRefreshPrs}
                    getPreferences={getPreferences}
                    setPreferences={setPreferences}
                    requestPermission={requestPermission}
                    permission={permission}
                    isSupported={isSupported}
                  />
                </Box>
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
                      fontFamily: isLofiTheme ? '"Press Start 2P", "Courier New", monospace' : undefined,
                      fontSize: '12px',
                      textShadow: isLofiTheme ? '1px 1px 0px #4CA1A3' : 'none',
                      color: '#ffffff',
                      letterSpacing: '0.5px',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.login}
                  </Typography>
                  <Avatar
                    src={user.avatar_url}
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

              <WhoBothersMeWidget 
                selectedAuthor={selectedAuthor}
                onSelectAuthor={(author: string) => {
                  setSelectedAuthor((current) => (current === author ? null : author));
                }}
                onClearFilter={() => setSelectedAuthor(null)}
                prs={prsToReview}
                loading={prsLoading}
                errorMessage={prsError?.message}
                onRefresh={handleRefreshPrs}
                isRefreshing={isManualRefreshingPrs}
              />

              {isLofiTheme && <LofiPlayer />}
            </Box>
          </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
