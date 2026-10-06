import React from 'react';
import { MapPin, DollarSign, Calendar, Briefcase, Bookmark, BookmarkCheck, Building, Clock, GraduationCap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job, onSelect, onToggleSave, isCandidate }) => {
  const isSaved = job.is_saved;
  const hasApplied = job.has_applied;

  const getSalaryText = () => {
    if (job.min_salary && job.max_salary) {
      return `${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}`;
    } else if (job.min_salary) {
      return `From ${job.min_salary.toLocaleString()}`;
    } else if (job.max_salary) {
      return `Up to ${job.max_salary.toLocaleString()}`;
    }
    return 'Competitive Salary';
  };

  const isNearingDeadline = () => {
    if (!job.deadline) return false;
    const diffDays = (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 2;
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            overflow: 'hidden'
          }}>
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Building size={24} />
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => onSelect(job)}>
              {job.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {job.company?.name || 'Company'}
            </p>
          </div>
        </div>

        {isCandidate && (
          <button
            onClick={() => onToggleSave(job)}
            className="btn btn-secondary btn-icon"
            style={{ color: isSaved ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            title={isSaved ? 'Remove Bookmark' : 'Save Job'}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        )}
      </div>

      {/* Meta Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} /> {job.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarSign size={14} /> {getSalaryText()}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Briefcase size={14} /> {job.work_mode?.replace('_', ' ')}
        </span>
        {job.qualification && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <GraduationCap size={14} /> {job.qualification}
          </span>
        )}
      </div>

      {/* Skills Badges */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {job.required_skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              {skill}
            </span>
          ))}
          {job.required_skills.length > 4 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{job.required_skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Deadline Alert Banner */}
      {isNearingDeadline() && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          fontSize: '0.8rem',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Clock size={14} /> ⚠️ Application closes soon! (Deadline: {new Date(job.deadline).toLocaleDateString()})
        </div>
      )}

      {/* Footer / Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </span>

        <button
          onClick={() => onSelect(job)}
          className={`btn ${hasApplied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          disabled={hasApplied}
        >
          {hasApplied ? 'Applied' : 'View Details & Apply'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
