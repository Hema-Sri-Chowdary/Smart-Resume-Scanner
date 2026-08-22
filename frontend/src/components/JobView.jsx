import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function JobView({ jobs, onRefresh, onNavigateToMatch }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [skillsInput, setSkillsInput] = useState('');
  const [minExp, setMinExp] = useState(3);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Pre-configured quick templates
  const applyTemplate = (template) => {
    if (template === 'fullstack') {
      setTitle('Senior Full Stack Engineer (React & Node.js)');
      setDepartment('Engineering');
      setSkillsInput('React, Node.js, TypeScript, PostgreSQL, Docker, AWS, REST API, GraphQL');
      setMinExp(5);
      setDescription(`We are looking for a Senior Full Stack Engineer to lead front-end and back-end development of our enterprise SaaS platform.\nKey Responsibilities:\n- Build responsive UI in React & TypeScript\n- Build high-performance REST & GraphQL APIs in Node.js\n- Manage SQL databases & Docker microservices.`);
    } else if (template === 'ai') {
      setTitle('AI / Machine Learning Engineer');
      setDepartment('AI Research & Data');
      setSkillsInput('Python, PyTorch, TensorFlow, LLM, NLP, Docker, Machine Learning, SQL');
      setMinExp(3);
      setDescription(`Seeking an AI / ML Engineer to design, fine-tune, and deploy state-of-the-art NLP models and RAG systems.\nResponsibilities:\n- Fine-tune open-source LLMs\n- Implement vector database retrieval\n- Deploy FastAPI inference microservices.`);
    } else if (template === 'devops') {
      setTitle('DevOps & Cloud Infrastructure Lead');
      setDepartment('Platform Operations');
      setSkillsInput('AWS, Kubernetes, Terraform, Docker, CI/CD, Jenkins, Linux, Python');
      setMinExp(4);
      setDescription(`Responsible for maintaining 99.99% uptime and building multi-region AWS cloud infrastructure using Terraform & EKS.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const required_skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      await api.createJob({
        title,
        department,
        required_skills,
        min_experience_years: Number(minExp),
        description
      });

      setStatusMsg({ type: 'success', text: `Job posting "${title}" created successfully!` });
      setTitle('');
      setSkillsInput('');
      setDescription('');
      setShowCreateForm(false);
      onRefresh();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, jobTitle) => {
    if (!window.confirm(`Delete job posting "${jobTitle}"?`)) return;
    try {
      await api.deleteJob(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete job: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Job Descriptions & Criteria</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Create or select job postings with target skills and minimum experience levels.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus size={16} /> {showCreateForm ? 'Close Form' : 'Create Job Posting'}
        </button>
      </div>

      {statusMsg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          color: statusMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Create Job Form Modal/Collapse */}
      {showCreateForm && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>New Job Description</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Fill from template:</span>
              <button type="button" className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => applyTemplate('fullstack')}>Fullstack</button>
              <button type="button" className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => applyTemplate('ai')}>AI/ML</button>
              <button type="button" className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => applyTemplate('devops')}>DevOps</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Frontend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Min Exp (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Required Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, AWS"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Job Description & Responsibilities *</label>
              <textarea
                rows={5}
                placeholder="Provide detailed job specifications, required technical competencies, domain experience, and key duties..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Job Posting'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Postings Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Active Job Postings ({jobs.length})</h3>
        
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <Briefcase size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No job postings available. Click "Create Job Posting" or seed sample jobs.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.map(job => (
              <div key={job.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{job.title}</h4>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                        {job.department || 'General'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                      Minimum Experience: <strong style={{ color: '#fff' }}>{job.min_experience_years || 0} Years</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-emerald"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => onNavigateToMatch(job.id)}
                    >
                      <Sparkles size={14} /> Run AI Match
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                      onClick={() => handleDelete(job.id, job.title)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(job.required_skills || []).map((s, idx) => (
                    <span key={idx} className="skill-chip" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>

                {/* Description snippet */}
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.5', background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px' }}>
                  {job.description}
                </p>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
