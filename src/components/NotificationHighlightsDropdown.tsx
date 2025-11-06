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
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PullRequest, FocusItem } from '../types/github';

interface NotificationHighlightsDropdownProps {
  reviewRequests: PullRequest[];
  focusItems: FocusItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

const MAX_ITEMS_TO_SHOW = 5;

const NotificationHighlightsDropdown: React.FC<NotificationHighlightsDropdownProps> = ({
  reviewRequests,
  focusItems,
  loading = false,
  onRefresh
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        PaperProps={{ sx: { width: 320, maxWidth: '90vw', p: 2 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Highlights
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Quick glance at your GitHub tasks
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
      </Popover>
    </>
  );
};

export default NotificationHighlightsDropdown;

