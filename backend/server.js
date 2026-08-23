const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { dbHelper } = require('./db/database');
const { parseResumeBuffer } = require('./services/parserService');
const { compareResumeWithJob, getGeminiApiKey } = require('./services/llmService');
const { seedSampleData } = require('./services/sampleData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Upload directory for PDF files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB file size limit
});

// Helper UUID fallback generator
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// -------------------------------------------------------------
// 1. HEALTH & SYSTEM ROUTES
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const apiKey = await getGeminiApiKey();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    llm_provider: apiKey ? 'Google Gemini AI (Live API)' : 'Built-in Fallback Semantic Matcher (Offline Free Mode)',
    has_api_key: Boolean(apiKey)
  });
});

// -------------------------------------------------------------
// 2. SETTINGS ROUTES
// -------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const keyRow = await dbHelper.get('SELECT value FROM settings WHERE key = ?', ['gemini_api_key']);
    res.json({
      gemini_api_key: keyRow && keyRow.value ? `${keyRow.value.substring(0, 6)}...${keyRow.value.substring(keyRow.value.length - 4)}` : '',
      is_configured: Boolean(keyRow && keyRow.value) || Boolean(process.env.GEMINI_API_KEY)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { gemini_api_key } = req.body;
    if (gemini_api_key !== undefined) {
      await dbHelper.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        ['gemini_api_key', gemini_api_key.trim()]
      );
    }
    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. RESUME ROUTES (Upload, Parse, List, Delete)
// -------------------------------------------------------------

// Upload PDF/TXT Resumes (Supports single & multi-file upload!)
app.post('/api/resumes/upload', upload.array('resumes', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No resume files uploaded' });
    }

    const savedResumes = [];

    for (const file of req.files) {
      const parsedData = await parseResumeBuffer(file.buffer, file.originalname);
      const resumeId = generateId('res');

      await dbHelper.run(
        `INSERT INTO resumes (id, filename, candidate_name, email, phone, raw_text, skills, experience, education, experience_years, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resumeId,
          file.originalname,
          parsedData.candidate_name,
          parsedData.email,
          parsedData.phone,
          parsedData.raw_text,
          JSON.stringify(parsedData.skills),
          JSON.stringify(parsedData.experience),
          JSON.stringify(parsedData.education),
          parsedData.experience_years,
          parsedData.summary
        ]
      );

      savedResumes.push({
        id: resumeId,
        filename: file.originalname,
        candidate_name: parsedData.candidate_name,
        email: parsedData.email,
        phone: parsedData.phone,
        skills: parsedData.skills,
        experience_years: parsedData.experience_years,
        summary: parsedData.summary
      });
    }

    res.status(201).json({
      message: `Successfully parsed and stored ${savedResumes.length} candidate resume(s)`,
      resumes: savedResumes
    });

  } catch (err) {
    console.error('Upload parsing error:', err);
    res.status(500).json({ error: 'Failed to process and parse resume files: ' + err.message });
  }
});

// Create candidate manually via plain text resume input
app.post('/api/resumes/manual', async (req, res) => {
  try {
    const { candidate_name, raw_text } = req.body;
    if (!raw_text) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const { parseResumeBuffer } = require('./services/parserService');
    const parsedData = await parseResumeBuffer(Buffer.from(raw_text), candidate_name ? `${candidate_name}.txt` : 'candidate_resume.txt');
    
    if (candidate_name) {
      parsedData.candidate_name = candidate_name;
    }

    const resumeId = generateId('res');

    await dbHelper.run(
      `INSERT INTO resumes (id, filename, candidate_name, email, phone, raw_text, skills, experience, education, experience_years, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resumeId,
        `${parsedData.candidate_name}.txt`,
        parsedData.candidate_name,
        parsedData.email,
        parsedData.phone,
        parsedData.raw_text,
        JSON.stringify(parsedData.skills),
        JSON.stringify(parsedData.experience),
        JSON.stringify(parsedData.education),
        parsedData.experience_years,
        parsedData.summary
      ]
    );

    res.status(201).json({
      message: 'Resume parsed and added successfully',
      id: resumeId,
      ...parsedData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all parsed candidate resumes
app.get('/api/resumes', async (req, res) => {
  try {
    const rows = await dbHelper.all('SELECT * FROM resumes ORDER BY created_at DESC');
    const formatted = rows.map(r => ({
      ...r,
      skills: r.skills ? JSON.parse(r.skills) : [],
      experience: r.experience ? JSON.parse(r.experience) : [],
      education: r.education ? JSON.parse(r.education) : []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single candidate resume by ID
app.get('/api/resumes/:id', async (req, res) => {
  try {
    const row = await dbHelper.get('SELECT * FROM resumes WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Resume not found' });

    row.skills = row.skills ? JSON.parse(row.skills) : [];
    row.experience = row.experience ? JSON.parse(row.experience) : [];
    row.education = row.education ? JSON.parse(row.education) : [];

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete candidate resume
app.delete('/api/resumes/:id', async (req, res) => {
  try {
    await dbHelper.run('DELETE FROM resumes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------------------------------------------------
// 4. JOB DESCRIPTION ROUTES (Create, List, Delete)
// -------------------------------------------------------------

// Create job posting
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, department, required_skills, min_experience_years, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Job title and description are required' });
    }

    const jobId = generateId('job');
    const skillsArr = Array.isArray(required_skills)
      ? required_skills
      : (typeof required_skills === 'string' ? required_skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    await dbHelper.run(
      `INSERT INTO jobs (id, title, department, required_skills, min_experience_years, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [jobId, title, department || 'General', JSON.stringify(skillsArr), min_experience_years || 0, description]
    );

    res.status(201).json({
      id: jobId,
      title,
      department: department || 'General',
      required_skills: skillsArr,
      min_experience_years: min_experience_years || 0,
      description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all job postings
app.get('/api/jobs', async (req, res) => {
  try {
    const rows = await dbHelper.all('SELECT * FROM jobs ORDER BY created_at DESC');
    const formatted = rows.map(r => ({
      ...r,
      required_skills: r.required_skills ? JSON.parse(r.required_skills) : []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete job description
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await dbHelper.run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job posting deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------------------------------------------------
// 5. LLM MATCHING & SHORTLISTING ROUTE
// -------------------------------------------------------------
/**
 * POST /api/match
 * Payload: { job_id: "job-1", resume_ids: ["res-1", "res-2"] (optional, defaults to all resumes) }
 */
app.post('/api/match', async (req, res) => {
  try {
    const { job_id, resume_ids } = req.body;
    if (!job_id) {
      return res.status(400).json({ error: 'job_id is required for matching' });
    }

    // Get Job Details
    const jobRow = await dbHelper.get('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (!jobRow) {
      return res.status(404).json({ error: 'Job description not found' });
    }
    const job = {
      ...jobRow,
      required_skills: jobRow.required_skills ? JSON.parse(jobRow.required_skills) : []
    };

    // Get Resumes to match
    let resumeRows = [];
    if (Array.isArray(resume_ids) && resume_ids.length > 0) {
      const placeholders = resume_ids.map(() => '?').join(',');
      resumeRows = await dbHelper.all(`SELECT * FROM resumes WHERE id IN (${placeholders})`, resume_ids);
    } else {
      resumeRows = await dbHelper.all('SELECT * FROM resumes');
    }

    if (resumeRows.length === 0) {
      return res.status(400).json({ error: 'No resumes available to match against this job description.' });
    }

    const matchResults = [];

    for (const resRow of resumeRows) {
      const resume = {
        ...resRow,
        skills: resRow.skills ? JSON.parse(resRow.skills) : [],
        experience: resRow.experience ? JSON.parse(resRow.experience) : [],
        education: resRow.education ? JSON.parse(resRow.education) : []
      };

      // Run LLM evaluation (Prompt: Compare resume with job description, rate 1-10 with justification)
      const evalResult = await compareResumeWithJob(resume, job);
      const matchId = generateId('match');

      // Save / Update match result in SQLite
      await dbHelper.run(
        `INSERT OR REPLACE INTO match_results 
         (id, job_id, resume_id, score, fit_level, skill_match_percentage, matched_skills, missing_skills, justification, strengths, weaknesses)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          matchId,
          job.id,
          resume.id,
          evalResult.score,
          evalResult.fit_level,
          evalResult.skill_match_percentage,
          JSON.stringify(evalResult.matched_skills),
          JSON.stringify(evalResult.missing_skills),
          evalResult.justification,
          JSON.stringify(evalResult.strengths),
          JSON.stringify(evalResult.weaknesses)
        ]
      );

      matchResults.push({
        id: matchId,
        job_id: job.id,
        job_title: job.title,
        resume_id: resume.id,
        candidate_name: resume.candidate_name,
        candidate_email: resume.email,
        candidate_phone: resume.phone,
        experience_years: resume.experience_years,
        candidate_skills: resume.skills,
        score: evalResult.score,
        fit_level: evalResult.fit_level,
        skill_match_percentage: evalResult.skill_match_percentage,
        matched_skills: evalResult.matched_skills,
        missing_skills: evalResult.missing_skills,
        strengths: evalResult.strengths,
        weaknesses: evalResult.weaknesses,
        justification: evalResult.justification
      });
    }

    // Sort candidates descending by match score (Shortlisted top fit first!)
    matchResults.sort((a, b) => b.score - a.score);

    res.json({
      message: `Evaluated ${matchResults.length} candidate(s) for "${job.title}"`,
      job: job,
      results: matchResults
    });

  } catch (err) {
    console.error('Matching API error:', err);
    res.status(500).json({ error: 'LLM Matcher failed: ' + err.message });
  }
});

// Fetch cached match results for a given job ID
app.get('/api/match/job/:jobId', async (req, res) => {
  try {
    const rows = await dbHelper.all(
      `SELECT m.*, r.candidate_name, r.email as candidate_email, r.phone as candidate_phone, r.experience_years, r.skills as candidate_skills
       FROM match_results m
       JOIN resumes r ON m.resume_id = r.id
       WHERE m.job_id = ?
       ORDER BY m.score DESC`,
      [req.params.jobId]
    );

    const formatted = rows.map(r => ({
      ...r,
      candidate_skills: r.candidate_skills ? JSON.parse(r.candidate_skills) : [],
      matched_skills: r.matched_skills ? JSON.parse(r.matched_skills) : [],
      missing_skills: r.missing_skills ? JSON.parse(r.missing_skills) : [],
      strengths: r.strengths ? JSON.parse(r.strengths) : [],
      weaknesses: r.weaknesses ? JSON.parse(r.weaknesses) : []
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. SAMPLE SEEDING ROUTE
// -------------------------------------------------------------
app.post('/api/sample/seed', async (req, res) => {
  try {
    await seedSampleData();
    res.json({ message: 'Sample jobs and resumes seeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build files in production or when dist folder exists
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log('[Server] Serving static frontend build from:', frontendDist);
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Start Express Server
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(` Resume Parser & LLM Matcher API running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
  // Seed sample data on first start if empty
  try {
    const resCount = await dbHelper.get('SELECT COUNT(*) as count FROM resumes');
    if (resCount.count === 0) {
      await seedSampleData();
    }
  } catch (err) {
    console.warn('Initial seed check error:', err.message);
  }
});
