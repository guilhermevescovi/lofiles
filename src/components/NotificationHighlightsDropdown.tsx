import React from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import ListIcon from '@mui/icons-material/List';
import { PullRequest, FocusItem } from '../types/github';

interface NotificationPreferences {
  enabled: boolean;
  reviewRequests: boolean;
  focusItemUpdates: boolean;
  soundEnabled: boolean;
}

interface NotificationHighlightsDropdownProps {
  reviewRequests: PullRequest[];
  focusItems: FocusItem[];
  loading?: boolean;
  onRefresh?: () => void;
  // Browser notification props
  getPreferences?: () => NotificationPreferences;
  setPreferences?: (prefs: NotificationPreferences) => void;
  requestPermission?: () => Promise<boolean>;
  permission?: NotificationPermission;
  isSupported?: boolean;
}

const MAX_ITEMS_TO_SHOW = 5;

const NotificationHighlightsDropdown: React.FC<NotificationHighlightsDropdownProps> = ({
  reviewRequests,
  focusItems,
  loading = false,
  onRefresh,
  getPreferences,
  setPreferences,
  requestPermission,
  permission = 'default',
  isSupported = false
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [tabValue, setTabValue] = React.useState(0);
  const [prefs, setPrefs] = React.useState<NotificationPreferences>(
    getPreferences ? getPreferences() : { enabled: false, reviewRequests: true, focusItemUpdates: true, soundEnabled: false }
  );
  const [requesting, setRequesting] = React.useState(false);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (getPreferences) {
      setPrefs(getPreferences());
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!setPreferences) return;
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    setPreferences(newPrefs);
  };

  const handleRequestPermission = async () => {
    if (!requestPermission) return;
    setRequesting(true);
    const granted = await requestPermission();
    if (granted) {
      const newPrefs = { ...prefs, enabled: true };
      setPrefs(newPrefs);
      if (setPreferences) {
        setPreferences(newPrefs);
      }
    }
    setRequesting(false);
  };

  const open = Boolean(anchorEl);
  const totalHighlights = reviewRequests.length + focusItems.length;
  const badgeContent = totalHighlights > 9 ? '9+' : totalHighlights;

  const openLink = React.useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <>
      <Tooltip title="Notification highlights">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label="Open notification highlights"
        >
          <Badge color="error" badgeContent={totalHighlights > 0 ? badgeContent : undefined}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxWidth: '90vw' } }}
      >
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<ListIcon fontSize="small" />} label="Highlights" iconPosition="start" />
          {isSupported && <Tab icon={<SettingsIcon fontSize="small" />} label="Settings" iconPosition="start" />}
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Quick Glance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your GitHub tasks at a glance
                  </Typography>
                </Box>
                {onRefresh && (
                  <Tooltip title="Refresh highlights">
                    <span>
                      <IconButton size="small" onClick={() => onRefresh()} disabled={loading}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>

        {loading && reviewRequests.length === 0 && focusItems.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Review requests
            </Typography>
            <List dense disablePadding>
              {reviewRequests.length === 0 ? (
                <ListItemText
                  primary="No review requests waiting"
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', sx: { py: 1 } }}
                />
              ) : (
                reviewRequests.slice(0, MAX_ITEMS_TO_SHOW).map((pr) => (
                  <ListItemButton key={pr.id} onClick={() => openLink(pr.url)} sx={{ borderRadius: 1 }}>
                    <ListItemText
                      primary={pr.title}
                      secondary={`${pr.repository.nameWithOwner} • #${pr.number}`}
                      primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <OpenInNewIcon fontSize="small" />
                  </ListItemButton>
                ))
              )}
            </List>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Focus items
            </Typography>
            <List dense disablePadding>
              {focusItems.length === 0 ? (
                <ListItemText
                  primary="No pinned focus items"
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', sx: { py: 1 } }}
                />
              ) : (
                focusItems.slice(0, MAX_ITEMS_TO_SHOW).map((item) => (
                  <ListItemButton key={item.id} onClick={() => openLink(item.url)} sx={{ borderRadius: 1 }}>
                    <ListItemText
                      primary={item.title}
                      secondary={`${item.repository} • ${item.type.toUpperCase()}`}
                      primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <OpenInNewIcon fontSize="small" />
                  </ListItemButton>
                ))
              )}
            </List>

            {reviewRequests.length > MAX_ITEMS_TO_SHOW && (
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => openLink('https://github.com/pulls/review-requested')}
              >
                View all review requests
              </Button>
            )}
          </Box>
        )}
              </>
          )}

          {tabValue === 1 && isSupported && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Browser Notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Get notified about new items
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
                  Notifications appear when new items are detected while the app runs in the background
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationHighlightsDropdown;

