const { GoogleGenerativeAI } = require('@google/generative-ai');
const { dbHelper } = require('../db/database');

/**
 * Retrieves configured Gemini API Key from process environment or Database settings.
 */
async function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  try {
    const row = await dbHelper.get('SELECT value FROM settings WHERE key = ?', ['gemini_api_key']);
    return row ? row.value : null;
  } catch (err) {
    return null;
  }
}

/**
 * Fallback semantic heuristic matcher when LLM is unavailable or unconfigured.
 */
function heuristicMatch(resume, job) {
  const reqSkills = Array.isArray(job.required_skills)
    ? job.required_skills
    : (typeof job.required_skills === 'string' ? JSON.parse(job.required_skills || '[]') : []);

  const candSkills = Array.isArray(resume.skills)
    ? resume.skills
    : (typeof resume.skills === 'string' ? JSON.parse(resume.skills || '[]') : []);

  const candSkillsLower = candSkills.map(s => s.toLowerCase());
  const rawTextLower = (resume.raw_text || '').toLowerCase();

  const matchedSkills = [];
  const missingSkills = [];

  reqSkills.forEach(req => {
    const reqLower = req.toLowerCase();
    if (candSkillsLower.includes(reqLower) || rawTextLower.includes(reqLower)) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // Calculate skill overlap percentage
  const skillRatio = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) : 0.8;
  const skillMatchPct = Math.round(skillRatio * 100);

  // Experience level fit
  const reqYears = job.min_experience_years || 0;
  const candYears = resume.experience_years || 0;
  const expRatio = reqYears > 0 ? Math.min(candYears / reqYears, 1.25) : 1.0;

  // Composite Score (1 to 10 scale)
  let rawScore = (skillRatio * 6.5) + (expRatio * 2.5) + 1.0;
  // Cap between 1.0 and 9.8
  const score = Math.round(Math.min(Math.max(rawScore, 1.5), 9.8) * 10) / 10;

  // Fit Level
  let fitLevel = 'Moderate Fit';
  if (score >= 8.5) fitLevel = 'Excellent Fit';
  else if (score >= 7.0) fitLevel = 'Strong Fit';
  else if (score >= 5.0) fitLevel = 'Moderate Fit';
  else fitLevel = 'Weak Fit';

  // Strengths & Weaknesses
  const strengths = [];
  if (matchedSkills.length > 0) {
    strengths.push(`Possesses key required technical skills: ${matchedSkills.slice(0, 4).join(', ')}.`);
  }
  if (candYears >= reqYears && reqYears > 0) {
    strengths.push(`Meets or exceeds experience requirement (${candYears} years vs ${reqYears} years required).`);
  } else if (candYears > 0) {
    strengths.push(`Brings ${candYears} years of practical industry experience.`);
  }
  if (resume.education && resume.education.length > 0) {
    strengths.push(`Strong academic background: ${resume.education[0]}.`);
  }

  const weaknesses = [];
  if (missingSkills.length > 0) {
    weaknesses.push(`Missing key target competencies: ${missingSkills.slice(0, 4).join(', ')}.`);
  }
  if (candYears < reqYears) {
    weaknesses.push(`Slightly under minimum experience requirement (${candYears} years vs ${reqYears} years required).`);
  }

  // Rationale & Justification
  const justification = `${resume.candidate_name || 'Candidate'} scored ${score}/10 (${fitLevel}) for the position of "${job.title}". ` +
    `The candidate demonstrates ${skillMatchPct}% alignment with the required skills, matching ${matchedSkills.length} out of ${reqSkills.length} core requirements (${matchedSkills.join(', ') || 'None'}). ` +
    (candYears >= reqYears ? `Their ${candYears} years of experience align well with the target role standard. ` : `While their experience level (${candYears} years) is slightly below the preferred ${reqYears} years, `) +
    (missingSkills.length > 0 ? `To be fully competitive, onboarding or upskilling in ${missingSkills.join(', ')} is recommended.` : `They present a well-rounded technical profile with minimal skill gaps.`);

  return {
    score: score,
    fit_level: fitLevel,
    skill_match_percentage: skillMatchPct,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    strengths: strengths,
    weaknesses: weaknesses,
    justification: justification
  };
}

/**
 * Evaluates candidate resume against job description using Google Gemini API
 * Prompt requirement: "Compare the following resume with this job description and rate fit on 1–10 with justification."
 */
async function compareResumeWithJob(resume, job) {
  const apiKey = await getGeminiApiKey();

  if (!apiKey) {
    console.log('[LLM Engine] No Gemini API key provided. Using built-in semantic heuristic matcher.');
    return heuristicMatch(resume, job);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert HR Talent Acquisition & Technical Screener.

Task: Compare the following resume with this job description and rate fit on 1–10 with justification.

JOB TITLE: ${job.title}
JOB DESCRIPTION:
${job.description}
REQUIRED SKILLS: ${Array.isArray(job.required_skills) ? job.required_skills.join(', ') : job.required_skills}
MINIMUM YEARS OF EXPERIENCE: ${job.min_experience_years || 0} years

CANDIDATE NAME: ${resume.candidate_name}
CANDIDATE YEARS OF EXPERIENCE: ${resume.experience_years}
CANDIDATE EXTRACTED SKILLS: ${Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}
CANDIDATE EDUCATION: ${Array.isArray(resume.education) ? resume.education.join(', ') : resume.education}
CANDIDATE RESUME FULL TEXT:
${resume.raw_text}

Provide your response in strictly valid JSON format without markdown code fences or additional commentary.
Return JSON with the following exact keys:
{
  "score": (number between 1.0 and 10.0),
  "fit_level": (string: "Excellent Fit" | "Strong Fit" | "Moderate Fit" | "Weak Fit"),
  "skill_match_percentage": (number between 0 and 100),
  "matched_skills": [(array of matching skill strings)],
  "missing_skills": [(array of missing or weak skill strings)],
  "strengths": [(array of candidate key strength strings)],
  "weaknesses": [(array of candidate potential gap strings)],
  "justification": "(a clear 3-4 sentence detailed justification explaining the fit rating, matching strengths, gaps, and recommendation)"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Sanitize JSON text output (remove markdown blocks if model included ```json ... ```)
    const jsonText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonText);

    return {
      score: typeof parsed.score === 'number' ? Math.round(parsed.score * 10) / 10 : 7.0,
      fit_level: parsed.fit_level || 'Strong Fit',
      skill_match_percentage: parsed.skill_match_percentage || 75,
      matched_skills: parsed.matched_skills || [],
      missing_skills: parsed.missing_skills || [],
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      justification: parsed.justification || 'Candidate evaluated with LLM match score.'
    };

  } catch (err) {
    console.warn('[LLM Engine] Gemini API call failed/quota exceeded, falling back to semantic heuristic matcher:', err.message);
    return heuristicMatch(resume, job);
  }
}

module.exports = {
  compareResumeWithJob,
  getGeminiApiKey,
  heuristicMatch
};
