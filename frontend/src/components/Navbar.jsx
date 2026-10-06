import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Bell, User, LogOut, Settings, MessageSquare, CheckCircle, Trash2, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset dropdowns on route navigation or login state change
  useEffect(() => {
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  }, [location.pathname, user]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)', padding: '0 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--shadow-glow)' }}>
            <Briefcase size={22} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, #fff 0%, #9ca3af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HirePulse
          </span>
        </Link>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ position: 'relative' }}
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowUserDropdown(false);
                  }}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-primary)'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '360px',
                    maxHeight: '480px',
                    overflowY: 'auto',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Notifications</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifDropdown(false)}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Close notifications"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No notifications yet</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)',
                              borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--accent-primary)',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <strong style={{ fontSize: '0.85rem', color: n.is_read ? 'var(--text-secondary)' : '#fff' }}>{n.title}</strong>
                              <button
                                onClick={() => deleteNotification(n.id)}
                                style={{ background: 'none', color: 'var(--text-muted)', padding: '2px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.message}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  style={{ gap: '8px', padding: '6px 12px' }}
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifDropdown(false);
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                    {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.first_name || user.username}</span>
                  <span className={`badge ${user.role === 'recruiter' ? 'badge-interview' : 'badge-shortlisted'}`}>
                    {user.role}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {showUserDropdown && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '220px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <Link
                      to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                      className="btn btn-secondary"
                      style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <User size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="btn btn-secondary"
                      style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <Settings size={16} /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn btn-secondary"
                      style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', color: '#ef4444' }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
