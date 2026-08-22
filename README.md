# Smart Resume Scanner & AI Job Matcher 🚀

Intelligently parse resumes, extract skills & metadata, and match candidates against job descriptions using Google Gemini LLM scoring with natural language justifications.

---

## 🌟 Key Features

- **PDF & Text Resume Parsing**: Extracts structured candidate data (Name, Email, Phone, Technical & Soft Skills, Experience Years, Education, Summary).
- **Job Description Management**: Create job postings with required skills, minimum experience thresholds, and domain criteria.
- **LLM Fit Scoring & Justification**: Rates candidate fit on a 1–10 scale with matched/missing skill chips and natural language AI rationale using Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`).
- **100% Free-Tier Enabled**: Uses Google AI Studio free tier + embedded SQLite database + built-in offline fallback matcher.
- **Shortlist Export**: Filter candidates by minimum score threshold and export shortlist reports to CSV.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/Hema-Sri-Chowdary/Smart-Resume-Scanner.git
cd Smart-Resume-Scanner
npm run install:all
```

### 2. Start Both Backend & Frontend
```bash
npm start
```
- **Backend API**: `http://localhost:5000`
- **Frontend Dashboard**: `http://localhost:5173`

---

## ☁️ Deployment Instructions

### Option 1: Deploy to Render (Recommended for Free Hosting)

1. Sign up / Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/Hema-Sri-Chowdary/Smart-Resume-Scanner`.
4. Configure Web Service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. (Optional) Add Environment Variable `GEMINI_API_KEY` under **Environment**.
6. Click **Deploy Web Service**! Render will automatically build the frontend and serve it alongside the Node.js Express backend.

---

### Option 2: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import `Smart-Resume-Scanner` repository from GitHub.
4. Vercel will automatically detect `vercel.json` and deploy both the static frontend and serverless API endpoints.
5. Click **Deploy**!

---

## 📄 License
MIT License.
