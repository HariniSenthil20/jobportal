import React, { useState } from 'react';
import { Upload, FileText, Download, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const ResumeUploader = ({ resumes, onUploadSuccess, onDeleteSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // File type validation
    const allowed = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Only PDF, DOC, and DOCX files are allowed.');
      return;
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await api.post('/profiles/resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Resume uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.file?.[0] || err.response?.data?.detail || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/profiles/resumes/${id}/`);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  const handleDownload = async (resume) => {
    try {
      const response = await api.get(`/profiles/resumes/${resume.id}/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download resume file.');
    }
  };

  return (
    <div className="glass-card">
      <h4 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={18} className="text-primary" /> Resume Management
      </h4>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Upload Drop Area */}
      <label style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        cursor: uploading ? 'wait' : 'pointer',
        background: 'rgba(255,255,255,0.01)',
        transition: 'all 0.2s ease',
        marginBottom: '16px'
      }}>
        <Upload size={32} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {uploading ? 'Uploading resume...' : 'Click or drop file to upload resume'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Supported formats: PDF, DOC, DOCX (Max 5MB)
        </span>
        <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" style={{ display: 'none' }} disabled={uploading} />
      </label>

      {/* Resume File List */}
      {resumes && resumes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {resumes.map((r) => (
            <div key={r.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="var(--accent-primary)" />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.filename}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}
                    </span>
                    {r.is_primary && (
                      <span className="badge badge-selected" style={{ fontSize: '0.65rem' }}>Primary</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleDownload(r)}
                  className="btn btn-secondary btn-icon"
                  title="Download Resume"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="btn btn-secondary btn-icon"
                  style={{ color: '#ef4444' }}
                  title="Delete Resume"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
