import React from 'react';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotification();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Notification Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Stay updated on application status changes and reminders</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            <CheckCircle2 size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            <Bell size={40} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)',
                  borderLeft: n.is_read ? '4px solid transparent' : '4px solid var(--accent-primary)',
                  display: 'flex',
                  justify: 'space-between',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: n.is_read ? 'var(--text-secondary)' : '#fff' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.message}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="btn btn-secondary btn-icon" style={{ color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
