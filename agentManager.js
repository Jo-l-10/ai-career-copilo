// Master Agent Manager and 6 Specialized Autonomous Sub-Agents

import { aiClient, OfflineNLPEngine } from './aiProviders.js';

// ----------------------------------------------------
// 1. Agent 1 — Career Profile Agent
// ----------------------------------------------------
export class CareerProfileAgent {
  static async validateAndStructureProfile(profileData) {
    const missing = [];
    const { user = {}, education = [], experience = [], skills = [], projects = [] } = profileData;

    if (!user.name) missing.push("Full Name");
    if (!user.email) missing.push("Email Address");
    if (!user.target_role) missing.push("Target Career Role");
    if (education.length === 0) missing.push("Education History");
    if (experience.length === 0) missing.push("Work/Internship Experience");
    if (skills.length === 0) missing.push("Skills List");
    if (projects.length === 0) missing.push("Portfolio Projects");

    const totalFields = 7;
    const completeness = Math.round(((totalFields - missing.length) / totalFields) * 100);

    return {
      status: "success",
      completeness,
      missing_fields: missing,
      recommendations: missing.map(m => `Add your ${m} to improve ATS profile scoring.`)
    };
  }
}

// ----------------------------------------------------
// 2. Agent 2 — Resume Agent (X-Y-Z Bullets & Summaries)
// ----------------------------------------------------
export class ResumeAgent {
  static async enhanceBullet(rawBullet, context = {}) {
    if (!rawBullet || !rawBullet.trim()) {
      return { status: "error", message: "Please enter a bullet point to enhance." };
    }

    const systemPrompt = `You are an expert ATS Resume Coach. Transform the user's raw bullet point into 3 professional, high-impact bullet points using the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".
CRITICAL ANTI-HALLUCINATION RULES:
1. Never invent fake metrics or numbers that contradict the user's experience.
2. Never invent fake companies, fake credentials, or unmentioned tools.
3. Preserve the user's authentic voice and technical context.
Return ONLY valid JSON matching this schema:
{
  "alternatives": [
    {
      "type": "Action & Impact Focus",
      "text": "...",
      "rationale": "..."
    },
    {
      "type": "Optimization & Quality Focus",
      "text": "...",
      "rationale": "..."
    },
    {
      "type": "Collaborative Delivery Focus",
      "text": "...",
      "rationale": "..."
    }
  ]
}`;

    const userPrompt = `Raw bullet point: "${rawBullet}"\nContext: ${JSON.stringify(context)}`;

    const response = await aiClient.executePrompt({
      systemPrompt,
      userPrompt,
      jsonSchema: true
    });

    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.alternatives && parsed.alternatives.length > 0) {
          return { status: "success", alternatives: parsed.alternatives };
        }
      } catch (e) {
        console.warn('Failed to parse LLM bullet response, using offline fallback', e);
      }
    }

    // Deterministic Offline NLP Fallback
    const fallbackAlts = OfflineNLPEngine.enhanceBulletXYZ(rawBullet, context);
    return { status: "success", alternatives: fallbackAlts, source: "offline_nlp" };
  }

  static async generateSummary(profile) {
    const systemPrompt = `You are an expert Resume Writer. Create 3 distinct ATS-friendly professional summary options based on the candidate's actual profile.
CRITICAL RULES:
- Never fabricate experience or skills not present in the profile.
- Return ONLY valid JSON in this schema:
{
  "short": "1-2 sentences",
  "standard": "3-4 sentences",
  "ats_focused": "Keywords and target role dense summary"
}`;

    const userPrompt = `Candidate Profile:\nTarget Role: ${profile.user?.target_role || ''}\nEducation: ${JSON.stringify(profile.education || [])}\nExperience: ${JSON.stringify(profile.experience || [])}\nSkills: ${JSON.stringify(profile.skills || [])}`;

    const response = await aiClient.executePrompt({
      systemPrompt,
      userPrompt,
      jsonSchema: true
    });

    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.short && parsed.standard && parsed.ats_focused) {
          return { status: "success", summaries: parsed };
        }
      } catch (e) {
        console.warn('Failed to parse LLM summary response, using offline fallback', e);
      }
    }

    // Deterministic Offline NLP Fallback
    const fallbackSummaries = OfflineNLPEngine.generateSummaries(profile);
    return { status: "success", summaries: fallbackSummaries, source: "offline_nlp" };
  }
}

// ----------------------------------------------------
// 3. Agent 3 — Job Description Agent
// ----------------------------------------------------
export class JobDescriptionAgent {
  static async parseJobDescription(rawText) {
    if (!rawText || !rawText.trim()) {
      return { status: "error", message: "Job description text cannot be empty." };
    }

    const systemPrompt = `You are an ATS Job Description Parsing Agent. Analyze the provided job posting and extract all key requirements into structured JSON.
Return JSON with this schema:
{
  "title": "Job Title",
  "company": "Company Name",
  "technical_skills": ["Skill1", "Skill2"],
  "tools": ["Tool1", "Tool2"],
  "soft_skills": ["Skill1", "Skill2"],
  "experience_required": "e.g. 0-2 years",
  "degree_required": "e.g. Bachelor's in CS",
  "all_keywords": ["Keyword1", "Keyword2"]
}`;

    const userPrompt = `Job Description Text:\n${rawText}`;

    const response = await aiClient.executePrompt({
      systemPrompt,
      userPrompt,
      jsonSchema: true
    });

    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.title && parsed.technical_skills) {
          return { status: "success", data: parsed };
        }
      } catch (e) {
        console.warn('Failed to parse LLM JD response, using offline fallback', e);
      }
    }

    // Deterministic Offline NLP Fallback
    const fallbackData = OfflineNLPEngine.parseJobDescription(rawText);
    return { status: "success", data: fallbackData, source: "offline_nlp" };
  }
}

// ----------------------------------------------------
// 4. Agent 4 — Match Analysis Agent (ATS 0-100% Score)
// ----------------------------------------------------
export class MatchAnalysisAgent {
  static async analyzeMatch(resumeContent, jdData) {
    const systemPrompt = `You are an ATS Compatibility & Gap Analysis Specialist. Compare the candidate's resume content against the target Job Description.
Calculate realistic match scores (0-100%) and identify matching skills, missing skills, partial matches, skill gap breakdown, actionable resume recommendations, and suggested portfolio projects.
CRITICAL RULES:
1. Do not recommend candidates lie or falsify skills.
2. Label project suggestions clearly as ideas to build, not completed experience.
Return ONLY valid JSON with this schema:
{
  "overall_score": 85,
  "sub_scores": {
    "skills": 88,
    "keywords": 82,
    "experience": 85,
    "qualifications": 90
  },
  "matching_keywords": ["React", "TypeScript", "Tailwind CSS"],
  "missing_keywords": ["Docker", "GraphQL"],
  "partially_matched": ["Node.js"],
  "skill_gap_analysis": {
    "already_have": ["React", "TypeScript"],
    "need_to_highlight": ["REST APIs", "Node.js"],
    "potential_gaps": ["Docker"]
  },
  "recommendations": [
    {
      "title": "Highlight Docker Experience",
      "description": "...",
      "importance": "High"
    }
  ],
  "suggested_projects": [
    {
      "title": "...",
      "technologies": "...",
      "description": "...",
      "learning_outcome": "..."
    }
  ]
}`;

    const userPrompt = `RESUME CONTENT:\n${JSON.stringify(resumeContent)}\n\nJOB DESCRIPTION DATA:\n${JSON.stringify(jdData)}`;

    const response = await aiClient.executePrompt({
      systemPrompt,
      userPrompt,
      jsonSchema: true
    });

    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (typeof parsed.overall_score === 'number' && parsed.matching_keywords) {
          return { status: "success", data: parsed };
        }
      } catch (e) {
        console.warn('Failed to parse LLM match response, using offline fallback', e);
      }
    }

    // Deterministic Offline NLP Fallback
    const fallbackMatch = OfflineNLPEngine.analyzeResumeMatch(resumeContent, jdData);
    return { status: "success", data: fallbackMatch, source: "offline_nlp" };
  }
}

// ----------------------------------------------------
// 5. Agent 5 — Interview Prep Agent
// ----------------------------------------------------
export class InterviewAgent {
  static async generateQuestions(jdData, resumeContent) {
    const systemPrompt = `You are a Technical Hiring Manager and Career Coach. Generate targeted interview questions and structured STAR answering frameworks based on the Job Description and candidate profile.
Return ONLY valid JSON matching this schema:
{
  "technical": [
    { "question": "...", "framework": "..." }
  ],
  "behavioral": [
    { "question": "...", "framework": "..." }
  ],
  "role_specific": [
    { "question": "...", "framework": "..." }
  ],
  "hr_questions": [
    { "question": "...", "framework": "..." }
  ]
}`;

    const userPrompt = `Job: ${JSON.stringify(jdData)}\nResume: ${JSON.stringify(resumeContent)}`;

    const response = await aiClient.executePrompt({
      systemPrompt,
      userPrompt,
      jsonSchema: true
    });

    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.technical && parsed.behavioral) {
          return { status: "success", data: parsed };
        }
      } catch (e) {
        console.warn('Failed to parse LLM interview response, using offline fallback', e);
      }
    }

    // Deterministic Offline NLP Fallback
    const fallbackQuestions = OfflineNLPEngine.generateInterviewQuestions(jdData, resumeContent);
    return { status: "success", data: fallbackQuestions, source: "offline_nlp" };
  }
}

// ----------------------------------------------------
// 6. Agent 6 — Document & ATS Validation Agent
// ----------------------------------------------------
export class DocumentAgent {
  static validateATSCompliance(resumeContent) {
    const issues = [];
    const passed = [];

    // 1. Check Contact Info
    if (resumeContent.personal?.name && resumeContent.personal?.email) {
      passed.push("Standard Contact Information detected");
    } else {
      issues.push("Missing core contact info (Name or Email)");
    }

    // 2. Check Summary
    if (resumeContent.summary && resumeContent.summary.length > 50) {
      passed.push("Professional summary present and concise");
    } else {
      issues.push("Professional summary is missing or too brief");
    }

    // 3. Check Work Experience
    if (resumeContent.experience && resumeContent.experience.length > 0) {
      passed.push("Chronological work experience section present");
      const hasBullets = resumeContent.experience.some(e => e.achievements && e.achievements.length > 0);
      if (hasBullets) passed.push("Experience contains bulleted achievements");
      else issues.push("Experience lacks bulleted achievements");
    } else {
      issues.push("No work experience entries listed");
    }

    // 4. Check Skills
    if (resumeContent.skills && resumeContent.skills.length >= 5) {
      passed.push(`Categorized skills list present (${resumeContent.skills.length} skills)`);
    } else {
      issues.push("Skills list contains fewer than 5 skills");
    }

    // 5. Check Education
    if (resumeContent.education && resumeContent.education.length > 0) {
      passed.push("Education section clearly structured");
    } else {
      issues.push("No education record found");
    }

    const atsScore = Math.max(20, Math.round(((passed.length) / (passed.length + issues.length)) * 100));

    return {
      ats_score: atsScore,
      is_ats_friendly: issues.length <= 1,
      passed_checks: passed,
      issues
    };
  }

  static renderCleanATSHtml(resumeContent, templateStyleOrConfig = 'placement_elite') {
    const {
      personal = {},
      education = [],
      experience = [],
      skills = [],
      projects = [],
      leadership = [],
      awards = [],
      certifications = []
    } = resumeContent;

    const skillsRow = skills.map(s => s.skill).join(' • ');

    // Normalize config
    let config = {
      header_style: "placement_banner",
      section_banner_style: "shaded_bar",
      banner_bg_color: "#d1d5db",
      banner_text_color: "#000000",
      border_color: "#4b5563",
      education_style: "table_grid",
      left_tag_column: true,
      bullet_style: "square",
      footer_style: "bottom_bar",
      font_family: "calibri",
      accent_color: "#0044cc"
    };

    if (typeof templateStyleOrConfig === 'object' && templateStyleOrConfig !== null) {
      config = { ...config, ...(templateStyleOrConfig.config || templateStyleOrConfig) };
    } else if (templateStyleOrConfig === 'classic_ats') {
      config = {
        header_style: "classic_center",
        section_banner_style: "underline",
        banner_bg_color: "transparent",
        banner_text_color: "#000000",
        border_color: "#374151",
        education_style: "list_bullets",
        left_tag_column: false,
        bullet_style: "disc",
        footer_style: "top_contact",
        font_family: "times",
        accent_color: "#111827"
      };
    } else if (templateStyleOrConfig === 'modern_tech') {
      config = {
        header_style: "modern_split",
        section_banner_style: "boxed",
        banner_bg_color: "#f1f5f9",
        banner_text_color: "#0f172a",
        border_color: "#06b6d4",
        education_style: "list_bullets",
        left_tag_column: true,
        bullet_style: "arrow",
        footer_style: "top_contact",
        font_family: "inter",
        accent_color: "#0891b2"
      };
    }

    const bulletSymbols = {
      square: '▪',
      disc: '•',
      dash: '–',
      arrow: '▸'
    };
    const bSym = bulletSymbols[config.bullet_style] || '▪';

    const fontFamilies = {
      calibri: "'Calibri', 'Arial', 'Segoe UI', sans-serif",
      times: "'Times New Roman', Times, Georgia, serif",
      arial: "Arial, Helvetica, sans-serif",
      inter: "'Inter', system-ui, -apple-system, sans-serif"
    };
    const selectedFont = fontFamilies[config.font_family] || fontFamilies.calibri;

    // Classic Minimalist ATS Layout
    if (config.header_style === 'classic_center' && config.section_banner_style === 'underline') {
      const technicalSkills = skills.filter(s => s.category === "Technical").map(s => s.skill).join(", ");
      const toolSkills = skills.filter(s => s.category === "Tools").map(s => s.skill).join(", ");
      const softSkills = skills.filter(s => s.category === "Soft Skills").map(s => s.skill).join(", ");

      return `
        <div id="ats-resume-print-area" class="ats-resume-document" style="font-family: ${selectedFont};">
          <header class="ats-header">
            <h1 class="ats-name">${personal.name || "Your Name"}</h1>
            <div class="ats-contact-line">
              ${personal.email ? `<span>${personal.email}</span>` : ''}
              ${personal.phone ? `<span>• ${personal.phone}</span>` : ''}
              ${personal.location ? `<span>• ${personal.location}</span>` : ''}
              ${personal.linkedin ? `<span>• <a href="${personal.linkedin}">${personal.linkedin.replace(/^https?:\/\//, '')}</a></span>` : ''}
              ${personal.portfolio ? `<span>• <a href="${personal.portfolio}">${personal.portfolio.replace(/^https?:\/\//, '')}</a></span>` : ''}
            </div>
          </header>

          ${resumeContent.summary ? `
          <section class="ats-section">
            <h2 class="ats-section-title">PROFESSIONAL SUMMARY</h2>
            <p class="ats-paragraph">${resumeContent.summary}</p>
          </section>` : ''}

          ${education.length > 0 ? `
          <section class="ats-section">
            <h2 class="ats-section-title">EDUCATION</h2>
            ${education.map(edu => `
              <div class="ats-item">
                <div class="ats-item-header">
                  <div><span class="ats-item-title">${edu.degree || 'Degree'} in ${edu.field || 'Major'}</span></div>
                  <div class="ats-item-date">${edu.start_year || ''} – ${edu.end_year || 'Present'}</div>
                </div>
                <div class="ats-item-org">${edu.institution || 'University'} ${edu.grade ? `(${edu.grade})` : ''}</div>
              </div>
            `).join('')}
          </section>` : ''}

          ${experience.length > 0 ? `
          <section class="ats-section">
            <h2 class="ats-section-title">PROFESSIONAL EXPERIENCE</h2>
            ${experience.map(exp => `
              <div class="ats-item">
                <div class="ats-item-header">
                  <div><span class="ats-item-title">${exp.company || 'Company'}</span>, <span class="ats-item-org">${exp.job_title || 'Position'}</span></div>
                  <div class="ats-item-date">${exp.start_date || ''} – ${exp.current ? 'Present' : (exp.end_date || 'Present')}</div>
                </div>
                ${exp.achievements && exp.achievements.length > 0 ? `
                  <ul class="ats-bullet-list">
                    ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                ` : (exp.description ? `<p class="ats-paragraph">${exp.description}</p>` : '')}
              </div>
            `).join('')}
          </section>` : ''}

          ${projects.length > 0 ? `
          <section class="ats-section">
            <h2 class="ats-section-title">PROJECTS</h2>
            ${projects.map(proj => `
              <div class="ats-item">
                <div class="ats-item-header">
                  <div><span class="ats-item-title">${proj.name || 'Project Name'}</span> ${proj.technologies ? ` | <span class="ats-tech-stack">${proj.technologies}</span>` : ''}</div>
                </div>
                ${proj.description ? `<p class="ats-paragraph">${proj.description}</p>` : ''}
              </div>
            `).join('')}
          </section>` : ''}

          ${skills.length > 0 ? `
          <section class="ats-section">
            <h2 class="ats-section-title">SKILLS & COMPETENCIES</h2>
            <div class="ats-skills-block">
              ${technicalSkills ? `<p><strong>Technical Skills:</strong> ${technicalSkills}</p>` : ''}
              ${toolSkills ? `<p><strong>Tools:</strong> ${toolSkills}</p>` : ''}
              ${softSkills ? `<p><strong>Soft Skills:</strong> ${softSkills}</p>` : ''}
            </div>
          </section>` : ''}
        </div>
      `;
    }

    // Dynamic Institutional / Placement / Custom Template Layout
    const bannerBg = config.banner_bg_color || '#d1d5db';
    const bannerColor = config.banner_text_color || '#000000';
    const borderCol = config.border_color || '#4b5563';
    const accentCol = config.accent_color || '#0044cc';

    let bannerStyleCss = `background-color: ${bannerBg}; color: ${bannerColor}; border-top: 1px solid ${borderCol}; border-bottom: 1px solid ${borderCol};`;
    if (config.section_banner_style === 'underline') {
      bannerStyleCss = `background-color: transparent; color: ${bannerColor}; border-bottom: 1.5px solid ${borderCol}; padding-left: 0;`;
    } else if (config.section_banner_style === 'boxed') {
      bannerStyleCss = `background-color: ${bannerBg}; color: ${bannerColor}; border-left: 4px solid ${accentCol}; border-radius: 2px;`;
    }

    return `
      <div id="ats-resume-print-area" class="placement-resume-document" style="font-family: ${selectedFont};">
        <!-- Header -->
        <header class="pl-header" style="${config.header_style === 'classic_center' ? 'text-align: center;' : ''}">
          <h1 class="pl-name">${personal.name || "JOEL J"}</h1>
          ${personal.email ? `<div class="pl-email"><a href="mailto:${personal.email}" style="color: ${accentCol};">${personal.email}</a></div>` : ''}
          ${config.footer_style === 'top_contact' ? `
            <div class="text-[8.5pt] text-slate-700 mt-1 flex flex-wrap gap-2 ${config.header_style === 'classic_center' ? 'justify-center' : ''}">
              ${personal.phone ? `<span>Phone: ${personal.phone}</span>` : ''}
              ${personal.location ? `<span>• Location: ${personal.location}</span>` : ''}
              ${personal.linkedin ? `<span>• <a href="${personal.linkedin}" style="color: ${accentCol};">LinkedIn</a></span>` : ''}
            </div>
          ` : ''}
        </header>

        <div class="pl-main-content">
          <!-- EDUCATION SECTION -->
          ${education.length > 0 ? `
          <section class="pl-section">
            <div class="pl-section-banner" style="${bannerStyleCss}">EDUCATION</div>
            ${config.education_style === 'table_grid' ? `
              <table class="pl-edu-table">
                <tbody>
                  ${education.map(edu => `
                    <tr>
                      <td class="pl-edu-degree font-bold" style="border-color: ${borderCol};">${edu.degree || 'Degree'}</td>
                      <td class="pl-edu-inst" style="border-color: ${borderCol};">${edu.institution || 'Institution'}</td>
                      <td class="pl-edu-grade text-center" style="border-color: ${borderCol};">${edu.grade || ''}</td>
                      <td class="pl-edu-year text-center" style="border-color: ${borderCol};">${edu.end_year || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="pl-footnote">*Upto 3<sup>rd</sup> trimester</div>
            ` : `
              <div class="space-y-1.5 pt-1">
                ${education.map(edu => `
                  <div class="flex justify-between items-baseline text-[8.5pt]">
                    <div><strong>${edu.degree || 'Degree'} in ${edu.field || 'Major'}</strong>, ${edu.institution || 'Institution'}</div>
                    <div class="font-bold">${edu.start_year || ''} – ${edu.end_year || ''}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </section>` : ''}

          <!-- PROFESSIONAL EXPERIENCE SECTION -->
          ${experience.length > 0 ? `
          <section class="pl-section">
            <div class="pl-section-banner" style="${bannerStyleCss}">PROFESSIONAL EXPERIENCE</div>
            ${experience.map((exp, idx) => `
              <div class="pl-entry">
                <div class="pl-entry-header">
                  <span class="pl-entry-title"><strong>${exp.company || 'COMPANY'}</strong>, ${exp.job_title || 'Role'}</span>
                  <span class="pl-entry-date"><strong>${exp.start_date || ''} – ${exp.current ? 'Present' : (exp.end_date || 'Present')}</strong></span>
                </div>
                <div class="pl-grid-row">
                  ${config.left_tag_column ? `
                    <div class="pl-left-tag-col">
                      <div class="pl-tag-box">${exp.tag || 'Responsibilities'}</div>
                    </div>
                  ` : ''}
                  <div class="pl-right-content-col">
                    <ul class="pl-bullets">
                      ${(exp.achievements || [exp.description]).map(b => `
                        <li><span class="pl-bullet-sym">${bSym}</span><span class="pl-bullet-text">${b}</span></li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
              </div>
            `).join('')}
          </section>` : ''}

          <!-- PROJECTS SECTION -->
          ${projects.length > 0 ? `
          <section class="pl-section">
            <div class="pl-section-banner" style="${bannerStyleCss}">PROJECTS</div>
            ${projects.map(proj => `
              <div class="pl-entry">
                <div class="pl-grid-row">
                  ${config.left_tag_column ? `
                    <div class="pl-left-tag-col">
                      <div class="pl-tag-box">${proj.tag || 'Academic Projects'}</div>
                    </div>
                  ` : ''}
                  <div class="pl-right-content-col">
                    <ul class="pl-bullets">
                      <li>
                        <span class="pl-bullet-sym">${bSym}</span>
                        <span class="pl-bullet-text">
                          <strong>${proj.name} | ${proj.technologies}:</strong><br>
                          ${proj.description || ''}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            `).join('')}
          </section>` : ''}

          <!-- LEADERSHIP EXPERIENCE SECTION -->
          ${leadership && leadership.length > 0 ? `
          <section class="pl-section">
            <div class="pl-section-banner" style="${bannerStyleCss}">LEADERSHIP EXPERIENCE</div>
            <div class="pl-grid-row">
              ${config.left_tag_column ? `
                <div class="pl-left-tag-col">
                  <div class="pl-tag-box">Positions of Responsibility</div>
                </div>
              ` : ''}
              <div class="pl-right-content-col">
                <ul class="pl-bullets">
                  ${leadership.map(lead => `
                    <li>
                      <span class="pl-bullet-sym">${bSym}</span>
                      <span class="pl-bullet-text">
                        <div class="flex justify-between">
                          <strong>${lead.role}, ${lead.organization}.</strong>
                          <strong>${lead.year || ''}</strong>
                        </div>
                        ${lead.description || ''}
                      </span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </section>` : ''}

          <!-- AWARDS & ACHIEVEMENTS SECTION -->
          ${awards && awards.length > 0 ? `
          <section class="pl-section">
            <div class="pl-section-banner" style="${bannerStyleCss}">AWARDS & ACHIEVEMENTS</div>
            <div class="pl-grid-row">
              ${config.left_tag_column ? `
                <div class="pl-left-tag-col">
                  <div class="pl-tag-box">Academics</div>
                </div>
              ` : ''}
              <div class="pl-right-content-col">
                <ul class="pl-bullets">
                  ${awards.map(aw => `
                    <li>
                      <span class="pl-bullet-sym">${bSym}</span>
                      <span class="pl-bullet-text">${aw.title || aw}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </section>` : ''}

          <!-- SKILLS & INTEREST SECTION -->
          ${(certifications.length > 0 || skills.length > 0) ? `
          <section class="pl-section">
            <div class="pl-section-banner" style="${bannerStyleCss}">SKILLS & INTEREST</div>
            <div class="pl-grid-row">
              ${config.left_tag_column ? `
                <div class="pl-left-tag-col">
                  <div class="pl-tag-box">Skills & Certifications</div>
                </div>
              ` : ''}
              <div class="pl-right-content-col">
                ${certifications.length > 0 ? `
                  <ul class="pl-bullets mb-1">
                    ${certifications.map(c => `
                      <li>
                        <span class="pl-bullet-sym">${bSym}</span>
                        <span class="pl-bullet-text"><strong>${c.name}</strong>, ${c.issuer}.</span>
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
                ${skillsRow ? `
                  <div class="pl-skills-line">
                    <strong>Skills:</strong> • ${skillsRow}
                  </div>
                ` : ''}
              </div>
            </div>
          </section>` : ''}
        </div>

        <!-- FOOTER CONTACT BAR -->
        ${config.footer_style === 'bottom_bar' ? `
          <footer class="pl-footer" style="border-top-color: ${borderCol};">
            ${personal.linkedin ? `<span><strong>LinkedIn:</strong> <a href="${personal.linkedin}" style="color: ${accentCol};">${personal.linkedin.replace(/^https?:\/\//, '')}</a></span> | ` : ''}
            ${personal.phone ? `<span><strong>Phone:</strong> ${personal.phone}</span> | ` : ''}
            ${personal.portfolio ? `<span><strong>GitHub:</strong> <a href="${personal.portfolio}" style="color: ${accentCol};">${personal.portfolio.replace(/^https?:\/\//, '')}</a></span>` : ''}
          </footer>
        ` : ''}
      </div>
    `;
  }

  static analyzeUploadedSample(fileName, rawTextContent = '') {
    // Intelligent structure detection from uploaded sample file
    const text = rawTextContent.toLowerCase();

    // 1. Detect Education style (tables / grid indicators)
    const hasTableGrid = text.includes('cgpa') || text.includes('institution') || text.includes('|') || text.includes('trimester') || text.includes('percentage') || text.includes('matrix');
    
    // 2. Detect Left Tag Badges (like Responsibilities, Academic Projects)
    const hasLeftTags = text.includes('responsibilities') || text.includes('positions of responsibility') || text.includes('academics') || text.includes('academic projects');

    // 3. Detect Banner Style
    let bannerStyle = 'shaded_bar';
    let bannerBg = '#d1d5db';
    let bannerText = '#000000';
    let borderColor = '#4b5563';
    let font = 'calibri';
    let bullet = 'square';
    let accent = '#0044cc';

    if (text.includes('classic') || text.includes('times') || (!hasTableGrid && !hasLeftTags)) {
      bannerStyle = 'underline';
      bannerBg = 'transparent';
      font = 'times';
      bullet = 'disc';
      borderColor = '#374151';
      accent = '#111827';
    } else if (text.includes('modern') || text.includes('cyan') || text.includes('tech') || text.includes('software engineer')) {
      bannerStyle = 'boxed';
      bannerBg = '#f1f5f9';
      borderColor = '#06b6d4';
      accent = '#0891b2';
      font = 'inter';
      bullet = 'arrow';
    }

    const detectedTemplate = {
      name: `Custom Template (${fileName.replace(/\.[^/.]+$/, "")})`,
      description: `Auto-generated layout template extracted from ${fileName}`,
      type: "custom",
      config: {
        header_style: bannerStyle === 'underline' ? 'classic_center' : 'placement_banner',
        section_banner_style: bannerStyle,
        banner_bg_color: bannerBg,
        banner_text_color: bannerText,
        border_color: borderColor,
        education_style: hasTableGrid ? 'table_grid' : 'list_bullets',
        left_tag_column: hasLeftTags,
        bullet_style: bullet,
        footer_style: bannerStyle === 'underline' ? 'top_contact' : 'bottom_bar',
        font_family: font,
        accent_color: accent
      },
      analysis_insights: [
        hasTableGrid ? "Detected 4-column structured education table format." : "Detected bulleted list education format.",
        hasLeftTags ? "Detected categorized left-column tag badges." : "Single-column full width content structure.",
        `Selected ${bannerStyle.replace('_', ' ')} section headers with ${font} typography.`,
        "Optimal ATS single-page printable geometry configured."
      ]
    };

    return detectedTemplate;
  }

  static exportToPDF(elementId = 'ats-resume-print-area', filename = 'Resume_Placement_Format.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
      alert("Resume preview element not found for PDF export.");
      return;
    }

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.99 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } else {
      // Free Browser Print-to-PDF Fallback
      window.print();
    }
  }
}

// ----------------------------------------------------
// 7. MASTER AGENT MANAGER COORDINATOR
// ----------------------------------------------------
export class MasterAgentManager {
  static async executeTask(agentName, taskType, payload) {
    console.log(`[MasterAgentManager] Routing task '${taskType}' to agent '${agentName}'...`);

    try {
      if (agentName === 'profile') {
        return await CareerProfileAgent.validateAndStructureProfile(payload);
      }
      if (agentName === 'resume') {
        if (taskType === 'enhance_bullet') {
          return await ResumeAgent.enhanceBullet(payload.bullet, payload.context);
        }
        if (taskType === 'generate_summary') {
          return await ResumeAgent.generateSummary(payload.profile);
        }
      }
      if (agentName === 'job_description') {
        if (taskType === 'parse_jd') {
          return await JobDescriptionAgent.parseJobDescription(payload.rawText);
        }
      }
      if (agentName === 'match_analysis') {
        if (taskType === 'analyze_match') {
          return await MatchAnalysisAgent.analyzeMatch(payload.resumeContent, payload.jdData);
        }
      }
      if (agentName === 'interview') {
        if (taskType === 'generate_questions') {
          return await InterviewAgent.generateQuestions(payload.jdData, payload.resumeContent);
        }
      }
      if (agentName === 'document') {
        if (taskType === 'validate_ats') {
          return DocumentAgent.validateATSCompliance(payload.resumeContent);
        }
      }

      throw new Error(`Unknown agent task: ${agentName}.${taskType}`);
    } catch (err) {
      console.error(`[MasterAgentManager] Error processing task ${agentName}.${taskType}:`, err);
      return {
        status: "error",
        message: err.message || "Task execution failed. Please try again."
      };
    }
  }
}
