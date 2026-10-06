import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const CreateEditJob = () => {
  const { id } = useParams(); // If present, editing mode
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    required_skills_input: '',
    qualification: '',
    work_mode: 'REMOTE',
    employment_type: 'FULL_TIME',
    experience_level: 'MID',
    min_salary: '',
    max_salary: '',
    location: '',
    deadline: '',
    status: 'PUBLISHED',
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          const res = await api.get(`/jobs/${id}/`);
          const job = res.data;
          setFormData({
            title: job.title || '',
            description: job.description || '',
            responsibilities: job.responsibilities || '',
            requirements: job.requirements || '',
            required_skills_input: (job.required_skills || []).join(', '),
            qualification: job.qualification || '',
            work_mode: job.work_mode || 'REMOTE',
            employment_type: job.employment_type || 'FULL_TIME',
            experience_level: job.experience_level || 'MID',
            min_salary: job.min_salary || '',
            max_salary: job.max_salary || '',
            location: job.location || '',
            deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : '',
            status: job.status || 'PUBLISHED',
          });
        } catch (err) {
          setError('Failed to load job details for editing.');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.min_salary && formData.max_salary && Number(formData.min_salary) > Number(formData.max_salary)) {
      setError('Minimum salary cannot exceed maximum salary.');
      return;
    }

    if (new Date(formData.deadline) <= new Date()) {
      setError('Application deadline must be a future date/time.');
      return;
    }

    const skillsArray = formData.required_skills_input
      ? formData.required_skills_input.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      title: formData.title,
      description: formData.description,
      responsibilities: formData.responsibilities,
      qualification: formData.qualification,
      work_mode: formData.work_mode,
      employment_type: formData.employment_type,
      experience_level: formData.experience_level,
      location: formData.location,
      min_salary: formData.min_salary ? Number(formData.min_salary) : null,
      max_salary: formData.max_salary ? Number(formData.max_salary) : null,
      deadline: new Date(formData.deadline).toISOString(),
      required_skills: skillsArray,
      status: formData.status || 'PUBLISHED'
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await api.put(`/jobs/${id}/`, payload);
      } else {
        await api.post('/jobs/', payload);
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      if (err.response?.data) {
        const firstKey = Object.keys(err.response.data)[0];
        const msg = err.response.data[firstKey];
        setError(`${firstKey}: ${Array.isArray(msg) ? msg[0] : msg}`);
      } else {
        setError('Failed to save job post.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading job form...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/recruiter/jobs')} className="btn btn-secondary btn-icon">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>{isEdit ? 'Edit Job Posting' : 'Create New Job Listing'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fill in job role criteria, compensation, and application deadline</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Job Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior Full-Stack Engineer" style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Work Mode</label>
            <select name="work_mode" value={formData.work_mode} onChange={handleChange} style={{ width: '100%' }}>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Employment Type</label>
            <select name="employment_type" value={formData.employment_type} onChange={handleChange} style={{ width: '100%' }}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Experience Level</label>
            <select name="experience_level" value={formData.experience_level} onChange={handleChange} style={{ width: '100%' }}>
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior Level</option>
              <option value="LEAD">Lead / Executive</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="San Francisco, CA or Remote" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Min Salary</label>
            <input type="number" name="min_salary" value={formData.min_salary} onChange={handleChange} placeholder="80000" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Max Salary</label>
            <input type="number" name="max_salary" value={formData.max_salary} onChange={handleChange} placeholder="120000" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Application Deadline *</label>
          <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Educational Qualification (e.g. B.E / B.Tech / MCA)</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. B.E / B.Tech / B.Sc Computer Science" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Required Skills (Comma-separated)</label>
            <input type="text" name="required_skills_input" value={formData.required_skills_input} onChange={handleChange} placeholder="React, Python, Django, PostgreSQL" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Job Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} placeholder="Describe the role overview and goals..." style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Key Responsibilities</label>
          <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows={4} placeholder="List day-to-day responsibilities..." style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <button type="button" onClick={() => navigate('/recruiter/jobs')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Save size={18} /> {submitting ? 'Saving Job...' : isEdit ? 'Update Job' : 'Publish Job Listing'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateEditJob;
