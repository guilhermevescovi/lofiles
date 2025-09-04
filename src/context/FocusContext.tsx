import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FocusItem, PullRequest } from '../types/github';

interface FocusContextType {
  focusItems: FocusItem[];
  addToFocus: (pr: PullRequest) => void;
  removeFromFocus: (id: string) => void;
  isInFocus: (prUrl: string) => boolean;
  getFocusItem: (prUrl: string) => FocusItem | undefined;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

interface FocusProviderProps {
  children: ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [focusItems, setFocusItems] = useState<FocusItem[]>([]);

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

  const addToFocus = (pr: PullRequest) => {
    // Check if already in focus
    if (isInFocus(pr.url)) {
      return;
    }

    const parsed = parseGitHubUrl(pr.url);
    if (!parsed) {
      console.error('Invalid GitHub URL:', pr.url);
      return;
    }
    
    const newItem: FocusItem = {
      id: `focus-${pr.id}-${Date.now()}`,
      title: pr.title,
      url: pr.url,
      type: parsed.type,
      repository: parsed.repository,
      addedAt: new Date().toISOString()
    };
    
    setFocusItems(prev => [newItem, ...prev.slice(0, 4)]); // Keep max 5 items
  };

  const removeFromFocus = (id: string) => {
    setFocusItems(prev => prev.filter(item => item.id !== id));
  };

  const isInFocus = (prUrl: string): boolean => {
    return focusItems.some(item => item.url === prUrl);
  };

  const getFocusItem = (prUrl: string): FocusItem | undefined => {
    return focusItems.find(item => item.url === prUrl);
  };

  return (
    <FocusContext.Provider value={{
      focusItems,
      addToFocus,
      removeFromFocus,
      isInFocus,
      getFocusItem
    }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = (): FocusContextType => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
