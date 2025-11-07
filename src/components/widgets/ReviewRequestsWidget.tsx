import React, { useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  CircularProgress,
  Alert,
  Button,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  PriorityHigh,
  CheckCircle,
  Error,
  Schedule,
  OpenInNew,
  ExpandMore,
  Star,
  StarBorder,
  Refresh
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { PullRequest } from '../../types/github';
import { useAuth } from '../../context/AuthContext';
import { useFocus } from '../../context/FocusContext';
import { useThemeMode } from '../../context/ThemeContext';

interface ReviewRequestsWidgetProps {
  selectedAuthor?: string | null;
  onClearFilter?: () => void;
  prs: PullRequest[];
  loading: boolean;
  errorMessage?: string;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

const ReviewRequestsWidget: React.FC<ReviewRequestsWidgetProps> = ({
  selectedAuthor,
  onClearFilter,
  prs,
  loading,
  errorMessage,
  onRefresh,
  isRefreshing
}) => {
  const { user } = useAuth();
  const { isInFocus, addToFocus, removeFromFocus, getFocusItem } = useFocus();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Directly Assigned']));
  const [showDrafts, setShowDrafts] = useState(false);
  const { themeName } = useThemeMode();
  const isLofiTheme = themeName === 'lofi';
  const prsToReview = prs || [];
  const refreshDisabled = !onRefresh || (loading && prsToReview.length === 0) || Boolean(isRefreshing);
  const showRefreshSpinner = Boolean(isRefreshing) || (loading && prsToReview.length > 0);

  const filteredPRs = React.useMemo(() => {
    let visible = prsToReview;

    if (!showDrafts) {
      visible = visible.filter((pr: PullRequest) => !pr.isDraft);
    }

    if (selectedAuthor) {
      visible = visible.filter((pr: PullRequest) => pr.author?.login === selectedAuthor);
    }

    return visible;
  }, [prsToReview, selectedAuthor, showDrafts]);

  const getStatusColor = (pr: PullRequest) => {
    const latestCommit = pr.commits.nodes[0];
    if (!latestCommit?.commit.statusCheckRollup) return 'default';
    
    switch (latestCommit.commit.statusCheckRollup.state) {
      case 'SUCCESS': return 'success';
      case 'FAILURE': 
      case 'ERROR': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const isCriticalPR = (pr: PullRequest) => {
    const daysSinceCreated = (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceUpdated = (Date.now() - new Date(pr.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    // Critical if PR is older than 7 days and hasn't been updated in 3+ days
    return daysSinceCreated > 7 && daysSinceUpdated > 3;
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

  // Group PRs by review assignment type and sort by last updated
  const groupPRsByAssignment = (pullRequests: PullRequest[]) => {
    const groups: { [key: string]: { prs: PullRequest[], isDirect: boolean } } = {};

    pullRequests.forEach((pr: PullRequest) => {
      let isDirectlyAssigned = false;
      const assignmentTypes = new Set<string>();

      pr.reviewRequests?.nodes?.forEach((request: any) => {
        const reviewer = request?.requestedReviewer;
        
        if (!reviewer) return;
        
        // Check if it's a direct user assignment to the current user
        if ('login' in reviewer && reviewer.login && reviewer.login === user?.login) {
          isDirectlyAssigned = true;
          assignmentTypes.add('Directly Assigned');
        }
        // Check if it's a team assignment
        else if ('name' in reviewer && reviewer.name) {
          assignmentTypes.add(reviewer.name);
        }
      });
      
      // If no review requests, categorize as "No Assignment"
      if (assignmentTypes.size === 0) {
        assignmentTypes.add('No Assignment');
      }
      
      // Add PR to each relevant group
      assignmentTypes.forEach(groupName => {
        if (!groups[groupName]) {
          groups[groupName] = { prs: [], isDirect: groupName.includes('Directly Assigned') };
        }
        groups[groupName].prs.push(pr);
      });
    });
    
    // Sort PRs within each group by updatedAt (most recent first)
    Object.keys(groups).forEach(groupKey => {
      groups[groupKey].prs.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    
    // Sort groups: Direct assignments first, then by most recent PR
    const sortedGroupEntries = Object.entries(groups).sort(([nameA, groupA], [nameB, groupB]) => {
      // Direct assignments always come first
      if (groupA.isDirect && !groupB.isDirect) return -1;
      if (!groupA.isDirect && groupB.isDirect) return 1;
      
      // Within same priority level, sort by most recent PR
      const mostRecentA = new Date(groupA.prs[0]?.updatedAt || 0).getTime();
      const mostRecentB = new Date(groupB.prs[0]?.updatedAt || 0).getTime();
      return mostRecentB - mostRecentA;
    });
    
    return sortedGroupEntries.map(([name, group]) => [name, group.prs, group.isDirect] as const);
  };

  const handleGroupToggle = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const groupedPRs = groupPRsByAssignment(filteredPRs);
  const hasAnyPRs = prsToReview.length > 0;
  const hasFilteredPRs = filteredPRs.length > 0;


  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
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
            Review Requests
          </Typography>
          {isLofiTheme && (
            <Box 
              component="img" 
              src={`${process.env.PUBLIC_URL}/assets/internet-running.gif`} 
              alt="Internet Running"
              sx={{
                height: 'auto',
                maxHeight: '48px',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          )}
        </Box>
        <Tooltip title="Reload review requests">
          <span>
            <IconButton 
              size="small"
              onClick={() => onRefresh?.()}
              disabled={refreshDisabled}
            >
              {showRefreshSpinner ? <CircularProgress size={16} /> : <Refresh fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Pull requests waiting for your review
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

      {selectedAuthor && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Chip 
            label={`Filtering by @${selectedAuthor}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {onClearFilter && (
            <Button size="small" onClick={onClearFilter}>
              Clear
            </Button>
          )}
        </Box>
      )}

      {loading && prsToReview.length === 0 ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Failed to load PRs. {errorMessage}
          </Alert>
          <Button onClick={() => onRefresh?.()} variant="contained" size="small">
            Retry
          </Button>
        </Box>
      ) : !hasAnyPRs ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            🎉 No PRs waiting for your review!
          </Typography>
        </Box>
      ) : !hasFilteredPRs ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedAuthor ? `No review requests from @${selectedAuthor}.` : 'No review requests match your filters.'}
            {!showDrafts && ' Drafts are hidden.'}
          </Typography>
          {onClearFilter && (
            <Button size="small" onClick={onClearFilter}>
              Clear filter
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto', pr: 1, minHeight: 0 }}>
          {groupedPRs.map(([groupName, prs, isDirect]) => {
            const isExpanded = expandedGroups.has(groupName);
            
            return (
              <Accordion 
                key={groupName}
                expanded={isExpanded}
                onChange={() => handleGroupToggle(groupName)}
                sx={{ 
                  mb: 1,
                  '&:before': { display: 'none' },
                  boxShadow: isDirect ? 3 : 1,
                  borderRadius: '8px !important',
                  border: isDirect ? '2px solid #4CA1A3' : 'none',
                  backgroundColor: isDirect ? 'rgba(76, 161, 163, 0.15)' : 'background.paper',
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMore />}
                  sx={{ 
                    minHeight: 48,
                    '&.Mui-expanded': { minHeight: 48 },
                    px: 2,
                    borderRadius: '8px',
                    backgroundColor: isDirect ? 'rgba(76, 161, 163, 0.15)' : 'transparent'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: isDirect ? 700 : 600,
                        color: isDirect ? '#4CA1A3' : 'text.primary'
                      }}
                    >
                      {groupName}
                    </Typography>
                    <Badge 
                      badgeContent={prs.length} 
                      color={"primary"} 
                      sx={{ ml: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      • Updated {formatDistanceToNow(new Date(prs[0]?.updatedAt), { addSuffix: true })}
                    </Typography>
                    {isDirect && (
                      <Chip 
                        label="HIGH PRIORITY" 
                        size="small" 
                        sx={{ 
                          ml: 1, 
                          fontWeight: 600, 
                          fontSize: '0.6rem',
                          backgroundColor: '#4CA1A3',
                          color: '#ffffff'
                        }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 0, backgroundColor: 'rgba(76, 161, 163, 0.15)' }}>
                  <List dense>
                    {prs.map((pr, index) => (
                      <React.Fragment key={pr.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            px: 2,
                            '&:hover': { backgroundColor: 'action.hover' },
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: isCriticalPR(pr) ? 'rgba(255, 20, 147, 0.2)' : 'transparent',
                            borderLeft: isCriticalPR(pr) ? '4px solid #ff1493' : 'none'
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
                                {pr.isDraft && (
                                  <Chip label="Draft" size="small" variant="outlined" />
                                )}
                                
                                {isCriticalPR(pr) && (
                                  <Chip 
                                    icon={<PriorityHigh />}
                                    label="GETTING OLD" 
                                    size="small" 
                                    sx={{
                                      backgroundColor: '#ff1493',
                                      color: '#ffffff',
                                      fontWeight: 700,
                                      fontSize: '0.6rem',
                                      '& .MuiChip-icon': {
                                        color: '#ffffff'
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {pr.repository.nameWithOwner} • by {pr.author.login} • 
                                  Updated {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                                  {isCriticalPR(pr) && (
                                    <span style={{ color: '#ff1493', fontWeight: 600 }}>
                                      {' • Waiting '}{formatDistanceToNow(new Date(pr.createdAt), { addSuffix: false })}
                                    </span>
                                  )}
                                </Typography>
                                
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    icon={getStatusIcon(pr)}
                                    label={pr.commits.nodes[0]?.commit.statusCheckRollup?.state || 'Unknown'}
                                    size="small"
                                    color={getStatusColor(pr) as any}
                                    variant="outlined"
                                  />
                                  
                                  {pr.labels.nodes.slice(0, 3).map((label) => (
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
                              onMouseDown={(e) => e.stopPropagation()}
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
                        
                        {index < prs.length - 1 && <Divider variant="inset" />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default ReviewRequestsWidget;
