import React, { useState, useEffect } from 'react';
import { Settings, Bell, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const SettingsPage = () => {
  const [prefs, setPrefs] = useState({
    app_updates: true,
    status_changes: true,
    deadline_reminders: true,
    messages: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchPrefs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/preferences/');
      if (res.data) setPrefs(res.data);
    } catch (err) {
      console.error("Failed to load preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.put('/notifications/preferences/', prefs);
      setMsg('Notification preferences saved!');
    } catch (err) {
      setError('Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Account Settings & Preferences</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customize alert notifications and application preferences</p>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {msg}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <Bell size={20} color="var(--accent-primary)" /> Notification Preferences
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Application Status Updates</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get notified when recruiters review or update your application status</p>
            </div>
            <input type="checkbox" checked={prefs.status_changes} onChange={() => handleToggle('status_changes')} style={{ width: '20px', height: '20px' }} />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Application Deadline Reminders</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive automated reminders 2 days and 1 day before saved job deadlines expire</p>
            </div>
            <input type="checkbox" checked={prefs.deadline_reminders} onChange={() => handleToggle('deadline_reminders')} style={{ width: '20px', height: '20px' }} />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>New Message Notifications</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alert when candidates or recruiters send chat messages</p>
            </div>
            <input type="checkbox" checked={prefs.messages} onChange={() => handleToggle('messages')} style={{ width: '20px', height: '20px' }} />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>System & Portal Updates</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>General platform notifications and new features</p>
            </div>
            <input type="checkbox" checked={prefs.app_updates} onChange={() => handleToggle('app_updates')} style={{ width: '20px', height: '20px' }} />
          </label>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
