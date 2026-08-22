import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ResumeView from './components/ResumeView';
import JobView from './components/JobView';
import MatcherView from './components/MatcherView';
import SettingsView from './components/SettingsView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [targetJobIdForMatch, setTargetJobIdForMatch] = useState('');
  const [loadingSeed, setLoadingSeed] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resData, jobsData, healthData] = await Promise.all([
        api.getResumes().catch(() => []),
        api.getJobs().catch(() => []),
        api.getHealth().catch(() => ({ has_api_key: false }))
      ]);
      setResumes(resData);
      setJobs(jobsData);
      setSystemStatus(healthData);
    } catch (err) {
      console.warn('Initial data load error:', err.message);
    }
  };

  const handleSeedSample = async () => {
    setLoadingSeed(true);
    try {
      await api.seedSample();
      await fetchInitialData();
    } catch (err) {
      alert('Failed to seed sample data: ' + err.message);
    } finally {
      setLoadingSeed(false);
    }
  };

  const navigateToMatchWithJob = (jobId) => {
    setTargetJobIdForMatch(jobId);
    setActiveTab('matcher');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
      />

      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            resumes={resumes}
            jobs={jobs}
            onNavigate={setActiveTab}
            onSeedSample={handleSeedSample}
            loadingSeed={loadingSeed}
          />
        )}

        {activeTab === 'resumes' && (
          <ResumeView
            resumes={resumes}
            onRefresh={fetchInitialData}
            onSeedSample={handleSeedSample}
          />
        )}

        {activeTab === 'jobs' && (
          <JobView
            jobs={jobs}
            onRefresh={fetchInitialData}
            onNavigateToMatch={navigateToMatchWithJob}
          />
        )}

        {activeTab === 'matcher' && (
          <MatcherView
            jobs={jobs}
            resumes={resumes}
            initialJobId={targetJobIdForMatch}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            systemStatus={systemStatus}
            onRefreshStatus={fetchInitialData}
          />
        )}
      </main>

      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        ResuMatch AI Platform • Powered by Node.js, Express, SQLite & Google Gemini API • 100% Free-Tier Enabled
      </footer>
    </div>
  );
}
