import React from 'react';
import {
  Typography,
  Avatar,
  IconButton,
  Box
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Dashboard Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
          {/* Column 1: Triage Widget - Most Critical */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px', height: '100%' }}>
            <TriageWidget />
          </Box>

          {/* Column 2: On My Radar Widget - Context Tracking */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px', height: '100%' }}>
            <OnRadarWidget />
          </Box>

          {/* Column 3: In-Flight and Focus Stack */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: '60%', mb: 1.5 }}>
              <InFlightWidget />
            </Box>
            
            {/* Cat Sticker between My stuff and Focus for Today */}
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

              <LofiPlayer />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
