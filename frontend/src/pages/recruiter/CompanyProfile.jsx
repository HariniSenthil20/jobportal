import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Users, Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile = () => {
  const { user, updateProfileUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    industry: '',
    location: '',
    website: '',
    company_size: '11-50',
    founded_year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies/my_company/');
      if (res.data && res.data.id) {
        setFormData({
          name: res.data.name || '',
          logo: res.data.logo || '',
          description: res.data.description || '',
          industry: res.data.industry || '',
          location: res.data.location || '',
          website: res.data.website || '',
          company_size: res.data.company_size || '11-50',
          founded_year: res.data.founded_year || new Date().getFullYear(),
        });
      }
    } catch (err) {
      console.log("No company profile found yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    // Prepare payload
    const payload = {
      ...formData,
      website: formData.website.trim(),
      logo: formData.logo.trim(),
      founded_year: formData.founded_year ? parseInt(formData.founded_year, 10) : null
    };

    try {
      const res = await api.post('/companies/save_my_company/', payload);
      setMsg('Company profile saved successfully!');
      updateProfileUser({ company_name: res.data.name });
    } catch (err) {
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          // Format Django DRF field errors object into readable message
          const errors = err.response.data;
          const messages = Object.keys(errors).map((key) => {
            const val = errors[key];
            const detail = Array.isArray(val) ? val.join(', ') : val;
            return `${key.replace('_', ' ')}: ${detail}`;
          });
          setError(messages.join(' | '));
        }
      } else {
        setError('Failed to save company details. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading company details...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Employer Company Profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This information will be displayed on all your posted job listings</p>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {msg}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Company Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Acme Tech Solutions" style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Industry</label>
            <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Software, Finance, Healthcare" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Location (Headquarters)</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. New York, NY" style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Website URL</label>
            <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://acme.com" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Company Size</label>
            <select name="company_size" value={formData.company_size} onChange={handleChange} style={{ width: '100%' }}>
              <option value="1-10">1-10 Employees</option>
              <option value="11-50">11-50 Employees</option>
              <option value="51-200">51-200 Employees</option>
              <option value="201-500">201-500 Employees</option>
              <option value="500+">500+ Employees</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Founded Year</label>
            <input type="number" name="founded_year" value={formData.founded_year} onChange={handleChange} style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Logo Image URL</label>
          <input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://domain.com/logo.png" style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Company Overview / Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe your company culture, mission, and products..." style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
