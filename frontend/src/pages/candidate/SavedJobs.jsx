import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Trash2, MapPin, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/saved/');
      setSavedJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await api.delete(`/jobs/saved/remove-by-job/${jobId}/`);
      fetchSavedJobs();
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>My Saved Jobs</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bookmark jobs to review and apply later</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading saved jobs...</div>
      ) : savedJobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookmarkCheck size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No saved jobs found</h3>
          <p style={{ marginTop: '6px' }}>Bookmark job posts from the search page to view them here.</p>
          <Link to="/candidate/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            Explore Jobs <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {savedJobs.map((item) => {
            const job = item.job;
            return (
              <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{job.title}</h3>
                  <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>
                    {job.company?.name}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span><MapPin size={14} inline /> {job.location}</span>
                    <span><Calendar size={14} inline /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    <span><Calendar size={14} inline /> Saved: {new Date(item.saved_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <Link to={`/candidate/jobs`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    Apply Now
                  </Link>
                  <button onClick={() => handleRemove(job.id)} className="btn btn-secondary btn-icon" style={{ color: '#ef4444' }} title="Remove Bookmark">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
