import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationService.getMyNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load notifications', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((current) => current.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <h2 className="font-h2 text-[28px] sm:text-[32px] font-bold text-on-surface mb-2">Notifications</h2>
        <p className="font-body-md text-[15px] sm:text-[16px] text-on-surface-variant">Your recent alerts and updates.</p>
      </div>

      {loading ? (
        <div className="text-on-surface-variant">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-6 text-on-surface-variant">No notifications yet.</div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {notifications.map((notification) => (
            <div key={notification._id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
              <div>
                <p className="font-medium text-on-surface">{notification.message}</p>
                <p className="text-sm text-on-surface-variant mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              {!notification.read && (
                <button onClick={() => handleMarkRead(notification._id)} className="w-full sm:w-auto rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;