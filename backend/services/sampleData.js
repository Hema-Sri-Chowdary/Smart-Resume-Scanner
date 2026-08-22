const { dbHelper } = require('../db/database');

const SAMPLE_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React & Node.js)',
    department: 'Engineering',
    required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'GraphQL'],
    min_experience_years: 5,
    description: `We are looking for a Senior Full Stack Engineer to lead front-end and back-end development of our enterprise SaaS platform.
Key Responsibilities:
- Build responsive, performant user interfaces in React, TypeScript, and modern CSS.
- Architect high-throughput REST APIs and GraphQL microservices in Node.js & Express.
- Manage database schemas in PostgreSQL / SQLite and optimize query performance.
- Containerize services with Docker and deploy to AWS ECS/EKS with CI/CD pipelines.`
  },
  {
    id: 'job-2',
    title: 'AI / Machine Learning Engineer',
    department: 'AI Research & Data',
    required_skills: ['Python', 'PyTorch', 'TensorFlow', 'LLM', 'NLP', 'Docker', 'Machine Learning', 'SQL'],
    min_experience_years: 3,
    description: `Seeking an AI / ML Engineer to design, fine-tune, and deploy state-of-the-art Natural Language Processing (NLP) and Large Language Models (LLM).
Key Responsibilities:
- Fine-tune and evaluate open-source LLMs using PyTorch and Hugging Face Transformers.
- Implement RAG (Retrieval-Augmented Generation) pipelines with vector databases.
- Develop data pipelines in Python, Pandas, NumPy, and SQL.
- Deploy scalable model APIs using FastAPI, Docker, and AWS SageMaker.`
  },
  {
    id: 'job-3',
    title: 'DevOps & Cloud Infrastructure Lead',
    department: 'Platform Operations',
    required_skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Jenkins', 'Linux', 'Python'],
    min_experience_years: 4,
    description: `Join us as a Cloud Infrastructure Lead responsible for maintaining 99.99% uptime and building multi-region AWS cloud infrastructure.
Key Responsibilities:
- Provision Infrastructure-as-Code using Terraform and CloudFormation.
- Manage production Kubernetes clusters (EKS) and Helm charts.
- Automate zero-downtime deployment pipelines with GitHub Actions / Jenkins.
- Enforce security best practices, IAM roles, and cloud cost optimization.`
  }
];

const SAMPLE_RESUMES = [
  {
    id: 'res-1',
    filename: 'Alex_Vance_Fullstack_Resume.pdf',
    candidate_name: 'Alex Vance',
    email: 'alex.vance@techdev.io',
    phone: '+1 (555) 234-5678',
    skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Express.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'REST API', 'Git', 'Tailwind'],
    experience_years: 6,
    education: ['B.S. in Computer Science - Stanford University (2018)'],
    summary: 'Senior Full Stack Engineer with 6+ years of expertise building web apps in React, Node.js, and TypeScript. Proven track record scaled SaaS apps to 500k active users.',
    experience: [
      'Lead Fullstack Developer at CloudScale Inc (2021 - Present): Architected Node.js microservices and React frontend.',
      'Software Engineer at DevStudio (2018 - 2021): Built high-volume REST APIs and PostgreSQL database models.'
    ],
    raw_text: `ALEX VANCE
Email: alex.vance@techdev.io | Phone: +1 (555) 234-5678
San Francisco, CA

SUMMARY
Senior Full Stack Developer with 6+ years of experience leading software development teams. Specialized in JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, AWS, and Docker.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3, SQL
- Frontend: React, Redux, Next.js, Tailwind CSS, Jest
- Backend: Node.js, Express.js, GraphQL, REST API, Microservices
- Databases: PostgreSQL, MongoDB, Redis, SQLite
- Cloud & DevOps: AWS (EC2, S3, ECS), Docker, CI/CD, Git

EXPERIENCE
Lead Fullstack Developer | CloudScale Inc (2021 - Present)
- Designed and delivered responsive React web interface supporting 500k monthly active users.
- Built Node.js & TypeScript microservices backend achieving 99.9% uptime.
- Integrated PostgreSQL database schemas and optimized slow queries by 40%.
- Configured automated Docker containers and deployment scripts on AWS.

Software Engineer | DevStudio (2018 - 2021)
- Developed customer-facing React components and state management with Redux.
- Built RESTful backend endpoints using Express.js and MongoDB.

EDUCATION
B.S. in Computer Science | Stanford University (2018)`
  },
  {
    id: 'res-2',
    filename: 'Dr_Elena_Rostova_AI_Engineer.pdf',
    candidate_name: 'Dr. Elena Rostova',
    email: 'elena.rostova@ai-research.org',
    phone: '+1 (555) 876-5432',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLM', 'NLP', 'Machine Learning', 'Deep Learning', 'Pandas', 'NumPy', 'Docker', 'SQL', 'FastAPI'],
    experience_years: 4,
    education: ['Ph.D. in Computer Science (Artificial Intelligence) - MIT (2022)'],
    summary: 'AI / Machine Learning Specialist with Ph.D. background in Natural Language Processing, LLM fine-tuning, PyTorch, and RAG systems.',
    experience: [
      'Senior AI Research Engineer at NeuralTech Labs (2022 - Present): Led LLM retrieval-augmented generation (RAG) project.',
      'Graduate Researcher at MIT AI Lab (2018 - 2022): Published 4 papers on Transformer architectures and NLP evaluation.'
    ],
    raw_text: `DR. ELENA ROSTOVA
Email: elena.rostova@ai-research.org | Phone: +1 (555) 876-5432
Boston, MA

SUMMARY
AI Engineer and Machine Learning Researcher specializing in Large Language Models (LLMs), NLP, PyTorch, and vector search systems.

TECHNICAL SKILLS
- AI / ML: PyTorch, TensorFlow, LLM, NLP, Hugging Face, Scikit-Learn, Deep Learning
- Programming: Python, C++, SQL, Bash
- Tools: Docker, FastAPI, Pandas, NumPy, Git, Jupyter, AWS SageMaker

WORK EXPERIENCE
Senior AI Research Engineer | NeuralTech Labs (2022 - Present)
- Developed and deployed RAG pipelines using PyTorch, vector databases, and Llama/Gemini APIs.
- Optimized model inference latency by 35% using quantization and FastAPI endpoints.
- Fine-tuned transformer models for domain-specific medical text extraction.

Graduate Research Assistant | MIT Computer Science & AI Lab (2018 - 2022)
- Researched novel transformer attention mechanisms for long-context understanding.
- Co-authored 4 peer-reviewed conference publications in NLP and machine learning.

EDUCATION
Ph.D. in Computer Science (AI & NLP Focus) | Massachusetts Institute of Technology (2022)
B.S. in Applied Mathematics | UC Berkeley (2018)`
  },
  {
    id: 'res-3',
    filename: 'Marcus_Chen_Junior_Frontend.pdf',
    candidate_name: 'Marcus Chen',
    email: 'marcus.chen@devmail.com',
    phone: '+1 (555) 432-1098',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Bootstrap', 'Figma'],
    experience_years: 1,
    education: ['B.A. in Digital Media & Web Design - UC Davis (2024)'],
    summary: 'Enthusiastic Junior Frontend Developer proficient in React, JavaScript, HTML5, CSS3, and UI/UX responsive styling.',
    experience: [
      'Frontend Web Developer Intern at PixelCraft Studio (2024): Designed and developed interactive landing pages.'
    ],
    raw_text: `MARCUS CHEN
Email: marcus.chen@devmail.com | Phone: +1 (555) 432-1098
San Jose, CA

SUMMARY
Junior Web Developer passionate about crafting beautiful user interfaces with HTML, CSS, JavaScript, and React.

TECHNICAL SKILLS
- Frontend: JavaScript (ES6), React, HTML5, CSS3, Bootstrap, Tailwind
- Design & Tools: Figma, Git, GitHub, VS Code

EXPERIENCE
Frontend Web Developer Intern | PixelCraft Studio (2024)
- Built 8+ responsive web pages using React and Bootstrap.
- Collaborated with UI designers to implement pixel-perfect Figma layouts.
- Fixed cross-browser CSS rendering bugs across mobile and desktop devices.

EDUCATION
B.A. in Digital Media & Web Design | UC Davis (2024)`
  }
];

async function seedSampleData() {
  console.log('[Seed] Populating sample jobs and resumes into SQLite...');
  
  for (const job of SAMPLE_JOBS) {
    await dbHelper.run(
      `INSERT OR REPLACE INTO jobs (id, title, department, required_skills, min_experience_years, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [job.id, job.title, job.department, JSON.stringify(job.required_skills), job.min_experience_years, job.description]
    );
  }

  for (const res of SAMPLE_RESUMES) {
    await dbHelper.run(
      `INSERT OR REPLACE INTO resumes (id, filename, candidate_name, email, phone, raw_text, skills, experience, education, experience_years, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        res.id,
        res.filename,
        res.candidate_name,
        res.email,
        res.phone,
        res.raw_text,
        JSON.stringify(res.skills),
        JSON.stringify(res.experience),
        JSON.stringify(res.education),
        res.experience_years,
        res.summary
      ]
    );
  }

  console.log('[Seed] Sample data seeding complete!');
}

module.exports = { seedSampleData, SAMPLE_JOBS, SAMPLE_RESUMES };
