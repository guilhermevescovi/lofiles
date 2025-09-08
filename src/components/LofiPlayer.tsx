import React from 'react';
import { Box, IconButton, Slider, Typography, Paper } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Album } from '@mui/icons-material';
import { alpha, keyframes } from '@mui/material/styles';

const LOCAL_STORAGE_VOLUME_KEY = 'lofi_player_volume_v1';
const LOCAL_STORAGE_MUTED_KEY = 'lofi_player_muted_v1';

// Spinning animation for the vinyl disc
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Wavy lines animation
const wave1 = keyframes`
  0%, 100% { height: 8px; opacity: 0.4; }
  50% { height: 20px; opacity: 0.8; }
`;

const wave2 = keyframes`
  0%, 100% { height: 12px; opacity: 0.5; }
  50% { height: 24px; opacity: 0.9; }
`;

const wave3 = keyframes`
  0%, 100% { height: 6px; opacity: 0.3; }
  50% { height: 16px; opacity: 0.7; }
`;

const wave4 = keyframes`
  0%, 100% { height: 10px; opacity: 0.4; }
  50% { height: 18px; opacity: 0.8; }
`;

// Local lofi track - your downloaded Vibin track
const DEFAULT_STREAM_URL_MP3 = `${process.env.PUBLIC_URL}/audio/vibin-lofi.mp3`;
const DEFAULT_STREAM_URL_OGG = `${process.env.PUBLIC_URL}/audio/vibin-lofi.mp3`; // fallback to same MP3

// Alternative options (streaming radios):
// LoFi Cafe: 'https://cast1.lofiradio.com/lofi'
// Nightride FM: 'https://stream.nightride.fm/lofi.mp3'
// SomaFM Groove Salad: 'https://ice1.somafm.com/groovesalad-128-mp3'

const LofiPlayer: React.FC = () => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState<number>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_VOLUME_KEY);
    if (stored !== null) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) return Math.min(1, Math.max(0, parsed));
    }
    return 0.5;
  });
  const [muted, setMuted] = React.useState<boolean>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_MUTED_KEY);
    return stored === 'true';
  });

  React.useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VOLUME_KEY, String(volume));
  }, [volume]);

  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MUTED_KEY, muted ? 'true' : 'false');
  }, [muted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (_e) {
        // Autoplay may be blocked; user must interact. Ignoring error.
      }
    }
  };

  const handleMuteToggle = () => {
    setMuted((m) => !m);
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    setVolume(next);
    if (muted && next > 0) setMuted(false);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mt: 'auto', 
        mb: 0,
        width: '100%',
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4), 
        border: '1px solid rgba(76, 161, 163, 0.2)', 
        borderRadius: '12px', 
        boxShadow: 'none', 
        order: 5,
        minHeight: 120
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
        {/* Large Spinning Vinyl Disc with Wave Animation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Album 
            sx={{ 
              fontSize: 64, 
              color: (theme) => alpha(theme.palette.text.primary, 0.8),
              animation: isPlaying ? `${spin} 3s linear infinite` : 'none',
              transition: 'all 0.3s ease-in-out',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
          
          {/* Animated Wavy Lines - only show when playing */}
          {isPlaying && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                ml: 1,
                opacity: isPlaying ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              {/* Wave lines */}
              <Box 
                sx={{ 
                  width: 2, 
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.6),
                  borderRadius: '1px',
                  animation: `${wave1} 0.8s ease-in-out infinite`,
                  transformOrigin: 'center'
                }} 
              />
              <Box 
                sx={{ 
                  width: 2, 
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.7),
                  borderRadius: '1px',
                  animation: `${wave2} 1.2s ease-in-out infinite`,
                  animationDelay: '0.1s',
                  transformOrigin: 'center'
                }} 
              />
              <Box 
                sx={{ 
                  width: 2, 
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                  borderRadius: '1px',
                  animation: `${wave3} 0.6s ease-in-out infinite`,
                  animationDelay: '0.2s',
                  transformOrigin: 'center'
                }} 
              />
              <Box 
                sx={{ 
                  width: 2, 
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.8),
                  borderRadius: '1px',
                  animation: `${wave4} 1.0s ease-in-out infinite`,
                  animationDelay: '0.3s',
                  transformOrigin: 'center'
                }} 
              />
            </Box>
          )}
        </Box>
        
        {/* Content Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 80, justifyContent: 'center' }}>
                     <Typography 
             variant="h6" 
             sx={{ 
               fontFamily: '"Press Start 2P", "Courier New", monospace',
               fontSize: '12px',
               textShadow: '1px 1px 0px #4CA1A3',
               color: '#ffffff',
               letterSpacing: '0.5px',
               lineHeight: 1.2
             }}
           >
             Lofi beats
           </Typography>
           
           <Typography 
             variant="body2" 
             sx={{ 
               color: 'rgba(255, 255, 255, 0.7)',
               fontSize: '11px',
               fontStyle: 'italic',
               lineHeight: 1.2
             }}
           >
             "Vibin'" by Purrple Cat
           </Typography>
          
          {/* Controls Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="medium" onClick={togglePlay} color="inherit">
              {isPlaying ? <Pause sx={{ fontSize: 28 }} /> : <PlayArrow sx={{ fontSize: 28 }} />}
            </IconButton>
            <IconButton size="medium" onClick={handleMuteToggle} color="inherit">
              {muted ? <VolumeOff sx={{ fontSize: 24 }} /> : <VolumeUp sx={{ fontSize: 24 }} />}
            </IconButton>
          </Box>
        </Box>
        
        {/* Vertical Volume Slider */}
        <Box sx={{ height: 80, display: 'flex', alignItems: 'center', ml: 1 }}>
          <Slider
            orientation="vertical"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            sx={{ 
              height: 70,
              '& .MuiSlider-track': {
                width: 4
              },
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16
              }
            }}
            aria-label="Volume"
          />
        </Box>
        
        <audio ref={audioRef} preload="none" loop>
          <source src={DEFAULT_STREAM_URL_MP3} type="audio/mpeg" />
          <source src={DEFAULT_STREAM_URL_OGG} type="audio/ogg" />
        </audio>
      </Box>
    </Paper>
  );
};

export default LofiPlayer;


