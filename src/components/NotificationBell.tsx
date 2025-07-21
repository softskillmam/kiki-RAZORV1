
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  console.log('NotificationBell component loaded');

  // Memoize the fetch function to prevent recreating on every render
  const fetchNotifications = useCallback(async () => {
    console.log('Fetching notifications...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Notifications fetched:', data);
      const notificationData = data as Notification[];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscription only once
  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Only create channel if it doesn't exist
    if (!channelRef.current) {
      console.log('Setting up notification subscription...');
      
      channelRef.current = supabase
        .channel(`admin-notifications-${Math.random()}`) // Add random suffix to prevent conflicts
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('New notification received:', payload);
            const newNotification = payload.new as Notification;
            
            // Prevent duplicate notifications
            setNotifications(prev => {
              const exists = prev.find(n => n.id === newNotification.id);
              if (exists) {
                console.log('Notification already exists, skipping...');
                return prev;
              }
              return [newNotification, ...prev];
            });
            
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification with duplicate prevention
            const toastKey = `notification-${newNotification.id}`;
            if (!sessionStorage.getItem(toastKey)) {
              sessionStorage.setItem(toastKey, 'shown');
              setTimeout(() => sessionStorage.removeItem(toastKey), 5000);
              
              toast({
                title: "New Notification",
                description: newNotification.title,
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('Notification updated:', payload);
            const updatedNotification = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => 
                n.id === updatedNotification.id ? updatedNotification : n
              )
            );
            
            // Recalculate unread count
            setNotifications(current => {
              const newUnreadCount = current.filter(n => !n.is_read).length;
              setUnreadCount(newUnreadCount);
              return current;
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up notification subscription...');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = useCallback(() => {
    console.log('Bell clicked, isOpen:', isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  }, [isOpen, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Memoize the notification list to prevent unnecessary re-renders
  const notificationList = useMemo(() => {
    return notifications.map((notification) => (
      <div
        key={notification.id}
        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
          !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        onClick={() => {
          if (!notification.is_read) {
            markAsRead(notification.id);
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-600 mb-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at))} ago
            </p>
          </div>
        </div>
      </div>
    ));
  }, [notifications, markAsRead]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBellClick}
        className="text-gray-600 hover:text-gray-900 relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 shadow-lg z-50 bg-white border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notificationList}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
