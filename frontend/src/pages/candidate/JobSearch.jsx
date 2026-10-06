import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, DollarSign, Briefcase, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import JobCard from '../../components/JobCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

const JobSearch = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [empType, setEmpType] = useState('');
  const [expLevel, setExpLevel] = useState('');
  const [postedDate, setPostedDate] = useState('');

  // Application Modal state
  const [coverLetter, setCoverLetter] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applying, setApplying] = useState(false);
  const [appSuccess, setAppSuccess] = useState('');
  const [appError, setAppError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (workMode) params.work_mode = workMode;
      if (empType) params.employment_type = empType;
      if (expLevel) params.experience_level = expLevel;
      if (postedDate) params.posted_date = postedDate;

      const res = await api.get('/jobs/', { params });
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, location, workMode, empType, expLevel, postedDate]);

  const fetchUserResumes = async () => {
    if (user && user.role === 'candidate') {
      try {
        const res = await api.get('/profiles/resumes/');
        const rList = res.data.results || res.data || [];
        setResumes(rList);
        const primary = rList.find((r) => r.is_primary) || rList[0];
        if (primary) setSelectedResumeId(primary.id);
      } catch (err) {
        console.error("Failed to load candidate resumes:", err);
      }
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setAppSuccess('');
    setAppError('');
    setCoverLetter('');
    fetchUserResumes();
  };

  const handleToggleSave = async (job) => {
    if (!user || user.role !== 'candidate') return;
    try {
      if (job.is_saved) {
        await api.delete(`/jobs/saved/remove-by-job/${job.id}/`);
      } else {
        await api.post('/jobs/saved/', { job_id: job.id });
      }
      fetchJobs();
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setAppError('');
    setAppSuccess('');

    if (!selectedResumeId && resumes.length === 0) {
      setAppError('Please upload a resume in your profile before applying.');
      return;
    }

    try {
      setApplying(true);
      await api.post('/applications/apply/', {
        job_id: selectedJob.id,
        resume_id: selectedResumeId || undefined,
        cover_letter: coverLetter
      });
      setAppSuccess('Application submitted successfully!');
      fetchJobs();
      setTimeout(() => {
        setSelectedJob(null);
      }, 1500);
    } catch (err) {
      setAppError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Header & Filter Controls */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Browse Active Job Opportunities</h2>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, skills, keywords..."
              style={{ width: '100%', paddingLeft: '40px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ width: '180px', position: 'relative' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Multi-Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
            <option value="">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          <select value={empType} onChange={(e) => setEmpType(e.target.value)}>
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          <select value={expLevel} onChange={(e) => setExpLevel(e.target.value)}>
            <option value="">All Experience</option>
            <option value="ENTRY">Entry Level</option>
            <option value="MID">Mid Level</option>
            <option value="SENIOR">Senior Level</option>
            <option value="LEAD">Lead / Executive</option>
          </select>

          <select value={postedDate} onChange={(e) => setPostedDate(e.target.value)}>
            <option value="">Anytime</option>
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* Jobs Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Searching jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No matching jobs found</h3>
          <p style={{ marginTop: '6px' }}>Try broadening your search or adjusting filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={handleSelectJob}
              onToggleSave={handleToggleSave}
              isCandidate={user && user.role === 'candidate'}
            />
          ))}
        </div>
      )}

      {/* Job Details & Application Modal */}
      <Modal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title || 'Job Details'}
        maxWidth="750px"
      >
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header info */}
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>{selectedJob.title}</h2>
              <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '1rem' }}>
                {selectedJob.company?.name} • {selectedJob.location}
              </p>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <span className="badge badge-applied">{selectedJob.employment_type?.replace('_', ' ')}</span>
              <span className="badge badge-shortlisted">{selectedJob.work_mode}</span>
              <span className="badge badge-interview">{selectedJob.experience_level} LEVEL</span>
              {selectedJob.qualification && (
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.4)', fontWeight: 600 }}>
                  🎓 {selectedJob.qualification}
                </span>
              )}
              <span className="badge badge-selected">
                Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
              </span>
            </div>

            {/* Description & Responsibilities */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Job Description</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {selectedJob.description}
              </p>
            </div>

            {selectedJob.responsibilities && (
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Key Responsibilities</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {selectedJob.responsibilities}
                </p>
              </div>
            )}

            {/* Required Skills */}
            {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Required Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedJob.required_skills.map((s, idx) => (
                    <span key={idx} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.3)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Section */}
            {user && user.role === 'candidate' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                {selectedJob.has_applied ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={20} /> You have already submitted an application for this job.
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>Submit Application</h4>

                    {appError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} inline /> {appError}
                      </div>
                    )}

                    {appSuccess && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} inline /> {appSuccess}
                      </div>
                    )}

                    {/* Resume Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Resume</label>
                      {resumes.length === 0 ? (
                        <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>No uploaded resume found. Upload a resume in profile first.</p>
                      ) : (
                        <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} required style={{ width: '100%' }}>
                          {resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.filename} {r.is_primary ? '(Primary)' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Cover Letter (Optional)</label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                        placeholder="Explain why you are a great fit for this role..."
                        style={{ width: '100%' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={applying}>
                      {applying ? 'Submitting Application...' : 'Confirm & Apply'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default JobSearch;
