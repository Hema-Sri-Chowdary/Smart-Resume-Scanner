import React, { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle2, Shield, ExternalLink, Cpu, Info } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({ systemStatus, onRefreshStatus }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [keyConfigured, setKeyConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setKeyConfigured(data.is_configured);
    } catch (err) {
      console.warn('Failed to load settings:', err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.saveSettings({ gemini_api_key: geminiKey });
      setMsg({ type: 'success', text: 'Gemini API Key saved successfully!' });
      setGeminiKey('');
      setKeyConfigured(Boolean(geminiKey.trim()));
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Key size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>LLM Provider & API Settings</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Configure free Google Gemini API Key for live AI scoring & parsing.</p>
          </div>
        </div>

        {msg.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '0.88rem',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: msg.type === 'success' ? '#6ee7b7' : '#fca5a5'
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              placeholder={keyConfigured ? '•••••••••••••••• (API Key Configured)' : 'Paste your Gemini API key (AIZA...)'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
              Get a 100% free API Key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>
                Google AI Studio <ExternalLink size={12} style={{ display: 'inline' }} />
              </a>. Free tier includes 15 requests/minute & 1,500 requests/day.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save API Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Free Tier Info & System Status Card */}
      <div className="glass-panel" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Zero-Cost Resource Guarantee
        </h3>
        <ul style={{ paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6' }}>
          <li><strong>Free Gemini API:</strong> Uses Google AI Studio free tier for zero API charges.</li>
          <li><strong>Local PDF Parsing:</strong> `pdf-parse` runs 100% locally on your computer with no external document API dependencies.</li>
          <li><strong>Embedded SQLite Database:</strong> Stores candidate resumes and match reports locally in `./data/resume_matcher.db`.</li>
          <li><strong>Built-in Offline Engine:</strong> If no API key is provided, the application runs a local semantic matching algorithm.</li>
        </ul>
      </div>

    </div>
  );
}
