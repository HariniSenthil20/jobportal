import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, BookmarkCheck, UserCheck, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await api.get('/profiles/candidate/me/');
        setProfile(profRes.data);

        const appsRes = await api.get('/applications/my_applications/');
        setApplications(appsRes.data.results || appsRes.data || []);

        const savedRes = await api.get('/jobs/saved/');
        setSavedCount((savedRes.data.results || savedRes.data || []).length);
      } catch (err) {
        console.error("Error loading candidate dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completionPct = profile?.completion_percentage || user?.completion_percentage || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(17,24,39,0.8) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            Welcome back, {user?.first_name || user?.username}! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Discover top job openings, track your application statuses, and manage your career profile.
          </p>
        </div>
        <Link to="/candidate/jobs" className="btn btn-primary">
          Browse Jobs <ArrowRight size={18} />
        </Link>
      </div>

      {/* Completion Alert if score < 100% */}
      {completionPct < 100 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle color="#f59e0b" size={24} />
            <div>
              <h4 style={{ color: '#f59e0b', fontSize: '0.95rem' }}>Complete your profile ({completionPct}%)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Recruiters prioritize candidates with completed profiles and uploaded resumes.
              </p>
            </div>
          </div>
          <Link to="/candidate/profile" className="btn btn-secondary btn-sm">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{applications.length}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Submitted Applications</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookmarkCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{savedCount}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Saved Jobs</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completionPct}%</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profile Score</p>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Recent Applications</h3>
          <Link to="/candidate/applications" style={{ fontSize: '0.9rem', fontWeight: 600 }}>View All</Link>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            <Briefcase size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/candidate/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Search Jobs
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Job Title</th>
                  <th style={{ padding: '12px' }}>Company</th>
                  <th style={{ padding: '12px' }}>Applied On</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{app.job.title}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{app.job.company?.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CandidateDashboard;
