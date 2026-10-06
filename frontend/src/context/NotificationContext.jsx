import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data || []);
      const countRes = await api.get('/notifications/unread_count/');
      setUnreadCount(countRes.data.unread_count || 0);

      // Fetch unread messages count across active conversations
      const convsRes = await api.get('/chat/conversations/');
      const convList = convsRes.data.results || convsRes.data || [];
      const totalUnreadMsgs = convList.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setUnreadMessageCount(totalUnreadMsgs);
    } catch (err) {
      console.error("Error fetching notifications/messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000); // poll every 5s for fast updates
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setUnreadMessageCount(0);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/mark_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadMessageCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
