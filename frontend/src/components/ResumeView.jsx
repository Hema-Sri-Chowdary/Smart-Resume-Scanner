import React, { useState } from 'react';
import { Upload, FileText, Trash2, Eye, Plus, CheckCircle, AlertCircle, User, Briefcase, GraduationCap, X } from 'lucide-react';
import { api } from '../services/api';

export default function ResumeView({ resumes, onRefresh, onSeedSample }) {
  const [uploadMode, setUploadMode] = useState('pdf'); // 'pdf' or 'text'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualName, setManualName] = useState('');
  const [activeModalResume, setActiveModalResume] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Handle Drag & Drop / File Select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Submit PDF Upload
  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('resumes', file));

      const res = await api.uploadResumes(formData);
      setStatusMsg({ type: 'success', text: res.message });
      setSelectedFiles([]);
      onRefresh();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  // Submit Manual Text
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    setUploading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await api.createManualResume({ candidate_name: manualName, raw_text: manualText });
      setStatusMsg({ type: 'success', text: `Resume for "${res.candidate_name}" parsed and added successfully!` });
      setManualText('');
      setManualName('');
      onRefresh();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  // Delete Resume
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete candidate "${name}"?`)) return;
    try {
      await api.deleteResume(id);
      onRefresh();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner & Uploader Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Resume Parser & Data Extraction</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Upload PDF or text resumes. Extracted skills, contact details, experience, and education will be automatically structured.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setUploadMode('pdf')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: uploadMode === 'pdf' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: uploadMode === 'pdf' ? '#818cf8' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              PDF / File Upload
            </button>
            <button
              onClick={() => setUploadMode('text')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: uploadMode === 'text' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: uploadMode === 'text' ? '#818cf8' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Paste Text Resume
            </button>
          </div>
        </div>

        {/* Notification Status Msg */}
        {statusMsg.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: statusMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'
          }}>
            {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Upload Mode: PDF */}
        {uploadMode === 'pdf' ? (
          <form onSubmit={handlePdfSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              border: '2px dashed rgba(99, 102, 241, 0.35)',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}>
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="resume-file-input"
              />
              <label htmlFor="resume-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Upload size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Click to select PDF or text resumes</div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Supports single file or batch multi-file uploads (Up to 15MB each)</p>
                </div>
              </label>

              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {selectedFiles.map((f, idx) => (
                    <span key={idx} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600 }}>
                      📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={selectedFiles.length === 0 || uploading}>
                {uploading ? 'Parsing & Extracting...' : `Parse ${selectedFiles.length} Selected File(s)`}
              </button>
            </div>
          </form>
        ) : (
          /* Upload Mode: Text */
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Candidate Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Raw Resume Text</label>
              <textarea
                rows={6}
                placeholder="Paste complete candidate resume text including contact information, technical skills, work history, and education..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Parsing...' : 'Parse & Add Resume'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Candidate Resumes Table / Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Parsed Candidates Pool ({resumes.length})</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>All structured candidate profiles stored in database</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={onSeedSample}>
            + Seed Sample Resumes
          </button>
        </div>

        {resumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <FileText size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No candidate resumes parsed yet. Upload a PDF or load sample candidates.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {resumes.map(res => (
              <div key={res.id} className="glass-panel glass-panel-hover" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{res.candidate_name}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{res.email || 'No email'} {res.phone ? `• ${res.phone}` : ''}</p>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {res.experience_years} Yrs Exp
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '10px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {res.summary}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '12px' }}>
                    {(res.skills || []).slice(0, 6).map((s, idx) => (
                      <span key={idx} className="skill-chip">{s}</span>
                    ))}
                    {(res.skills || []).length > 6 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>+{(res.skills || []).length - 6} more</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>File: {res.filename}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => setActiveModalResume(res)}
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      onClick={() => handleDelete(res.id, res.candidate_name)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Resume Detailed Modal */}
      {activeModalResume && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveModalResume(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
                {activeModalResume.candidate_name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{activeModalResume.candidate_name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{activeModalResume.email || 'N/A'} • {activeModalResume.phone || 'N/A'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} /> Extracted Technical Skills ({activeModalResume.skills?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(activeModalResume.skills || []).map((s, idx) => (
                    <span key={idx} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={16} /> Education & Academic Credentials
                </h4>
                <ul style={{ paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.88rem' }}>
                  {(activeModalResume.education || []).map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
                  Executive Summary & Work Experience ({activeModalResume.experience_years} Years)
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px' }}>
                  {activeModalResume.summary}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                  Raw Resume File Text
                </h4>
                <pre style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {activeModalResume.raw_text}
                </pre>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
