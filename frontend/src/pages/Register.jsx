import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...formData, role });
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        const firstErrKey = Object.keys(err.response.data)[0];
        const msg = err.response.data[firstErrKey];
        setError(`${firstErrKey.replace('_', ' ')}: ${Array.isArray(msg) ? msg[0] : msg}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--shadow-glow)', marginBottom: '16px' }}>
            <Briefcase size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join HirePulse as a Candidate or Recruiter</p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn ${role === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 12px', border: 'none' }}
            onClick={() => {
              setRole('candidate');
              setFormData({ username: '', email: '', password: '', first_name: '', last_name: '' });
              setError('');
            }}
          >
            <UserCheck size={16} /> Job Seeker
          </button>
          <button
            type="button"
            className={`btn ${role === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 12px', border: 'none' }}
            onClick={() => {
              setRole('recruiter');
              setFormData({ username: '', email: '', password: '', first_name: '', last_name: '' });
              setError('');
            }}
          >
            <Building size={16} /> Employer / Recruiter
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dummy hidden inputs to catch Chrome/Edge autofill */}
          <input type="text" name="fake_username_remember" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="fake_password_remember" style={{ display: 'none' }} tabIndex="-1" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required autoComplete="off" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required autoComplete="off" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              autoComplete="off"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="off" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              autoComplete="new-password"
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : `Register as ${role === 'recruiter' ? 'Recruiter' : 'Candidate'}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
