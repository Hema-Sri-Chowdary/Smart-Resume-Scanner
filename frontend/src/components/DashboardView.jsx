import React from 'react';
import { Users, Briefcase, Award, Sparkles, Plus, Upload, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function DashboardView({ resumes, jobs, onNavigate, onSeedSample, loadingSeed }) {
  const totalResumes = resumes.length;
  const totalJobs = jobs.length;
  const avgExperience = totalResumes > 0 
    ? (resumes.reduce((acc, r) => acc + (r.experience_years || 0), 0) / totalResumes).toFixed(1)
    : '0';

  // Extract all unique skills across resumes
  const allSkills = new Set();
  resumes.forEach(r => (r.skills || []).forEach(s => allSkills.add(s)));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 600, marginBottom: '10px' }}>
            <Sparkles size={14} /> AI Talent Acquisition & Matching
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Intelligent Resume Parsing & Semantic Shortlisting
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', fontSize: '0.95rem' }}>
            Extract candidate skills, work history, and education automatically from PDF resumes. Match talent against job descriptions using Google Gemini LLM scoring with natural language justifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onSeedSample} disabled={loadingSeed}>
            <RefreshCw size={16} className={loadingSeed ? 'spin' : ''} />
            <span>{loadingSeed ? 'Seeding...' : 'Load Sample Resumes & Jobs'}</span>
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('matcher')}>
            <Sparkles size={16} />
            <span>Match Candidates Now</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Parsed Resumes</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{totalResumes}</div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Candidates stored in local SQLite</p>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Active Job Postings</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{totalJobs}</div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Target job descriptions</p>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Unique Skills Extracted</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{allSkills.size}</div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Technical & domain skills detected</p>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Avg Experience</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
              <Zap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{avgExperience} <span style={{ fontSize: '1rem', fontWeight: 500 }}>yrs</span></div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Average candidate experience</p>
        </div>

      </div>

      {/* Grid Section: Quick Actions & Recent Candidates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
        
        {/* Quick Actions */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Quick Workflows</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <button 
              onClick={() => onNavigate('resumes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Upload size={20} style={{ color: '#818cf8' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upload & Parse Resume</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>PDF or raw text candidate import</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#64748b' }} />
            </button>

            <button 
              onClick={() => onNavigate('jobs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Plus size={20} style={{ color: '#34d399' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Create Job Description</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Define required skills & experience</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#64748b' }} />
            </button>

            <button 
              onClick={() => onNavigate('matcher')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles size={20} style={{ color: '#a5b4fc' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#a5b4fc' }}>Run LLM Candidate Shortlist</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>1-10 scoring with justification</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: '#818cf8' }} />
            </button>

          </div>
        </div>

        {/* Recent Candidates List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Recent Candidates</h3>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => onNavigate('resumes')}>
              View All ({resumes.length})
            </button>
          </div>

          {resumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Users size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p>No resumes uploaded yet.</p>
              <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={onSeedSample}>
                Load Sample Resumes
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resumes.slice(0, 4).map(res => (
                <div key={res.id} style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{res.candidate_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{res.email || 'No email specified'} • {res.experience_years} yrs exp</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {(res.skills || []).slice(0, 4).map((s, idx) => (
                        <span key={idx} className="skill-chip" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{s}</span>
                      ))}
                      {(res.skills || []).length > 4 && (
                        <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center' }}>+{(res.skills || []).length - 4} more</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
