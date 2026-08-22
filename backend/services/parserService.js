const pdfParse = require('pdf-parse');

// Comprehensive dictionary of technical and soft skills for extraction
const COMMON_SKILLS = [
  // Languages & Core Web
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'php', 'rust',
  'html', 'html5', 'css', 'css3', 'sass', 'less', 'sql', 'nosql', 'graphql', 'bash', 'shell',
  // Frameworks & Libraries
  'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'angular', 'next.js', 'nuxt.js', 'express', 'express.js',
  'node', 'node.js', 'nodejs', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'laravel', 'rails',
  'tailwind', 'tailwindcss', 'bootstrap', 'material ui', 'redux', 'mobx', 'zustand', 'react native', 'flutter',
  // Databases & Storage
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'supabase',
  // DevOps & Cloud
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform',
  'jenkins', 'github actions', 'gitlab ci', 'circleci', 'ansible', 'linux', 'nginx', 'microservices', 'serverless',
  // Data & AI / ML
  'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'llm', 'nlp', 'tensorflow', 'pytorch',
  'scikit-learn', 'pandas', 'numpy', 'opencv', 'data analysis', 'data science', 'sql query', 'tableau', 'power bi',
  // Methodologies & Tools
  'git', 'github', 'gitlab', 'jira', 'confluence', 'agile', 'scrum', 'kanban', 'rest api', 'restful api',
  'unit testing', 'jest', 'cypress', 'selenium', 'mocha', 'chai', 'ci/cd', 'system architecture',
  // Soft & Management Skills
  'leadership', 'team management', 'problem solving', 'communication', 'project management', 'cross-functional', 'mentorship'
];

/**
 * Parses raw resume text into structured fields.
 */
function extractStructuredData(rawText, filename = 'resume.pdf') {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  // 1. Extract Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = rawText.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extract Phone Number
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = rawText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Extract Candidate Name
  // Heuristic: First line that doesn't look like contact details, or clean filename
  let candidateName = '';
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !phoneRegex.test(line) && line.length < 50 && !/resume|cv|curriculum/i.test(line)) {
      candidateName = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      if (candidateName.length > 2) break;
    }
  }
  if (!candidateName) {
    candidateName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    candidateName = candidateName.charAt(0).toUpperCase() + candidateName.slice(1);
  }

  // 4. Extract Skills
  const lowerText = rawText.toLowerCase();
  const foundSkills = new Set();

  COMMON_SKILLS.forEach(skill => {
    // Regex boundary check to avoid false positives (e.g. "go" inside "good")
    const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(lowerText)) {
      // Normalize casing for display
      const normalizedSkill = skill
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/Js\b/, 'JS')
        .replace(/Css\b/, 'CSS')
        .replace(/Html\b/, 'HTML')
        .replace(/Aws\b/, 'AWS')
        .replace(/Gcp\b/, 'GCP')
        .replace(/Api\b/, 'API')
        .replace(/Sql\b/, 'SQL')
        .replace(/Ci\/cd\b/i, 'CI/CD')
        .replace(/Llm\b/i, 'LLM')
        .replace(/Nlp\b/i, 'NLP')
        .replace(/Ai\b/i, 'AI');
      
      foundSkills.add(normalizedSkill);
    }
  });

  // 5. Estimate Experience Years
  let maxYears = 0;
  const yearMatches = rawText.match(/\b(20\d{2}|19\d{2})\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map(Number).sort((a, b) => a - b);
    const currentYear = new Date().getFullYear();
    const startYear = years[0];
    const endYear = Math.min(years[years.length - 1], currentYear);
    if (endYear > startYear && startYear > 1980) {
      maxYears = Math.min(endYear - startYear, 30);
    }
  }
  // Search for explicit mentions like "5+ years of experience"
  const expMatch = rawText.match(/(\d+)\+?\s*years?\s+(of\s+)?experience/i);
  if (expMatch && expMatch[1]) {
    maxYears = Math.max(maxYears, parseInt(expMatch[1], 10));
  }

  // 6. Extract Education
  const education = [];
  const eduKeywords = ['Bachelor', 'Master', 'Ph.D', 'PhD', 'B.S.', 'M.S.', 'B.Tech', 'M.Tech', 'B.E.', 'Computer Science', 'Degree', 'University', 'Institute', 'College'];
  lines.forEach(line => {
    if (eduKeywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(line))) {
      if (line.length < 120 && !education.includes(line)) {
        education.push(line);
      }
    }
  });

  // 7. Extract Experience Sections
  const experienceLines = [];
  let captureExp = false;
  lines.forEach(line => {
    if (/experience|employment|work history|career/i.test(line) && line.length < 40) {
      captureExp = true;
      return;
    }
    if (/education|projects|skills|certifications|languages/i.test(line) && line.length < 40) {
      captureExp = false;
    }
    if (captureExp && line.length > 5) {
      experienceLines.push(line);
    }
  });

  // 8. Generate Summary
  const summary = lines.slice(0, 6).join(' ').substring(0, 300) + '...';

  return {
    candidate_name: candidateName,
    email: email,
    phone: phone,
    skills: Array.from(foundSkills),
    experience: experienceLines.length > 0 ? experienceLines.slice(0, 10) : ['Professional Software Developer & Specialist'],
    education: education.length > 0 ? education : ['Degree in Computer Science / Related Field'],
    experience_years: maxYears || 3,
    summary: summary
  };
}

/**
 * Reads a PDF buffer or plain text string and returns structured resume data.
 */
async function parseResumeBuffer(buffer, filename) {
  let rawText = '';

  if (filename.toLowerCase().endsWith('.pdf')) {
    try {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || '';
    } catch (err) {
      console.warn('PDF parsing fallback to raw string:', err.message);
      rawText = buffer.toString('utf-8');
    }
  } else {
    rawText = buffer.toString('utf-8');
  }

  const structuredData = extractStructuredData(rawText, filename);

  return {
    raw_text: rawText,
    ...structuredData
  };
}

module.exports = {
  parseResumeBuffer,
  extractStructuredData,
  COMMON_SKILLS
};
