import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  Popover,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

interface NotificationPreferences {
  enabled: boolean;
  reviewRequests: boolean;
  focusItemUpdates: boolean;
  soundEnabled: boolean;
}

interface NotificationSettingsProps {
  getPreferences: () => NotificationPreferences;
  setPreferences: (prefs: NotificationPreferences) => void;
  requestPermission: () => Promise<boolean>;
  permission: NotificationPermission;
  isSupported: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  getPreferences,
  setPreferences,
  requestPermission,
  permission,
  isSupported,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences>(getPreferences());
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setPrefs(getPreferences());
  }, [getPreferences]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setPrefs(getPreferences());
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setPreferences(newPrefs);
  };

  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await requestPermission();
    if (granted) {
      const newPrefs = { ...prefs, enabled: true };
      setPrefs(newPrefs);
      setPreferences(newPrefs);
    }
    setRequesting(false);
  };

  const open = Boolean(anchorEl);

  if (!isSupported) {
    return null; // Don't show settings if notifications aren't supported
  }

  return (
    <>
      <Tooltip title="Notification settings">
        <IconButton color="inherit" onClick={handleOpen} aria-label="Notification settings">
          {prefs.enabled ? (
            <NotificationsActiveIcon />
          ) : (
            <NotificationsOffIcon />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxWidth: '90vw', p: 2 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SettingsIcon fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Browser Notifications
          </Typography>
        </Box>

        {permission === 'denied' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Notifications are blocked. Please enable them in your browser settings.
          </Alert>
        )}

        {permission === 'default' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Get notified about new review requests and focus items
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={handleRequestPermission}
              disabled={requesting}
            >
              {requesting ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          </Alert>
        )}

        {permission === 'granted' && (
          <Stack spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.enabled}
                  onChange={() => handleToggle('enabled')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Enable notifications
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive browser notifications for updates
                  </Typography>
                </Box>
              }
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Notification Types
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={prefs.reviewRequests}
                  onChange={() => handleToggle('reviewRequests')}
                  disabled={!prefs.enabled}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" color={!prefs.enabled ? 'text.disabled' : undefined}>
                  Review requests
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={prefs.focusItemUpdates}
                  onChange={() => handleToggle('focusItemUpdates')}
                  disabled={!prefs.enabled}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" color={!prefs.enabled ? 'text.disabled' : undefined}>
                  Focus item updates
                </Typography>
              }
            />

            <Divider sx={{ my: 1 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={prefs.soundEnabled}
                  onChange={() => handleToggle('soundEnabled')}
                  disabled={!prefs.enabled}
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" color={!prefs.enabled ? 'text.disabled' : undefined}>
                    Notification sound
                  </Typography>
                  <Typography
                    variant="caption"
                    color={!prefs.enabled ? 'text.disabled' : 'text.secondary'}
                  >
                    Play sound with notifications (coming soon)
                  </Typography>
                </Box>
              }
            />
          </Stack>
        )}

        <Alert severity="info" sx={{ mt: 2 }} icon={false}>
          <Typography variant="caption">
            Notifications appear when the app detects new items while running in the background
          </Typography>
        </Alert>
      </Popover>
    </>
  );
};

export default NotificationSettings;
