import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle2, Users, PlusCircle, AlertTriangle, ArrowRight, Building } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/jobs/recruiter_dashboard/');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load recruiter dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  const stats = data?.stats || { active_jobs: 0, total_applications: 0, shortlisted: 0, interviews: 0, selected: 0 };
  const endingSoon = data?.ending_soon_jobs || [];
  const recentApps = data?.recent_applications || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Recruiter Welcome Header */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(17,24,39,0.8) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            Employer Dashboard {user?.company_name ? `• ${user.company_name}` : ''}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track application funnel stats, review top candidates, and manage job listings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/recruiter/company" className="btn btn-secondary">
            <Building size={18} /> Company Profile
          </Link>
          <Link to="/recruiter/jobs/new" className="btn btn-primary">
            <PlusCircle size={18} /> Post New Job
          </Link>
        </div>
      </div>

      {/* Recruiter Analytics Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.active_jobs}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Job Posts</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total_applications}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Applications</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.shortlisted}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shortlisted</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.interviews}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interviews</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.selected}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hired / Selected</p>
          </div>
        </div>
      </div>

      {/* Jobs Ending Soon Banner */}
      {endingSoon.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ color: '#f59e0b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={18} /> Jobs Closing Soon ({endingSoon.length})
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {endingSoon.map((j) => (
              <span key={j.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                {j.title} • Deadline: {new Date(j.deadline).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Recent Applicant Submissions</h3>
          <Link to="/recruiter/applications" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Review Applicants Board</Link>
        </div>

        {recentApps.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>No applications received yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Candidate Name</th>
                  <th style={{ padding: '12px' }}>Job Applied</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{app.candidate_name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{app.job_title}</td>
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

export default RecruiterDashboard;
