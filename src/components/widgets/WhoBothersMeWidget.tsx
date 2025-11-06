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
import { useQuery } from '@apollo/client';
import { GET_PRS_TO_REVIEW } from '../../apollo/queries';
import { PullRequest } from '../../types/github';

interface WhoBothersMeWidgetProps {
  selectedAuthor?: string | null;
  onSelectAuthor?: (author: string) => void;
  onClearFilter?: () => void;
}

interface AuthorReviewCount {
  login: string;
  avatarUrl?: string;
  count: number;
}

const WhoBothersMeWidget: React.FC<WhoBothersMeWidgetProps> = ({
  selectedAuthor,
  onSelectAuthor,
  onClearFilter
}) => {
  const { data, loading, error, refetch } = useQuery(GET_PRS_TO_REVIEW, {
    pollInterval: 300000,
    fetchPolicy: 'cache-and-network'
  });

  const pendingByAuthor = React.useMemo<AuthorReviewCount[]>(() => {
    const counts = new Map<string, AuthorReviewCount>();
    const prs: PullRequest[] = data?.prsToReview?.nodes || [];

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
  }, [data?.prsToReview?.nodes]);

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
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
        border: '1px solid rgba(76, 161, 163, 0.2)',
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
              fontFamily: '"Press Start 2P", "Courier New", monospace',
              fontSize: '12px'
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

        {loading && !data ? (
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
        ) : error ? (
          <Alert
            severity="error"
            sx={{ mb: 1 }}
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load review requests. {error.message}
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
                        backgroundColor: 'rgba(76, 161, 163, 0.1)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(76, 161, 163, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 161, 163, 0.25)'
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
                          <Typography variant="body2">@{login}</Typography>
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

