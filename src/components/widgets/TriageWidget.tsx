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
  ExpandMore 
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { PullRequest } from '../../types/github';
import { useAuth } from '../../context/AuthContext';

interface TriageWidgetProps {
  prsToReview: PullRequest[];
  mentions: any[]; // We'll type this properly later
}

const TriageWidget: React.FC<TriageWidgetProps> = ({ prsToReview, mentions }) => {
  // Get current user from the Dashboard component
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['🎯 Directly Assigned']));

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

  // Group PRs by review assignment type and sort by last updated
  const groupPRsByAssignment = () => {
    const groups: { [key: string]: { prs: PullRequest[], isDirect: boolean } } = {};
    
    prsToReview.forEach(pr => {
      let isDirectlyAssigned = false;
      const assignmentTypes = new Set<string>();
      
      pr.reviewRequests?.nodes?.forEach(request => {
        const reviewer = request?.requestedReviewer;
        
        if (!reviewer) return;
        
        // Check if it's a direct user assignment to the current user
        if ('login' in reviewer && reviewer.login && reviewer.login === user?.login) {
          isDirectlyAssigned = true;
          assignmentTypes.add('🎯 Directly Assigned');
        }
        // Check if it's a team assignment
        else if ('name' in reviewer && reviewer.name) {
          assignmentTypes.add(`👥 ${reviewer.name}`);
        }
      });
      
      // If no review requests, categorize as "No Assignment"
      if (assignmentTypes.size === 0) {
        assignmentTypes.add('❓ No Assignment');
      }
      
      // Add PR to each relevant group
      assignmentTypes.forEach(groupName => {
        if (!groups[groupName]) {
          groups[groupName] = { prs: [], isDirect: groupName.includes('🎯') };
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
        <PriorityHigh color="error" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Triage: What Needs My Immediate Attention?
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pull requests waiting for your review
      </Typography>

      {prsToReview.length === 0 ? (
        <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            🎉 No PRs waiting for your review!
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
                
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense>
                    {prs.map((pr, index) => (
                      <React.Fragment key={pr.id}>
                        <ListItem 
                          alignItems="flex-start"
                          sx={{ 
                            px: 2,
                            '&:hover': { backgroundColor: 'action.hover' },
                            borderRadius: 1,
                            cursor: 'pointer'
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
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {pr.repository.nameWithOwner} • by {pr.author.login} • 
                                  Updated {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}
                                </Typography>
                                
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
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
                          />
                          
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            openInNewTab(pr.url);
                          }}>
                            <OpenInNew fontSize="small" />
                          </IconButton>
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
