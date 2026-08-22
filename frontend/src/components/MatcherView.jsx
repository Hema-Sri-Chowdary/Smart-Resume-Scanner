import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, Download, CheckCircle2, XCircle, Award, Check, AlertCircle, FileSpreadsheet, User, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function MatcherView({ jobs, resumes, initialJobId }) {
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || (jobs[0]?.id || ''));
  const [selectedResumeIds, setSelectedResumeIds] = useState([]); // Empty = match all
  const [minScoreFilter, setMinScoreFilter] = useState(5.0);
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Auto load previous cached match results when selecting job
  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
    }
  }, [initialJobId]);

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId);
      setCurrentJob(job || null);
      fetchJobMatches(selectedJobId);
    }
  }, [selectedJobId, jobs]);

  const fetchJobMatches = async (jobId) => {
    try {
      const data = await api.getJobMatches(jobId);
      setResults(data);
    } catch (err) {
      console.warn('Failed to load cached matches:', err.message);
    }
  };

  // Run AI LLM Matcher
  const handleRunMatch = async () => {
    if (!selectedJobId) return;

    setMatching(true);
    setStatusMsg('');
    try {
      const res = await api.runMatch(selectedJobId, selectedResumeIds);
      setResults(res.results || []);
      setCurrentJob(res.job || null);
      setStatusMsg(res.message);

      // Trigger celebration confetti if top candidate score is >= 8.5
      if (res.results && res.results.length > 0 && res.results[0].score >= 8.0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert('Matching failed: ' + err.message);
    } finally {
      setMatching(false);
    }
  };

  // Toggle individual candidate selection
  const toggleResumeSelection = (resId) => {
    if (selectedResumeIds.includes(resId)) {
      setSelectedResumeIds(selectedResumeIds.filter(id => id !== resId));
    } else {
      setSelectedResumeIds([...selectedResumeIds, resId]);
    }
  };

  // Filtered & Shortlisted Candidates
  const filteredResults = results.filter(r => r.score >= minScoreFilter);

  // Export Shortlist to CSV
  const exportToCSV = () => {
    if (filteredResults.length === 0) return;

    const headers = ['Rank', 'Candidate Name', 'Email', 'Phone', 'Fit Rating (1-10)', 'Fit Level', 'Match %', 'Matched Skills', 'Missing Skills', 'Justification'];
    const rows = filteredResults.map((r, idx) => [
      idx + 1,
      `"${r.candidate_name}"`,
      `"${r.candidate_email || ''}"`,
      `"${r.candidate_phone || ''}"`,
      r.score,
      `"${r.fit_level}"`,
      `${r.skill_match_percentage}%`,
      `"${(r.matched_skills || []).join(', ')}"`,
      `"${(r.missing_skills || []).join(', ')}"`,
      `"${(r.justification || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Candidate_Shortlist_${currentJob?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Config Panel */}
      <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={13} /> LLM Semantic Matcher
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>AI Candidate Shortlisting Engine</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Evaluates resumes against job descriptions, computes 1–10 fit ratings, and generates justifications.</p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRunMatch}
            disabled={matching || !selectedJobId || resumes.length === 0}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Sparkles size={18} className={matching ? 'spin' : ''} />
            <span>{matching ? 'Evaluating with LLM...' : '⚡ Run AI Match & Shortlist'}</span>
          </button>
        </div>

        {/* Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '16px' }}>
          
          {/* Select Job Posting */}
          <div>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              1. Select Target Job Description
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(15, 23, 42, 0.9)' }}
            >
              {jobs.length === 0 && <option value="">No Job Postings Available</option>}
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.min_experience_years || 0}+ Yrs Exp)</option>
              ))}
            </select>
          </div>

          {/* Candidate Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                2. Select Candidates ({selectedResumeIds.length === 0 ? 'All Resumes Selected' : `${selectedResumeIds.length} Selected`})
              </label>
              {selectedResumeIds.length > 0 && (
                <button style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setSelectedResumeIds([])}>
                  Select All
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '70px', overflowY: 'auto', padding: '6px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {resumes.map(r => {
                const isSelected = selectedResumeIds.length === 0 || selectedResumeIds.includes(r.id);
                return (
                  <span
                    key={r.id}
                    onClick={() => toggleResumeSelection(r.id)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#a5b4fc' : '#64748b',
                      border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}{r.candidate_name}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Filter & Export Toolbar */}
      {results.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '0.88rem', fontWeight: 600 }}>
              <Filter size={16} /> Shortlist Filter:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Min Fit Score: <strong>{minScoreFilter.toFixed(1)} / 10</strong></span>
              <input
                type="range"
                min="1.0"
                max="9.5"
                step="0.5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(parseFloat(e.target.value))}
                style={{ width: '130px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Showing <strong style={{ color: '#fff' }}>{filteredResults.length}</strong> of {results.length} evaluated candidate(s)
            </span>
            <button className="btn btn-emerald" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={exportToCSV}>
              <Download size={15} /> Export Shortlist (CSV)
            </button>
          </div>

        </div>
      )}

      {/* Results Shortlist List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {matching && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#818cf8' }}>
            <Sparkles size={36} className="spin" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Analyzing Candidate Profiles & Job Criteria...</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Computing semantic skill alignment, experience fit, and generating AI justification.</p>
          </div>
        )}

        {!matching && results.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Award size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem' }}>No evaluation results yet for this job description.</p>
            <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={handleRunMatch}>
              Run AI Match Now
            </button>
          </div>
        )}

        {!matching && filteredResults.map((item, index) => {
          // Determine badge color class based on score
          let badgeClass = 'score-badge-weak';
          if (item.score >= 8.5) badgeClass = 'score-badge-excellent';
          else if (item.score >= 7.0) badgeClass = 'score-badge-strong';
          else if (item.score >= 5.0) badgeClass = 'score-badge-moderate';

          return (
            <div
              key={item.id || index}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '24px',
                border: item.score >= 8.5 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Left: Candidate Info & Rank */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '280px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.08)',
                    color: index === 0 ? '#fff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    boxShadow: index === 0 ? '0 0 12px rgba(245, 158, 11, 0.5)' : 'none'
                  }}>
                    #{index + 1}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{item.candidate_name}</h3>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.score >= 8.5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: item.score >= 8.5 ? '#34d399' : '#818cf8',
                        border: `1px solid ${item.score >= 8.5 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                      }}>
                        {item.fit_level}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                      {item.candidate_email || 'N/A'} • {item.experience_years} Years Experience • {item.skill_match_percentage}% Skill Overlap
                    </p>
                  </div>
                </div>

                {/* Right: Score Gauge Ring (1-10 Scale) */}
                <div className={`score-badge ${badgeClass}`}>
                  <span style={{ fontSize: '1.35rem', lineHeight: '1' }}>{item.score}</span>
                  <span style={{ fontSize: '0.62rem', opacity: 0.7, textTransform: 'uppercase', tracking: '0.05em' }}>out of 10</span>
                </div>

              </div>

              {/* Skills Breakdown */}
              <div style={{ margin: '18px 0', padding: '14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '8px' }}>
                    ✓ Matched Skills ({(item.matched_skills || []).length}):
                  </span>
                  <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {(item.matched_skills || []).map((s, idx) => (
                      <span key={idx} className="skill-chip skill-chip-match">{s}</span>
                    ))}
                    {(item.matched_skills || []).length === 0 && <span style={{ fontSize: '0.78rem', color: '#64748b' }}>None</span>}
                  </div>
                </div>

                {(item.missing_skills || []).length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '8px' }}>
                      ✕ Missing Target Skills ({(item.missing_skills || []).length}):
                    </span>
                    <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {(item.missing_skills || []).map((s, idx) => (
                        <span key={idx} className="skill-chip skill-chip-missing">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LLM Justification Narrative */}
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
                borderLeft: '4px solid #6366f1'
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> AI Fit Justification & Rationale:
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {item.justification}
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
