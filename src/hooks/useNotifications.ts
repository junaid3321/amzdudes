import { useState, useCallback, useEffect } from 'react';
import type { Notification, NotificationSettings } from '@/types';
import { mockNotifications } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Bfnl0c3N5goaKjoeAeHVzeX+GioqGfnd0dnyDiYuKhX53c3Z9g4qMi4V+d3N2fIOKjIuFfndzdnyDiYqJhX55dnh8gYeFhYN+e3l5fIGFhYSAe3h5fICDhISBfXl4en6ChIOBfXp5en6Bg4KAfXp5e36BgoKAfXt6fH+BgYF/fnx7fX+AgYF/fnx7fX+AgIF/fnx7fX+AgIF/fn18fX+AgIF/fn18fX9/gIF/fn18fX9/gIF/fn18fX9/gIB/fn18fX9/gIB/fn18fX9/gIB/fn18fX9/gIB/fn18fn9/gIB/fn18fn9/gIB/fn18fn9/f4B/fn18fn9/f4B/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/fn18fn5/f39/';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    desktopEnabled: false,
    criticalOnly: false
  });
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasHighPriority = notifications.some(n => !n.read && n.priority === 'high');

  // Request desktop notification permission
  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({ ...prev, desktopEnabled: permission === 'granted' }));
    }
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (settings.soundEnabled) {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Audio play failed - likely due to browser autoplay policy
      });
    }
  }, [settings.soundEnabled]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (settings.desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, [settings.desktopEnabled]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Check if we should show this notification
    if (settings.criticalOnly && notification.priority !== 'high') {
      return;
    }

    // Play sound for high priority
    if (notification.priority === 'high') {
      playSound();
    }

    // Show desktop notification
    showDesktopNotification(newNotification);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.priority === 'high' ? 'destructive' : 'default'
    });
  }, [settings.criticalOnly, playSound, showDesktopNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Simulate real-time alerts (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to trigger a new notification
      if (Math.random() < 0.1) { // 10% chance every interval
        const types: Notification['type'][] = ['alert', 'update', 'success'];
        const priorities: Notification['priority'][] = ['high', 'medium', 'low'];
        
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
        
        const messages = {
          alert: 'New alert detected for a client',
          update: 'Performance update available',
          success: 'Task completed successfully'
        };

        addNotification({
          type: randomType,
          title: randomType === 'alert' ? 'New Alert' : randomType === 'update' ? 'Update' : 'Success',
          message: messages[randomType],
          priority: randomPriority
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  return {
    notifications,
    settings,
    unreadCount,
    hasHighPriority,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    updateSettings,
    requestDesktopPermission
  };
}
