import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Linkedin, Github, Globe, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ResumeUploader from '../../components/ResumeUploader';

const CandidateProfile = () => {
  const { user, updateProfileUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    career_summary: '',
    qualification: '',
    skills_input: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profiles/candidate/me/');
      setProfile(res.data);
      setFormData({
        first_name: res.data.user?.first_name || '',
        last_name: res.data.user?.last_name || '',
        phone: res.data.phone || '',
        location: res.data.location || '',
        career_summary: res.data.career_summary || '',
        qualification: res.data.qualification || '',
        skills_input: (res.data.skills || []).join(', '),
        linkedin_url: res.data.linkedin_url || '',
        github_url: res.data.github_url || '',
        portfolio_url: res.data.portfolio_url || '',
      });
      setResumes(res.data.resumes || []);
    } catch (err) {
      console.error("Error fetching candidate profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const skillsArray = formData.skills_input
        ? formData.skills_input.split(',').map((s) => s.strip ? s.strip() : s.trim()).filter(Boolean)
        : [];

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        location: formData.location,
        career_summary: formData.career_summary,
        qualification: formData.qualification,
        skills: skillsArray,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        portfolio_url: formData.portfolio_url,
      };

      const res = await api.put('/profiles/candidate/me/', payload);
      setProfile(res.data);
      updateProfileUser({ first_name: formData.first_name, last_name: formData.last_name });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  }

  const completionScore = profile?.completion_percentage || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Header & Completion Score Bar */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Manage Candidate Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Keep your details current to attract recruiters</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{completionScore}%</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion Score</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ width: `${completionScore}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary) 0%, #10b981 100%)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Personal Information</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Location (City, Country)</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Qualification</label>
          <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. B.Sc. Computer Science" style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Career Summary</label>
          <textarea name="career_summary" value={formData.career_summary} onChange={handleChange} rows={4} placeholder="Briefly describe your experience and goals..." style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Skills (Comma-separated)</label>
          <input type="text" name="skills_input" value={formData.skills_input} onChange={handleChange} placeholder="e.g. React, Python, Django, PostgreSQL, Docker" style={{ width: '100%' }} />
        </div>

        <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '12px' }}>Social & Portfolio Links</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>LinkedIn URL</label>
            <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>GitHub URL</label>
            <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/..." style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Portfolio URL</label>
            <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://myportfolio.com" style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Resume Management Component */}
      <ResumeUploader
        resumes={resumes}
        onUploadSuccess={fetchProfile}
        onDeleteSuccess={fetchProfile}
      />

    </div>
  );
};

export default CandidateProfile;
