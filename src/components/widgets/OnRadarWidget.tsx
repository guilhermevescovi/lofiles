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
  Alert
} from '@mui/material';
import { 
  Radar, 
  CheckCircle, 
  Error, 
  Schedule, 
  OpenInNew,
  NewReleases
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { PullRequest } from '../../types/github';

interface OnRadarWidgetProps {
  involvedPRs: PullRequest[];
  currentUser: string;
}

const OnRadarWidget: React.FC<OnRadarWidgetProps> = ({ involvedPRs, currentUser }) => {
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

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Sort PRs: ones with new commits since my review first, then by update date
  const sortedPRs = [...involvedPRs].sort((a, b) => {
    const aHasNew = hasNewCommitsSinceMyReview(a);
    const bHasNew = hasNewCommitsSinceMyReview(b);
    
    if (aHasNew && !bHasNew) return -1;
    if (!aHasNew && bHasNew) return 1;
    
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const prsWithNewCommits = involvedPRs.filter(hasNewCommitsSinceMyReview);

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Radar color="info" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          On My Radar: Keeping Context
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        PRs you've reviewed or contributed to, with new activity highlighted
      </Typography>

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

      {involvedPRs.length === 0 ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            👀 No PRs you're involved in
          </Typography>
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
                    px: 0,
                    '&:hover': { backgroundColor: 'action.hover' },
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: hasNewCommits ? 'rgba(76, 161, 163, 0.15)' : 'transparent',
                    opacity: hasNewCommits ? 1 : 0.8
                  }}
                  onClick={() => openInNewTab(pr.url)}
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
                        <Typography variant="body2" color="text.secondary">
                          {pr.repository.nameWithOwner} • by {pr.author.login} • 
                          {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
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
                          
                          {pr.labels.nodes.slice(0, 2).map((label) => (
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
                  />
                  
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    openInNewTab(pr.url);
                  }}>
                    <OpenInNew fontSize="small" />
                  </IconButton>
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

export default OnRadarWidget;
