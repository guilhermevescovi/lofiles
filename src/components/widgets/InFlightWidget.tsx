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
  Tabs,
  Tab
} from '@mui/material';
import { 
  Assignment, 
  MergeType, 
  CheckCircle, 
  Error, 
  Schedule, 
  OpenInNew,
  Person,
  Star,
  StarBorder
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { PullRequest, Issue } from '../../types/github';
import { useFocus } from '../../context/FocusContext';

interface InFlightWidgetProps {
  myOpenPRs: PullRequest[];
  assignedIssues: Issue[];
}

const InFlightWidget: React.FC<InFlightWidgetProps> = ({ myOpenPRs, assignedIssues }) => {
  const [tabValue, setTabValue] = React.useState(0);
  const { isInFocus, addToFocus, removeFromFocus, getFocusItem } = useFocus();

  const getPRStatus = (pr: PullRequest) => {
    if (pr.isDraft) return 'Draft';
    
    const reviews = pr.reviews.nodes;
    const hasApproval = reviews.some(review => review.state === 'APPROVED');
    const hasChangesRequested = reviews.some(review => review.state === 'CHANGES_REQUESTED');
    
    if (hasChangesRequested) return 'Changes Requested';
    if (hasApproval) return 'Approved';
    if (reviews.length > 0) return 'In Review';
    return 'Awaiting Review';
  };

  const getPRStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Changes Requested': return 'error';
      case 'In Review': return 'info';
      case 'Draft': return 'default';
      default: return 'warning';
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            fontSize: '18px',
            textShadow: '2px 2px 0px #4CA1A3',
            color: '#ffffff',
            letterSpacing: '1px'
          }}
        >
          My Stuff
        </Typography>
      </Box>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab 
          label={`My PRs (${myOpenPRs.length})`} 
          icon={<MergeType />}
          iconPosition="start"
        />
        <Tab 
          label={`Assigned Issues (${assignedIssues.length})`} 
          icon={<Person />}
          iconPosition="start"
        />
      </Tabs>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* My Pull Requests Tab */}
        {tabValue === 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your open pull requests grouped by status
            </Typography>

            {myOpenPRs.length === 0 ? (
              <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  📝 No open pull requests
                </Typography>
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflow: 'auto', pr: 1, minHeight: 0 }}>
                <List dense>
                  {myOpenPRs.map((pr, index) => (
                  <React.Fragment key={pr.id}>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ 
                        px: 0,
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => openInNewTab(pr.url)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: 'primary.main' }}>
                          <MergeType fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {pr.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span" color="text.secondary" sx={{ display: 'block' }}>
                              {pr.repository.nameWithOwner} • 
                              {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <Chip
                                label={getPRStatus(pr)}
                                size="small"
                                color={getPRStatusColor(getPRStatus(pr)) as any}
                                variant="outlined"
                              />
                              
                              <Chip
                                icon={getStatusIcon(pr)}
                                label={pr.commits.nodes[0]?.commit.statusCheckRollup?.state || 'Unknown'}
                                size="small"
                                variant="outlined"
                              />
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
                        
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          openInNewTab(pr.url);
                        }}>
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                    
                    {index < myOpenPRs.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}

        {/* Assigned Issues Tab */}
        {tabValue === 1 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Issues assigned to you that aren't linked to your PRs
            </Typography>

            {assignedIssues.length === 0 ? (
              <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  📋 No assigned issues
                </Typography>
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflow: 'auto', pr: 1, minHeight: 0 }}>
                <List dense>
                  {assignedIssues.map((issue, index) => (
                  <React.Fragment key={issue.id}>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ 
                        px: 0,
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => openInNewTab(issue.url)}
                    >
                      <ListItemAvatar>
                        <Avatar src={issue.author.avatarUrl} sx={{ width: 32, height: 32 }} />
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {issue.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span" color="text.secondary" sx={{ display: 'block' }}>
                              {issue.repository.nameWithOwner} • by {issue.author.login} •
                              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <Chip
                                label={`${issue.comments.totalCount} comments`}
                                size="small"
                                variant="outlined"
                              />
                              
                              {issue.labels.nodes.slice(0, 2).map((label) => (
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
                      
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        openInNewTab(issue.url);
                      }}>
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </ListItem>
                    
                    {index < assignedIssues.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default InFlightWidget;
