import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  IconButton,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  Star, 
  Add, 
  Delete, 
  OpenInNew,
  MergeType,
  Assignment
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { FocusItem } from '../../types/github';

const FocusWidget: React.FC = () => {
  const [focusItems, setFocusItems] = useState<FocusItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');

  // Load focus items from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('github_focus_items');
    if (stored) {
      try {
        setFocusItems(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading focus items:', error);
      }
    }
  }, []);

  // Save focus items to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('github_focus_items', JSON.stringify(focusItems));
  }, [focusItems]);

  const parseGitHubUrl = (url: string): { type: 'pr' | 'issue'; repository: string; number: number } | null => {
    // Match GitHub PR or issue URLs
    const match = url.match(/github\.com\/([^/]+\/[^/]+)\/(?:pull|issues)\/(\d+)/);
    if (!match) return null;
    
    const repository = match[1];
    const number = parseInt(match[2]);
    const type = url.includes('/pull/') ? 'pr' : 'issue';
    
    return { type, repository, number };
  };

  const addFocusItem = () => {
    if (!newItemUrl.trim()) return;
    
    const parsed = parseGitHubUrl(newItemUrl);
    if (!parsed) {
      alert('Please enter a valid GitHub PR or issue URL');
      return;
    }
    
    const newItem: FocusItem = {
      id: `focus-${Date.now()}`,
      title: newItemTitle.trim() || `${parsed.type.toUpperCase()} #${parsed.number}`,
      url: newItemUrl.trim(),
      type: parsed.type,
      repository: parsed.repository,
      addedAt: new Date().toISOString()
    };
    
    setFocusItems(prev => [newItem, ...prev.slice(0, 4)]); // Keep max 5 items
    setNewItemUrl('');
    setNewItemTitle('');
    setIsAddDialogOpen(false);
  };

  const removeFocusItem = (id: string) => {
    setFocusItems(prev => prev.filter(item => item.id !== id));
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Star color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Focus for Today
            </Typography>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => setIsAddDialogOpen(true)}
            disabled={focusItems.length >= 5}
          >
            <Add />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pin up to 5 important PRs or issues to stay focused
        </Typography>

        {focusItems.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              🎯 No focus items yet.
            </Typography>
            <Button 
              size="small" 
              startIcon={<Add />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{ mt: 1 }}
            >
              Add your first item
            </Button>
          </Box>
        ) : (
          <List dense>
            {focusItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    px: 0,
                    '&:hover': { backgroundColor: 'action.hover' },
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => openInNewTab(item.url)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      backgroundColor: item.type === 'pr' ? 'primary.main' : 'secondary.main'
                    }}>
                      {item.type === 'pr' ? (
                        <MergeType fontSize="small" />
                      ) : (
                        <Assignment fontSize="small" />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Chip 
                          label={item.type.toUpperCase()} 
                          size="small" 
                          variant="outlined"
                          color={item.type === 'pr' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.repository}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Added {formatDistanceToNow(new Date(item.addedAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box display="flex" gap={0.5}>
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      openInNewTab(item.url);
                    }}>
                      <OpenInNew fontSize="small" />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFocusItem(item.id);
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                
                {index < focusItems.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {focusItems.length > 0 && focusItems.length < 5 && (
          <Box mt={2}>
            <Button 
              size="small" 
              startIcon={<Add />}
              onClick={() => setIsAddDialogOpen(true)}
              fullWidth
              variant="outlined"
            >
              Add another item
            </Button>
          </Box>
        )}
      </Paper>

      {/* Add Item Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Add Focus Item
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste a GitHub PR or issue URL to add it to your focus list.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="GitHub URL"
            fullWidth
            variant="outlined"
            value={newItemUrl}
            onChange={(e) => setNewItemUrl(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Custom Title (optional)"
            fullWidth
            variant="outlined"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Leave empty to auto-generate"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={addFocusItem} 
            variant="contained"
            disabled={!newItemUrl.trim()}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FocusWidget;
