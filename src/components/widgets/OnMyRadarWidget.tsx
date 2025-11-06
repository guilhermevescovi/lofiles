import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Button,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Radar,
  CheckCircle,
  Error,
  Schedule,
  OpenInNew,
  NewReleases,
  Star,
  StarBorder
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@apollo/client';
import { GET_INVOLVED_PRS } from '../../apollo/queries';
import { PullRequest } from '../../types/github';
import { useFocus } from '../../context/FocusContext';
import { useThemeMode } from '../../context/ThemeContext';

interface OnMyRadarWidgetProps {
  // No props needed - widget fetches its own data
}

const OnMyRadarWidget: React.FC<OnMyRadarWidgetProps> = () => {
  const { isInFocus, addToFocus, removeFromFocus, getFocusItem } = useFocus();
  const { themeName } = useThemeMode();
  const isLofiTheme = themeName === 'lofi';
  const [showDrafts, setShowDrafts] = React.useState(false);
  const [cachedPRs, setCachedPRs] = React.useState<PullRequest[]>([]);

  // Fetch involved PRs
  const { data, loading: isLoading, error, refetch } = useQuery(GET_INVOLVED_PRS, {
    pollInterval: 300000, // Auto-refresh every 5 minutes
    fetchPolicy: 'cache-and-network'
  });

  const involvedPRs = data?.involvedPRs?.nodes || [];
  const currentUser = data?.viewer?.login || '';
  
  // Validate and filter out invalid PRs
  const validPRs = React.useMemo(() => {
    if (!Array.isArray(involvedPRs)) {
      console.warn('OnMyRadarWidget: involvedPRs is not an array:', involvedPRs);
      return [];
    }
    const valid = involvedPRs.filter(pr => 
      pr && 
      pr.id && 
      pr.title && 
      pr.url && 
      pr.author && 
      pr.author.login &&
      pr.repository &&
      pr.repository.nameWithOwner
    );
    
    if (involvedPRs.length > 0 && valid.length === 0) {
      console.warn('OnMyRadarWidget: All PRs were filtered out as invalid:', involvedPRs);
    }
    
    return valid;
  }, [involvedPRs]);

  React.useEffect(() => {
    if (validPRs.length > 0) {
      setCachedPRs(validPRs as PullRequest[]);
    }
  }, [validPRs]);

  const basePRs = validPRs.length > 0 ? validPRs : cachedPRs;
  const isStaleData = validPRs.length === 0 && cachedPRs.length > 0 && !isLoading;
  const getMyLastReviewDate = (pr: PullRequest) => {
    const myReviews = pr.reviews.nodes.filter(review => review.author.login === currentUser);
    return myReviews.length > 0 ? myReviews[myReviews.length - 1].submittedAt : null;
  };

  const hasNewCommitsSinceMyReview = (pr: PullRequest) => {
    const myLastReviewDate = getMyLastReviewDate(pr);
    if (!myLastReviewDate) return false;
    
    return new Date(pr.updatedAt) > new Date(myLastReviewDate);
  };

  const getMyInvolvement = (pr: PullRequest) => {
    const hasReviewed = pr.reviews.nodes.some(review => review.author.login === currentUser);
    const hasCommented = pr.comments.nodes.some(comment => comment.author.login === currentUser);
    
    if (hasReviewed) return 'Reviewed';
    if (hasCommented) return 'Commented';
    return 'Involved';
  };

  const getInvolvementColor = (involvement: string) => {
    switch (involvement) {
      case 'Reviewed': return 'primary';
      case 'Commented': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (pr: PullRequest) => {
    const latestCommit = pr.commits.nodes[0];
    if (!latestCommit?.commit.statusCheckRollup) return <Schedule />;
    
    switch (latestCommit.commit.statusCheckRollup.state) {
      case 'SUCCESS': return <CheckCircle />;
      case 'FAILURE': 
      case 'ERROR': return <Error />;
      case 'PENDING': return <Schedule />;
      default: return <Schedule />;
    }
  };

  const handlePRClick = (e: React.MouseEvent, url: string) => {
    // Support both left click and middle click
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFocusToggle = (pr: PullRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInFocus(pr.url)) {
      const focusItem = getFocusItem(pr.url);
      if (focusItem) {
        removeFromFocus(focusItem.id);
      }
    } else {
      addToFocus(pr);
    }
  };

  // Sort PRs: ones with new commits since my review first, then by update date
  const filteredPRs = React.useMemo(() => {
    if (showDrafts) {
      return basePRs;
    }
    return basePRs.filter(pr => !pr.isDraft);
  }, [basePRs, showDrafts]);

  const sortedPRs = React.useMemo(() => {
    return [...filteredPRs].sort((a, b) => {
      const aHasNew = hasNewCommitsSinceMyReview(a);
      const bHasNew = hasNewCommitsSinceMyReview(b);
      if (aHasNew && !bHasNew) return -1;
      if (!aHasNew && bHasNew) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredPRs]);

  const prsWithNewCommits = React.useMemo(
    () => filteredPRs.filter(hasNewCommitsSinceMyReview),
    [filteredPRs]
  );

  const hasAnyPRs = basePRs.length > 0;
  const hasFilteredPRs = filteredPRs.length > 0;

  // Handle loading state
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{
              fontFamily: isLofiTheme ? '"Press Start 2P", "Courier New", monospace' : undefined,
              fontSize: '18px',
              textShadow: isLofiTheme ? '2px 2px 0px #4CA1A3' : 'none',
              color: (theme) => theme.palette.text.primary,
              letterSpacing: '1px'
            }}
          >
            On My Radar
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{
              fontFamily: isLofiTheme ? '"Press Start 2P", "Courier New", monospace' : undefined,
              fontSize: '18px',
              textShadow: isLofiTheme ? '2px 2px 0px #4CA1A3' : 'none',
              color: (theme) => theme.palette.text.primary,
              letterSpacing: '1px'
            }}
          >
            On My Radar
          </Typography>
        </Box>
        
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load radar data. {error.message}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{
            fontFamily: isLofiTheme ? '"Press Start 2P", "Courier New", monospace' : undefined,
            fontSize: '18px',
            textShadow: isLofiTheme ? '2px 2px 0px #4CA1A3' : 'none',
            color: (theme) => theme.palette.text.primary,
            letterSpacing: '1px'
          }}
        >
          On My Radar
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="body2" color="text.secondary">
          PRs you've reviewed or contributed to, with new activity highlighted
        </Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showDrafts}
              onChange={(event) => setShowDrafts(event.target.checked)}
            />
          }
          label="Show drafts"
        />
      </Box>

      {prsWithNewCommits.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(76, 161, 163, 0.1)',
            borderColor: '#4CA1A3',
            '& .MuiAlert-icon': {
              color: '#4CA1A3'
            }
          }}
        >
          <Typography variant="body2">
            <strong>{prsWithNewCommits.length}</strong> PR{prsWithNewCommits.length > 1 ? 's have' : ' has'} new commits since your last review!
          </Typography>
        </Alert>
      )}

      {isStaleData && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Showing the last known radar results while GitHub data refreshes.
        </Alert>
      )}

      {!hasFilteredPRs ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {hasAnyPRs
              ? 'No PRs match your current filters. Drafts are hidden.'
              : "👀 No PRs you're involved in"}
          </Typography>
          {!showDrafts && hasAnyPRs && (
            <Button size="small" onClick={() => setShowDrafts(true)}>
              Show drafts
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto', pr: 1, minHeight: 0 }}>
          <List dense>
            {sortedPRs.map((pr, index) => {
            const hasNewCommits = hasNewCommitsSinceMyReview(pr);
            const involvement = getMyInvolvement(pr);
            
            return (
              <React.Fragment key={pr.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 2,
                    '&:hover': { backgroundColor: 'action.hover' },
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: hasNewCommits ? 'rgba(76, 161, 163, 0.15)' : 'transparent',
                    opacity: hasNewCommits ? 1 : 0.8
                  }}
                  onMouseDown={(e) => handlePRClick(e, pr.url)}
                >
                  <ListItemAvatar>
                    <Avatar src={pr.author.avatarUrl} sx={{ width: 32, height: 32 }} />
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {pr.title}
                        </Typography>
                        
                        {hasNewCommits && (
                          <NewReleases sx={{ color: '#4CA1A3' }} fontSize="small" />
                        )}
                        
                        {pr.isDraft && (
                          <Chip label="Draft" size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {pr.repository.nameWithOwner} • by {pr.author.login} • 
                          {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={involvement}
                            size="small"
                            color={getInvolvementColor(involvement) as any}
                            variant="outlined"
                          />
                          
                          <Chip
                            icon={getStatusIcon(pr)}
                            label={pr.commits.nodes[0]?.commit.statusCheckRollup?.state || 'Unknown'}
                            size="small"
                            variant="outlined"
                          />
                          
                          {hasNewCommits && (
                            <Chip
                              label="New commits!"
                              size="small"
                              variant="filled"
                              sx={{
                                backgroundColor: '#4CA1A3',
                                color: '#ffffff',
                                fontWeight: 600
                              }}
                            />
                          )}
                          
                          {pr.labels.nodes.slice(0, 2).map((label: { name: string; color: string }) => (
                            <Chip
                              key={label.name}
                              label={label.name}
                              size="small"
                              sx={{
                                backgroundColor: `#${label.color}`,
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                    disableTypography
                  />
                  
                  <Box display="flex" gap={0.5}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleFocusToggle(pr, e)}
                      color={isInFocus(pr.url) ? "warning" : "default"}
                      title={isInFocus(pr.url) ? "Remove from focus" : "Add to focus"}
                    >
                      {isInFocus(pr.url) ? (
                        <Star fontSize="small" />
                      ) : (
                        <StarBorder fontSize="small" />
                      )}
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handlePRClick(e, pr.url);
                      }}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                
                {index < sortedPRs.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            );
            })}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default OnMyRadarWidget;
