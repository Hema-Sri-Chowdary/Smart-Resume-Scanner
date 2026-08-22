const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api');

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health & System
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },
  async saveSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Resumes
  async getResumes() {
    const res = await fetch(`${API_BASE}/resumes`);
    return handleResponse(res);
  },
  async getResume(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}`);
    return handleResponse(res);
  },
  async uploadResumes(formData) {
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return handleResponse(res);
  },
  async createManualResume(data) {
    const res = await fetch(`${API_BASE}/resumes/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteResume(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Job Descriptions
  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    return handleResponse(res);
  },
  async createJob(jobData) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return handleResponse(res);
  },
  async deleteJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // AI Matching & Shortlisting
  async runMatch(jobId, resumeIds = []) {
    const res = await fetch(`${API_BASE}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, resume_ids: resumeIds })
    });
    return handleResponse(res);
  },
  async getJobMatches(jobId) {
    const res = await fetch(`${API_BASE}/match/job/${jobId}`);
    return handleResponse(res);
  },

  // Sample Data Seed
  async seedSample() {
    const res = await fetch(`${API_BASE}/sample/seed`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
