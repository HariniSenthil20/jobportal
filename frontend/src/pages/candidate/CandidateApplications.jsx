import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Building, MapPin, MessageSquare, AlertCircle, CheckCircle2, History } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/my_applications/');
      setApplications(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this job application?")) return;
    try {
      setWithdrawing(true);
      await api.post(`/applications/${appId}/withdraw/`);
      setMsg("Application withdrawn.");
      fetchApplications();
      if (selectedApp) setSelectedApp(null);
    } catch (err) {
      alert("Failed to withdraw application.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleStartChat = async (app) => {
    try {
      const res = await api.post('/chat/conversations/start/', {
        job_id: app.job.id,
      });
      navigate(`/candidate/messages?conversation=${res.data.id}`);
    } catch (err) {
      alert("Unable to start chat with recruiter.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>My Applications & Timeline</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track real-time status changes and application updates</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No applications found</h3>
          <p style={{ marginTop: '6px' }}>Start applying to open jobs from the search catalog.</p>
          <Link to="/candidate/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map((app) => (
            <div key={app.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>{app.job.title}</h3>
                  <StatusBadge status={app.status} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span><Building size={14} inline /> {app.job.company?.name}</span>
                  <span><MapPin size={14} inline /> {app.job.location}</span>
                  <span><Calendar size={14} inline /> Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setSelectedApp(app)} className="btn btn-secondary btn-sm">
                  <History size={16} /> View Timeline
                </button>
                <button onClick={() => handleStartChat(app)} className="btn btn-secondary btn-sm">
                  <MessageSquare size={16} /> Chat Recruiter
                </button>
                {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && (
                  <button onClick={() => handleWithdraw(app.id)} className="btn btn-danger btn-sm" disabled={withdrawing}>
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={`Application Timeline: ${selectedApp?.job.title}`}
        maxWidth="650px"
      >
        {selectedApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Company</p>
                <p style={{ fontWeight: 600 }}>{selectedApp.job.company?.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status</p>
                <StatusBadge status={selectedApp.status} />
              </div>
            </div>

            {/* Timeline Vertical History List */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Status History Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--accent-primary)' }}>
                {(selectedApp.history || []).map((h, idx) => (
                  <div key={h.id || idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-31px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                      border: '2px solid var(--bg-primary)'
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{h.status.replace('_', ' ')}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    {h.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{h.notes}</p>}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>By {h.changed_by_name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CandidateApplications;
