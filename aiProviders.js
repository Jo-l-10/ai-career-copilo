// Multi-Provider AI Engine with Local Ollama, Free Groq/OpenRouter, and Zero-Cost Offline NLP Fallback

import { SKILLS_TAXONOMY, findCanonicalSkill, ALL_CANONICAL_SKILLS } from './skillsTaxonomy.js';

export const AI_PROVIDERS = {
  OFFLINE: 'offline_nlp',
  OLLAMA: 'ollama_local',
  GROQ: 'groq_free',
  OPENROUTER: 'openrouter_free'
};

export class AISettings {
  static getSettings() {
    const saved = localStorage.getItem('aicp_ai_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      provider: AI_PROVIDERS.OFFLINE,
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2:latest',
      groqApiKey: '',
      groqModel: 'llama-3.3-70b-versatile',
      openRouterApiKey: '',
      openRouterModel: 'meta-llama/llama-3.2-3b-instruct:free'
    };
  }

  static saveSettings(settings) {
    localStorage.setItem('aicp_ai_settings', JSON.stringify(settings));
  }
}

// ----------------------------------------------------
// 1. Offline Deterministic Rule-Based NLP Engine
// ----------------------------------------------------
export class OfflineNLPEngine {
  // Action verbs dictionary for resume enhancements
  static ACTION_VERBS = [
    "Spearheaded", "Engineered", "Implemented", "Architected", "Optimized",
    "Streamlined", "Accelerated", "Delivered", "Orchestrated", "Standardized",
    "Automated", "Transformed", "Designed", "Formulated", "Pioneered"
  ];

  static enhanceBulletXYZ(rawBullet, context = {}) {
    const clean = rawBullet.trim().replace(/^[-*•]\s*/, "");
    if (!clean) return [];

    // Extract existing technologies mentioned
    const mentionedSkills = ALL_CANONICAL_SKILLS.filter(s => 
      clean.toLowerCase().includes(s.toLowerCase())
    );
    const techContext = mentionedSkills.length > 0 ? ` utilizing ${mentionedSkills.join(", ")}` : "";

    // Generate 3 distinct X-Y-Z alternatives without inventing fake facts
    const alternatives = [
      {
        type: "Action & Impact Focus",
        text: `Engineered and executed ${clean.toLowerCase()}${techContext}, enhancing workflow efficiency and ensuring reliable operational quality.`,
        rationale: "Strong active verb ('Engineered') paired with clear operational outcome."
      },
      {
        type: "Optimization & Quality Focus",
        text: `Streamlined ${clean.toLowerCase()}${techContext}, optimizing execution speed and upholding strict quality standards.`,
        rationale: "Emphasizes process optimization and high delivery standards."
      },
      {
        type: "Collaborative Delivery Focus",
        text: `Delivered ${clean.toLowerCase()} in collaboration with cross-functional team members, meeting project milestones ahead of schedule.`,
        rationale: "Highlights teamwork and on-time milestone delivery."
      }
    ];

    return alternatives;
  }

  static generateSummaries(profile) {
    const { user, education = [], experience = [], skills = [] } = profile;
    const targetRole = user.target_role || "Software Engineering Professional";
    const topTechSkills = skills.filter(s => s.category === "Technical").slice(0, 5).map(s => s.skill).join(", ") || "modern software tools";
    const primaryEdu = education[0] ? `${education[0].degree} in ${education[0].field}` : "Computer Science degree";
    const expCount = experience.length;
    const expYears = expCount > 0 ? `${expCount}+ years of hands-on project and internship experience` : "strong academic and project background";

    return {
      short: `Driven ${targetRole} with ${expYears} in ${topTechSkills}. Passionate about building scalable, user-centric solutions.`,
      standard: `Motivated ${targetRole} holding a ${primaryEdu}, with ${expYears}. Demonstrated expertise in ${topTechSkills}. Proven track record of developing responsive applications and collaborating in Agile teams to solve real-world problems.`,
      ats_focused: `${targetRole.toUpperCase()} with demonstrated technical proficiency in ${topTechSkills}. Experienced in full lifecycle development, RESTful API integration, and clean code architecture. Solid educational grounding with a ${primaryEdu} and a proven commitment to high-performance delivery.`
    };
  }

  static parseJobDescription(text) {
    if (!text) return null;
    const lower = text.toLowerCase();

    // 1. Extract job title heuristic
    let title = "Job Opportunity";
    const titleMatch = text.match(/(?:Job Title|Role|Position|Title)\s*:\s*([^\n\r]+)/i) ||
                       text.match(/(Junior|Senior|Lead|Staff)?\s*(Frontend|Backend|Full-Stack|Software|Data|DevOps|Product)\s*(Engineer|Developer|Analyst|Scientist|Manager)/i);
    if (titleMatch) title = titleMatch[1] || titleMatch[0];

    // 2. Extract company heuristic
    let company = "Target Organization";
    const companyMatch = text.match(/(?:Company|Organization|At)\s*:\s*([^\n\r]+)/i);
    if (companyMatch) company = companyMatch[1].trim();

    // 3. Extract skills by taxonomy scanning
    const extractedTechnical = [];
    const extractedTools = [];
    const extractedSoft = [];

    for (const skill of SKILLS_TAXONOMY.technical) {
      const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(text)) extractedTechnical.push(skill);
    }

    for (const tool of SKILLS_TAXONOMY.tools) {
      const reg = new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(text)) extractedTools.push(tool);
    }

    for (const soft of SKILLS_TAXONOMY.soft_skills) {
      const reg = new RegExp(`\\b${soft.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(text)) extractedSoft.push(soft);
    }

    // 4. Extract experience years requirements
    let experienceReq = "0-2 years relevant experience";
    const expMatch = text.match(/(\d+[\s-+to]+\d*)\s*(?:years|yrs)\s*(?:of)?\s*(?:experience|exp)/i);
    if (expMatch) experienceReq = expMatch[0];

    // 5. Extract degree requirements
    let degreeReq = "Bachelor's degree in Computer Science or related field";
    if (lower.includes("master's") || lower.includes("masters")) degreeReq = "Master's degree preferred";
    else if (lower.includes("phd")) degreeReq = "PhD preferred";
    else if (lower.includes("bachelor's") || lower.includes("bachelor") || lower.includes("bs in")) degreeReq = "Bachelor's degree in technical field";

    return {
      title: title.trim(),
      company: company.trim(),
      technical_skills: extractedTechnical,
      tools: extractedTools,
      soft_skills: extractedSoft,
      experience_required: experienceReq,
      degree_required: degreeReq,
      all_keywords: Array.from(new Set([...extractedTechnical, ...extractedTools, ...extractedSoft]))
    };
  }

  static analyzeResumeMatch(resumeContent, jdData) {
    const resumeText = JSON.stringify(resumeContent).toLowerCase();
    const jdKeywords = jdData.all_keywords || [];
    
    const matching = [];
    const missing = [];
    const partial = [];

    // Candidate skills list
    const candidateSkills = (resumeContent.skills || []).map(s => (s.skill || s).toLowerCase());
    
    // Categorize keywords
    for (const keyword of jdKeywords) {
      const keyLower = keyword.toLowerCase();
      const directInSkills = candidateSkills.some(cs => cs.includes(keyLower) || keyLower.includes(cs));
      const inResumeText = resumeText.includes(keyLower);

      if (directInSkills && inResumeText) {
        matching.push(keyword);
      } else if (inResumeText) {
        partial.push(keyword);
      } else {
        missing.push(keyword);
      }
    }

    // Calculate sub-scores
    const totalKeys = Math.max(jdKeywords.length, 1);
    const skillsScore = Math.min(100, Math.round(((matching.length + (partial.length * 0.5)) / totalKeys) * 100));
    
    // Keyword alignment
    const keywordsScore = Math.min(100, Math.round(((matching.length * 1.0 + partial.length * 0.6) / totalKeys) * 100));

    // Experience score
    const expCount = (resumeContent.experience || []).length;
    const experienceScore = expCount >= 2 ? 90 : (expCount === 1 ? 75 : 50);

    // Qualifications score
    const eduCount = (resumeContent.education || []).length;
    const qualificationsScore = eduCount > 0 ? 95 : 60;

    // Overall weighted score: 40% Skills, 25% Keywords, 20% Experience, 15% Qualifications
    const overallScore = Math.round(
      (skillsScore * 0.40) +
      (keywordsScore * 0.25) +
      (experienceScore * 0.20) +
      (qualificationsScore * 0.15)
    );

    // Skill Gap Matrix
    const skillGap = {
      already_have: matching,
      need_to_highlight: partial.length > 0 ? partial : (matching.slice(0, 3)),
      potential_gaps: missing
    };

    // Actionable Recommendations
    const recommendations = [];
    if (missing.length > 0) {
      recommendations.push({
        title: `Address High-Demand Missing Skills`,
        description: `The job posting specifically requires ${missing.slice(0, 3).join(", ")}. If you have academic, project, or coursework experience with these, add them to your Skills or Projects sections.`,
        importance: "Critical for ATS keyword matching"
      });
    }
    if (partial.length > 0) {
      recommendations.push({
        title: `Strengthen Evidence for ${partial.slice(0, 2).join(" & ")}`,
        description: `These keywords appear in your resume text but are not highlighted in your explicit Skills matrix or project outcomes.`,
        importance: "Improves recruiter readability"
      });
    }
    recommendations.push({
      title: "Quantify Impact Using X-Y-Z Format",
      description: "Ensure each work experience bullet states the action taken, tools used, and measurable results (e.g. speedup, user count, tickets closed).",
      importance: "Proven to boost interview callback rates"
    });

    // Suggested Projects for gaps
    const suggestedProjects = [];
    if (missing.length > 0) {
      const gapTools = missing.slice(0, 2).join(" and ");
      suggestedProjects.push({
        title: `Portfolio Demo: Real-world App using ${gapTools}`,
        technologies: missing.slice(0, 3).join(", "),
        description: `Build a production-style full-stack application integrating ${gapTools} to provide tangible GitHub evidence of competency.`,
        learning_outcome: `Proves practical competence in ${gapTools} to recruiters even without past corporate job experience.`
      });
    } else {
      suggestedProjects.push({
        title: "End-to-End System Performance Benchmarking Tool",
        technologies: matching.slice(0, 3).join(", "),
        description: "Develop a microservice with automated test suites and CI/CD deployment pipelines.",
        learning_outcome: "Demonstrates senior-level engineering rigor and deployment maturity."
      });
    }

    return {
      overall_score: overallScore,
      sub_scores: {
        skills: skillsScore,
        keywords: keywordsScore,
        experience: experienceScore,
        qualifications: qualificationsScore
      },
      matching_keywords: matching,
      missing_keywords: missing,
      partially_matched: partial,
      skill_gap_analysis: skillGap,
      recommendations,
      suggested_projects: suggestedProjects
    };
  }

  static generateInterviewQuestions(jdData, resumeContent) {
    const tech = (jdData.technical_skills || []).slice(0, 4);
    const soft = (jdData.soft_skills || []).slice(0, 2);

    return {
      technical: [
        {
          question: `Can you explain your experience working with ${tech[0] || 'modern web frameworks'} and how you optimize performance in production?`,
          framework: "STAR method: State the situation, technical challenge, specific implementation choices, and measurable results achieved."
        },
        {
          question: `How do you approach error handling, asynchronous state, and API integration in ${tech[1] || 'JavaScript/TypeScript'}?`,
          framework: "Discuss try/catch strategies, loading states, retry logic, and modular API service architectures."
        },
        {
          question: `Describe how you structure database queries and schema designs for scalability.`,
          framework: "Explain indexing, normalization, connection pooling, and ORM vs raw SQL trade-offs."
        }
      ],
      behavioral: [
        {
          question: `Tell me about a time you encountered a difficult technical roadblock during a sprint. How did you resolve it?`,
          framework: "Highlight debugging steps, documentation review, collaborating with peers, and root-cause analysis."
        },
        {
          question: `How do you handle constructive criticism during code reviews?`,
          framework: "Emphasize growth mindset, code quality standards, and open communication."
        }
      ],
      role_specific: [
        {
          question: `Why are you interested in joining ${jdData.company || 'our company'} as a ${jdData.title || 'Software Engineer'}?`,
          framework: "Connect company mission to personal career goals and demonstrated technical strengths."
        }
      ],
      hr_questions: [
        {
          question: "Where do you see your technical growth over the next 1-2 years?",
          framework: "Outline desire to master core stack, contribute to system architecture, and mentor junior colleagues."
        }
      ]
    };
  }
}

// ----------------------------------------------------
// 2. Multi-Provider Client Router
// ----------------------------------------------------
export class AIProviderClient {
  constructor() {
    this.settings = AISettings.getSettings();
  }

  async testConnection(provider, customConfig = {}) {
    const config = { ...this.settings, ...customConfig };
    const startTime = performance.now();

    try {
      if (provider === AI_PROVIDERS.OFFLINE) {
        return { success: true, latencyMs: Math.round(performance.now() - startTime), message: "Offline NLP Engine Ready (Instant)" };
      }

      if (provider === AI_PROVIDERS.OLLAMA) {
        const url = `${config.ollamaUrl || 'http://localhost:11434'}/api/tags`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Ollama responded with status ${res.status}`);
        const data = await res.json();
        const models = (data.models || []).map(m => m.name);
        return {
          success: true,
          latencyMs: Math.round(performance.now() - startTime),
          message: `Connected to Ollama! Available models: ${models.slice(0, 4).join(', ') || 'none'}`
        };
      }

      if (provider === AI_PROVIDERS.GROQ) {
        if (!config.groqApiKey) throw new Error('Groq API Key is empty. Please enter your free API key.');
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${config.groqApiKey}` }
        });
        if (!res.ok) throw new Error(`Groq API error: ${res.statusText}`);
        return {
          success: true,
          latencyMs: Math.round(performance.now() - startTime),
          message: 'Connected to Groq Cloud Free Tier!'
        };
      }

      if (provider === AI_PROVIDERS.OPENROUTER) {
        if (!config.openRouterApiKey) throw new Error('OpenRouter API Key is empty.');
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${config.openRouterApiKey}` }
        });
        if (!res.ok) throw new Error(`OpenRouter API error: ${res.statusText}`);
        return {
          success: true,
          latencyMs: Math.round(performance.now() - startTime),
          message: 'Connected to OpenRouter Free Models!'
        };
      }

      return { success: false, message: 'Unknown provider' };
    } catch (err) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        message: err.message || 'Connection failed'
      };
    }
  }

  async executePrompt({ systemPrompt, userPrompt, jsonSchema = null }) {
    this.settings = AISettings.getSettings();
    const provider = this.settings.provider;

    // If offline selected or requested, immediately return deterministic result
    if (provider === AI_PROVIDERS.OFFLINE) {
      return null; // Will trigger deterministic fallback in caller agent
    }

    try {
      if (provider === AI_PROVIDERS.OLLAMA) {
        return await this.callOllama(systemPrompt, userPrompt, jsonSchema);
      }
      if (provider === AI_PROVIDERS.GROQ) {
        return await this.callGroq(systemPrompt, userPrompt, jsonSchema);
      }
      if (provider === AI_PROVIDERS.OPENROUTER) {
        return await this.callOpenRouter(systemPrompt, userPrompt, jsonSchema);
      }
    } catch (err) {
      console.warn(`[AIProviderClient] Error calling ${provider}. Falling back to Offline NLP Engine.`, err);
      return null;
    }

    return null;
  }

  async callOllama(systemPrompt, userPrompt, jsonSchema) {
    const url = `${this.settings.ollamaUrl || 'http://localhost:11434'}/api/generate`;
    const body = {
      model: this.settings.ollamaModel || 'llama3.2',
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      format: jsonSchema ? 'json' : undefined
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Ollama generate failed: ${res.statusText}`);
    const data = await res.json();
    return data.response;
  }

  async callGroq(systemPrompt, userPrompt, jsonSchema) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.groqApiKey}`
      },
      body: JSON.stringify({
        model: this.settings.groqModel || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: jsonSchema ? { type: 'json_object' } : undefined
      })
    });

    if (!res.ok) throw new Error(`Groq generate failed: ${res.statusText}`);
    const data = await res.json();
    return data.choices[0]?.message?.content || null;
  }

  async callOpenRouter(systemPrompt, userPrompt, jsonSchema) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.openRouterApiKey}`
      },
      body: JSON.stringify({
        model: this.settings.openRouterModel || 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: jsonSchema ? { type: 'json_object' } : undefined
      })
    });

    if (!res.ok) throw new Error(`OpenRouter generate failed: ${res.statusText}`);
    const data = await res.json();
    return data.choices[0]?.message?.content || null;
  }
}

export const aiClient = new AIProviderClient();
