import { useEffect, useCallback, useRef } from 'react';
import { PullRequest, FocusItem } from '../types/github';

interface NotificationPreferences {
  enabled: boolean;
  reviewRequests: boolean;
  focusItemUpdates: boolean;
  soundEnabled: boolean;
}

const STORAGE_KEY = 'lofiles_notification_prefs';
const NOTIFIED_IDS_KEY = 'lofiles_notified_ids';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  reviewRequests: true,
  focusItemUpdates: true,
  soundEnabled: false,
};

export const useBrowserNotifications = (
  reviewRequests: PullRequest[],
  focusItems: FocusItem[]
) => {
  const previousReviewRequestsRef = useRef<Set<string>>(new Set());
  const previousFocusItemsRef = useRef<Set<string>>(new Set());
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Load preferences from localStorage
  const getPreferences = useCallback((): NotificationPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }, []);

  // Save preferences to localStorage
  const setPreferences = useCallback((prefs: NotificationPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }, []);

  // Load notified IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFIED_IDS_KEY);
      if (stored) {
        notifiedIdsRef.current = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notified IDs:', error);
    }
  }, []);

  // Save notified IDs to localStorage
  const saveNotifiedIds = useCallback(() => {
    try {
      localStorage.setItem(
        NOTIFIED_IDS_KEY,
        JSON.stringify(Array.from(notifiedIdsRef.current))
      );
    } catch (error) {
      console.error('Failed to save notified IDs:', error);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Show a browser notification
  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      const notification = new Notification(title, {
        icon: '/logo192.png', // Use your app's icon
        badge: '/logo192.png',
        ...options,
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      return notification;
    },
    []
  );

  // Check for new review requests
  useEffect(() => {
    const prefs = getPreferences();
    if (!prefs.enabled || !prefs.reviewRequests) return;

    const currentIds = new Set(reviewRequests.map((pr) => pr.id));
    const newPRs = reviewRequests.filter(
      (pr) =>
        !previousReviewRequestsRef.current.has(pr.id) &&
        !notifiedIdsRef.current.has(pr.id)
    );

    if (newPRs.length > 0 && previousReviewRequestsRef.current.size > 0) {
      // Not first load
      newPRs.forEach((pr) => {
        showNotification('New Review Request', {
          body: `${pr.title}\n${pr.repository.nameWithOwner} #${pr.number}`,
          tag: `review-${pr.id}`,
          data: { url: pr.url },
        })?.addEventListener('click', () => {
          window.open(pr.url, '_blank', 'noopener,noreferrer');
        });

        notifiedIdsRef.current.add(pr.id);
      });

      saveNotifiedIds();
    }

    previousReviewRequestsRef.current = currentIds;
  }, [reviewRequests, getPreferences, showNotification, saveNotifiedIds]);

  // Check for new focus items
  useEffect(() => {
    const prefs = getPreferences();
    if (!prefs.enabled || !prefs.focusItemUpdates) return;

    const currentIds = new Set(focusItems.map((item) => item.id));
    const newItems = focusItems.filter(
      (item) =>
        !previousFocusItemsRef.current.has(item.id) &&
        !notifiedIdsRef.current.has(item.id)
    );

    if (newItems.length > 0 && previousFocusItemsRef.current.size > 0) {
      // Not first load
      newItems.forEach((item) => {
        showNotification('New Focus Item', {
          body: `${item.title}\n${item.repository} • ${item.type.toUpperCase()}`,
          tag: `focus-${item.id}`,
          data: { url: item.url },
        })?.addEventListener('click', () => {
          window.open(item.url, '_blank', 'noopener,noreferrer');
        });

        notifiedIdsRef.current.add(item.id);
      });

      saveNotifiedIds();
    }

    previousFocusItemsRef.current = currentIds;
  }, [focusItems, getPreferences, showNotification, saveNotifiedIds]);

  // Clear old notified IDs periodically (keep only last 100)
  useEffect(() => {
    const cleanup = () => {
      if (notifiedIdsRef.current.size > 100) {
        const idsArray = Array.from(notifiedIdsRef.current);
        notifiedIdsRef.current = new Set(idsArray.slice(-100));
        saveNotifiedIds();
      }
    };

    const interval = setInterval(cleanup, 60000); // Every minute
    return () => clearInterval(interval);
  }, [saveNotifiedIds]);

  return {
    requestPermission,
    showNotification,
    getPreferences,
    setPreferences,
    isSupported: 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
  };
};
