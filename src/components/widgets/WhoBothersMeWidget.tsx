import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PullRequest } from '../../types/github';
import { useThemeMode } from '../../context/ThemeContext';

interface WhoBothersMeWidgetProps {
  selectedAuthor?: string | null;
  onSelectAuthor?: (author: string) => void;
  onClearFilter?: () => void;
  prs: PullRequest[];
  loading: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

interface AuthorReviewCount {
  login: string;
  avatarUrl?: string;
  count: number;
}

const WhoBothersMeWidget: React.FC<WhoBothersMeWidgetProps> = ({
  selectedAuthor,
  onSelectAuthor,
  onClearFilter,
  prs,
  loading,
  errorMessage,
  onRetry
}) => {
  const { themeName } = useThemeMode();
  const isLofiTheme = themeName === 'lofi';

  const pendingByAuthor = React.useMemo<AuthorReviewCount[]>(() => {
    const counts = new Map<string, AuthorReviewCount>();

    prs.forEach((pr) => {
      if (!pr?.author?.login) {
        return;
      }

      const existing = counts.get(pr.author.login);
      if (existing) {
        existing.count += 1;
        counts.set(pr.author.login, existing);
      } else {
        counts.set(pr.author.login, {
          login: pr.author.login,
          avatarUrl: pr.author.avatarUrl,
          count: 1
        });
      }
    });

    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [prs]);

  const totalRequests = React.useMemo(() => {
    return pendingByAuthor.reduce((sum, entry) => sum + entry.count, 0);
  }, [pendingByAuthor]);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        width: '100%',
        order: 3,
        backgroundColor: (theme) => theme.palette.background.paper,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '12px',
        boxShadow: 'none'
      }}
    >
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontFamily: isLofiTheme ? '"Press Start 2P", "Courier New", monospace' : undefined,
              fontSize: '12px',
              color: (theme) => theme.palette.text.primary
            }}
          >
            Who bothers me
          </Typography>
          {selectedAuthor && onClearFilter && (
            <Button onClick={onClearFilter} size="small">
              Clear
            </Button>
          )}
        </Box>

        {totalRequests > 0 && (
          <Typography variant="caption" color="text.secondary">
            {totalRequests} total pending review request{totalRequests === 1 ? '' : 's'}
          </Typography>
        )}

        {loading && prs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2
            }}
          >
            <CircularProgress size={20} />
          </Box>
        ) : errorMessage ? (
          <Alert
            severity="error"
            sx={{ mb: 1 }}
            action={
              <Button color="inherit" size="small" onClick={() => onRetry?.()}>
                Retry
              </Button>
            }
          >
            Failed to load review requests. {errorMessage}
          </Alert>
        ) : pendingByAuthor.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Peace restored. No pending review requests.
          </Typography>
        ) : (
          <List dense disablePadding>
            {pendingByAuthor.map(({ login, avatarUrl, count }, index) => (
              <React.Fragment key={login}>
                <ListItem disablePadding>
                  <ListItemButton
                    dense
                    selected={selectedAuthor === login}
                    onClick={() => onSelectAuthor && onSelectAuthor(login)}
                    sx={{
                      py: 0.5,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover
                      },
                      '&.Mui-selected': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.16),
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.24)
                        }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={avatarUrl} alt={login} sx={{ width: 28, height: 28 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                        <Typography
                          variant="body2"
                          sx={{ color: (theme) => theme.palette.text.primary }}
                        >
                          @{login}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {count}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < pendingByAuthor.length - 1 && <Divider component="li" sx={{ opacity: 0.2 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default WhoBothersMeWidget;

