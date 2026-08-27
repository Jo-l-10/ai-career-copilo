// Open-source skills and keywords taxonomy based on O*NET & Lightcast Open Skills
export const SKILLS_TAXONOMY = {
  technical: [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "R", "SQL", "HTML", "HTML5", "CSS", "CSS3", "Bash", "Shell",
    // Frontend
    "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "Redux", "Tailwind CSS", "Bootstrap", "Webpack", "Vite", "Responsive Design", "DOM Manipulation", "REST APIs", "GraphQL", "WebSockets",
    // Backend & Frameworks
    "Node.js", "Express", "Express.js", "Django", "FastAPI", "Flask", "Spring Boot", ".NET Core", "Ruby on Rails", "NestJS", "Microservices", "RESTful Architecture", "gRPC",
    // Databases
    "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Supabase", "Firebase", "Firestore", "DynamoDB", "Cassandra", "Oracle DB", "Database Design", "Indexing", "Query Optimization",
    // Cloud & DevOps
    "AWS", "Google Cloud", "GCP", "Microsoft Azure", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Terraform", "Linux", "Nginx", "Serverless", "Cloud Functions",
    // Data & AI / ML
    "Data Analysis", "Data Science", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "Power BI", "Tableau", "Apache Spark", "BigQuery", "Data Visualization", "ETL Pipelines", "NLP", "Computer Vision", "LLM", "Prompt Engineering"
  ],
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "Postman", "Docker Desktop", "Figma", "Jira", "Confluence", "Trello", "Slack", "Linux CLI", "npm", "yarn", "Excel", "Advanced Excel", "Jupyter Notebook", "Google Analytics", "Vercel", "Netlify"
  ],
  soft_skills: [
    "Problem Solving", "Communication", "Team Collaboration", "Critical Thinking", "Time Management", "Adaptability", "Leadership", "Agile Methodologies", "Scrum", "Code Review", "Attention to Detail", "Project Management", "Analytical Thinking", "Self-Motivation", "Presentation Skills"
  ],
  certifications: [
    "AWS Certified Solutions Architect", "AWS Certified Cloud Practitioner", "Google Cloud Associate Cloud Engineer", "Meta Front-End Developer Professional Certificate", "CompTIA Security+", "Microsoft Certified: Azure Fundamentals", "Oracle Certified Professional Java", "Scrum Master (CSM)"
  ],
  languages: [
    "English", "Spanish", "French", "German", "Mandarin", "Hindi", "Arabic", "Portuguese", "Japanese"
  ]
};

// Flattened list for fast lookup
export const ALL_CANONICAL_SKILLS = [
  ...SKILLS_TAXONOMY.technical,
  ...SKILLS_TAXONOMY.tools,
  ...SKILLS_TAXONOMY.soft_skills
];

export function normalizeSkill(skill) {
  if (!skill) return "";
  return skill.trim().toLowerCase().replace(/[\.\-_]/g, "");
}

export function findCanonicalSkill(rawText) {
  if (!rawText) return null;
  const clean = rawText.trim().toLowerCase();
  
  // Exact match
  for (const s of ALL_CANONICAL_SKILLS) {
    if (s.toLowerCase() === clean) return s;
  }

  // Common aliases
  const aliases = {
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
    "reactjs": "React",
    "vuejs": "Vue",
    "nodejs": "Node.js",
    "expressjs": "Express",
    "postgres": "PostgreSQL",
    "mongo": "MongoDB",
    "powerbi": "Power BI",
    "gcp": "Google Cloud",
    "k8s": "Kubernetes",
    "git hub": "GitHub",
    "ml": "Machine Learning",
    "ai": "Artificial Intelligence",
    "nlp": "NLP",
    "bi": "Business Intelligence",
    "scrum/agile": "Agile Methodologies",
    "ci cd": "CI/CD"
  };

  if (aliases[clean]) return aliases[clean];

  return null;
}
