import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Download, MessageSquare, CheckCircle2, AlertCircle, Eye, Edit3 } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const ApplicantReview = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected Candidate Modal state
  const [activeApp, setActiveApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateErr, setUpdateErr] = useState('');

  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/my_jobs/');
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load recruiter jobs:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedJobId) params.job_id = selectedJobId;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/applications/job_applications/', { params });
      setApplications(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId, selectedStatus]);

  const handleOpenApp = (app) => {
    setActiveApp(app);
    setNewStatus(app.status);
    setStatusNotes('');
    setUpdateMsg('');
    setUpdateErr('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdateErr('');
    setUpdateMsg('');
    try {
      setUpdating(true);
      await api.patch(`/applications/${activeApp.id}/update_status/`, {
        status: newStatus,
        notes: statusNotes
      });
      setUpdateMsg(`Status updated to ${newStatus.replace('_', ' ')}! Candidate notified.`);
      fetchApplications();
      setTimeout(() => {
        setActiveApp(null);
      }, 1200);
    } catch (err) {
      setUpdateErr(err.response?.data?.detail || 'Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async (resumeId, filename) => {
    try {
      const response = await api.get(`/profiles/resumes/${resumeId}/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download resume file.");
    }
  };

  const handleStartChat = async (app) => {
    try {
      const res = await api.post('/chat/conversations/start/', {
        job_id: app.job.id,
        user_id: app.candidate.id,
      });
      navigate(`/recruiter/messages?conversation=${res.data.id}`);
    } catch (err) {
      alert("Failed to start chat with candidate.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Filter Controls */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Candidate Applicant Review</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Screen resumes, update applicant statuses, and schedule interviews</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} style={{ minWidth: '180px' }}>
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ minWidth: '160px' }}>
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected / Hired</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading applicant submissions...</div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No applications found</h3>
          <p style={{ marginTop: '6px' }}>No candidate applications match the selected job filter.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px' }}>Candidate</th>
                <th style={{ padding: '16px' }}>Job Applied</th>
                <th style={{ padding: '16px' }}>Applied Date</th>
                <th style={{ padding: '16px' }}>Resume</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>{app.candidate.first_name} {app.candidate.last_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{app.candidate.email}</div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{app.job.title}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {app.resume ? (
                      <button
                        onClick={() => handleDownloadResume(app.resume.id, app.resume.filename)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', gap: '4px' }}
                      >
                        <Download size={14} /> {app.resume.filename}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No resume</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button onClick={() => handleOpenApp(app)} className="btn btn-primary btn-sm">
                        <Eye size={16} /> Review
                      </button>
                      <button onClick={() => handleStartChat(app)} className="btn btn-secondary btn-icon" title="Chat Candidate">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant Review Modal */}
      <Modal
        isOpen={Boolean(activeApp)}
        onClose={() => setActiveApp(null)}
        title={`Review Candidate: ${activeApp?.candidate.first_name} ${activeApp?.candidate.last_name}`}
        maxWidth="700px"
      >
        {activeApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Profile Overview */}
            <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{activeApp.candidate.first_name} {activeApp.candidate.last_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeApp.candidate.email}</p>
                {activeApp.candidate_profile?.phone && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>Phone: {activeApp.candidate_profile.phone}</p>
                )}
                {activeApp.candidate_profile?.location && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location: {activeApp.candidate_profile.location}</p>
                )}
                {activeApp.candidate_profile?.qualification && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qualification: {activeApp.candidate_profile.qualification}</p>
                )}
              </div>
              <div>
                {activeApp.resume && (
                  <button
                    onClick={() => handleDownloadResume(activeApp.resume.id, activeApp.resume.filename)}
                    className="btn btn-primary btn-sm"
                  >
                    <Download size={16} /> Download Resume
                  </button>
                )}
              </div>
            </div>

            {/* Candidate Skills & Cover Letter */}
            {activeApp.candidate_profile?.skills && activeApp.candidate_profile.skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Candidate Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeApp.candidate_profile.skills.map((s, idx) => (
                    <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeApp.cover_letter && (
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Cover Letter</h4>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {activeApp.cover_letter}
                </div>
              </div>
            )}

            {/* Update Status Form */}
            <form onSubmit={handleUpdateStatus} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={18} color="var(--accent-primary)" /> Update Application Status
              </h4>

              {updateMsg && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} inline /> {updateMsg}
                </div>
              )}

              {updateErr && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} inline /> {updateErr}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>New Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required style={{ width: '100%' }}>
                    <option value="APPLIED">APPLIED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="SELECTED">SELECTED / HIRED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Notes / Remarks (Sent to Candidate)</label>
                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="e.g. Interview scheduled for Monday at 10 AM EST"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving Status...' : 'Update Status & Notify Candidate'}
                </button>
              </div>
            </form>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default ApplicantReview;
