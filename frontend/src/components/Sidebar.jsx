import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, User, Briefcase, BookmarkCheck, FileText, 
  Bell, MessageSquare, Settings, Building2, PlusCircle, Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { unreadCount, unreadMessageCount } = useNotification();

  if (!user) return null;

  const candidateLinks = [
    { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidate/profile', label: 'Profile', icon: User },
    { to: '/candidate/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/candidate/saved', label: 'Saved Jobs', icon: BookmarkCheck },
    { to: '/candidate/applications', label: 'Applications', icon: FileText },
    { to: '/candidate/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/candidate/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessageCount },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/company', label: 'Company Profile', icon: Building2 },
    { to: '/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
    { to: '/recruiter/jobs/new', label: 'Create Job', icon: PlusCircle },
    { to: '/recruiter/applications', label: 'Applications', icon: FileText },
    { to: '/recruiter/candidates', label: 'Candidates', icon: Users },
    { to: '/recruiter/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/recruiter/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessageCount },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const links = user.role === 'recruiter' ? recruiterLinks : candidateLinks;

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      minHeight: 'calc(100vh - 70px)',
      padding: '24px 16px',
      borderRadius: 0,
      borderRight: '1px solid var(--border-color)',
      borderTop: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ padding: '0 12px 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
          {user.role === 'recruiter' ? 'Recruiter Portal' : 'Candidate Portal'}
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)' : 'transparent',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.2s ease'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} />
                <span>{link.label}</span>
              </div>
              {link.badge > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px'
                }}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
