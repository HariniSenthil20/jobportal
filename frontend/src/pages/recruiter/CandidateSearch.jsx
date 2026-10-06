import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, UserCheck, Briefcase, Award, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;

      const res = await api.get('/profiles/candidates/', { params });
      setCandidates(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [search, location]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Talent Pool Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Search candidates across the platform by name, skills, or location</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, skills (e.g. React, Python), summary..."
              style={{ width: '100%', paddingLeft: '40px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ width: '200px', position: 'relative' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location..."
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Searching talent pool...</div>
      ) : candidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <UserCheck size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <h3>No candidates found</h3>
          <p style={{ marginTop: '6px' }}>Try broadening your search query or removing location filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {candidates.map((cand) => (
            <div key={cand.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                    {cand.user?.first_name ? cand.user.first_name[0] : 'C'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>{cand.user?.first_name} {cand.user?.last_name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cand.user?.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {cand.location && (
                    <span><MapPin size={14} inline /> {cand.location}</span>
                  )}
                  {cand.phone && (
                    <span><Phone size={14} inline /> {cand.phone}</span>
                  )}
                  {cand.qualification && (
                    <span><Award size={14} inline /> {cand.qualification}</span>
                  )}
                </div>

                {cand.career_summary && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cand.career_summary}
                  </p>
                )}

                {cand.skills && cand.skills.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Skills & Expertise</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cand.skills.map((skill, idx) => (
                        <span key={idx} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.3)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CandidateSearch;
