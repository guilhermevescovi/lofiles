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
  Badge
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
  Clear
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { PullRequest } from '../../types/github';
import { useAuth } from '../../context/AuthContext';
import { useFocus } from '../../context/FocusContext';

interface TriageWidgetProps {
  prsToReview: PullRequest[];
  mentions: any[]; // We'll type this properly later
  selectedUser?: string | null;
  onClearFilter?: () => void;
}

const TriageWidget: React.FC<TriageWidgetProps> = ({ prsToReview, mentions, selectedUser, onClearFilter }) => {
  // Get current user from the Dashboard component
  const { user } = useAuth();
  const { isInFocus, addToFocus, removeFromFocus, getFocusItem } = useFocus();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Directly Assigned']));

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

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

  // Filter PRs by selected user if any
  const filteredPRs = React.useMemo(() => {
    if (!selectedUser) return prsToReview;
    
    return prsToReview.filter(pr => pr.author.login === selectedUser);
  }, [prsToReview, selectedUser]);

  // Group PRs by review assignment type and sort by last updated
  const groupPRsByAssignment = () => {
    const groups: { [key: string]: { prs: PullRequest[], isDirect: boolean } } = {};
    
    filteredPRs.forEach(pr => {
      let isDirectlyAssigned = false;
      const assignmentTypes = new Set<string>();
      
      pr.reviewRequests?.nodes?.forEach(request => {
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

  const groupedPRs = groupPRsByAssignment();


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
          Review Requests
        </Typography>
      </Box>
      
      {selectedUser && onClearFilter && (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={2}
          sx={{
            backgroundColor: 'rgba(76, 161, 163, 0.15)',
            border: '1px solid rgba(76, 161, 163, 0.3)',
            borderRadius: 1,
            px: 2,
            py: 1
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4CA1A3',
              fontWeight: 600
            }}
          >
            Filtered by: {selectedUser}
          </Typography>
          <IconButton 
            size="small" 
            onClick={onClearFilter}
            title="Clear filter"
            sx={{ 
              color: '#4CA1A3',
              '&:hover': { backgroundColor: 'rgba(76, 161, 163, 0.2)' }
            }}
          >
            <Clear fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pull requests waiting for your review
      </Typography>

      {filteredPRs.length === 0 ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {selectedUser ? `🎯 No PRs from ${selectedUser} waiting for your review!` : '🎉 No PRs waiting for your review!'}
          </Typography>
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
                  border: isDirect ? '2px solid #4caf50' : 'none',
                  backgroundColor: isDirect ? 'rgba(76, 175, 80, 0.05)' : 'background.paper',
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
                    backgroundColor: isDirect ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: isDirect ? 700 : 600,
                        color: isDirect ? '#2e7d32' : 'text.primary'
                      }}
                    >
                      {groupName}
                    </Typography>
                    <Badge 
                      badgeContent={prs.length} 
                      color={isDirect ? "success" : "primary"} 
                      sx={{ ml: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      • Updated {formatDistanceToNow(new Date(prs[0]?.updatedAt), { addSuffix: true })}
                    </Typography>
                    {isDirect && (
                      <Chip 
                        label="HIGH PRIORITY" 
                        size="small" 
                        color="success"
                        sx={{ ml: 1, fontWeight: 600, fontSize: '0.6rem' }}
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

export default TriageWidget;
