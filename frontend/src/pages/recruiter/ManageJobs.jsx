import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, Calendar, Users, Briefcase } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/my_jobs/');
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load recruiter jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await api.patch(`/jobs/${job.id}/toggle_status/`, { status: newStatus });
      fetchMyJobs();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) return;
    try {
      await api.delete(`/jobs/${id}/`);
      fetchMyJobs();
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Manage Job Listings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View applicant counts, edit requirements, or close postings</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">
          <PlusCircle size={18} /> Post New Job
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading posted jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No job postings found</h3>
          <p style={{ marginTop: '6px' }}>Create your first job listing to start receiving candidate applications.</p>
          <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Post Job</Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }} className="glass-panel">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px' }}>Job Title</th>
                <th style={{ padding: '16px' }}>Location</th>
                <th style={{ padding: '16px' }}>Applications</th>
                <th style={{ padding: '16px' }}>Deadline</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{job.title}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{job.location}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{job.applications_count || 0}</span> applicants
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {new Date(job.deadline).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${job.status === 'PUBLISHED' ? 'badge-selected' : job.status === 'EXPIRED' ? 'badge-rejected' : 'badge-withdrawn'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="btn btn-secondary btn-sm"
                        title="Toggle Status"
                      >
                        {job.status === 'PUBLISHED' ? 'Close' : 'Publish'}
                      </button>
                      <button
                        onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                        className="btn btn-secondary btn-icon"
                        title="Edit Job"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="btn btn-secondary btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ManageJobs;
