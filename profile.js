// Career Profile View — Visual Low-Code Editor

import { db } from '../db.js';
import { Toast } from '../components/toast.js';
import { BulletEnhancerModal } from '../components/bulletEnhancerModal.js';
import { SummaryModal } from '../components/summaryModal.js';
import { SAMPLE_USER_PROFILE } from '../sampleData.js';

export async function renderProfileView(container, navigateTo) {
  const currentUser = await db.getCurrentUser();
  let fullProfile = currentUser ? await db.getFullUserProfile(currentUser.id) : null;

  if (!fullProfile) {
    await db.initSeedData(true);
    const u = await db.getCurrentUser();
    fullProfile = await db.getFullUserProfile(u.id);
  }

  const {
    user,
    education = [],
    experience = [],
    skills = [],
    projects = [],
    leadership = [],
    awards = [],
    certifications = []
  } = fullProfile;

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-1">
            <i data-lucide="user-check" class="w-3.5 h-3.5"></i> Single Source of Career Truth
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Career Profile Editor</h1>
          <p class="text-xs text-slate-400">Your profile data automatically fuels your ATS Resumes and Job Match Analyses.</p>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-load-sample-profile" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition flex items-center gap-1.5">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-amber-400"></i> Reset to Joel J Profile
          </button>
          <button id="btn-save-profile-main" class="btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5">
            <i data-lucide="save" class="w-4 h-4"></i> Save Profile
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 text-xs font-medium">
        <button class="profile-tab-btn active px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold flex items-center gap-2" data-tab="tab-personal">
          <i data-lucide="user" class="w-4 h-4"></i> Personal
        </button>
        <button class="profile-tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2" data-tab="tab-education">
          <i data-lucide="graduation-cap" class="w-4 h-4"></i> Education (${education.length})
        </button>
        <button class="profile-tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2" data-tab="tab-experience">
          <i data-lucide="briefcase" class="w-4 h-4"></i> Experience (${experience.length})
        </button>
        <button class="profile-tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2" data-tab="tab-skills">
          <i data-lucide="award" class="w-4 h-4"></i> Skills (${skills.length})
        </button>
        <button class="profile-tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2" data-tab="tab-projects">
          <i data-lucide="code" class="w-4 h-4"></i> Projects (${projects.length})
        </button>
        <button class="profile-tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2" data-tab="tab-leadership">
          <i data-lucide="users" class="w-4 h-4"></i> Leadership (${leadership.length})
        </button>
        <button class="profile-tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2" data-tab="tab-awards">
          <i data-lucide="trophy" class="w-4 h-4"></i> Awards (${awards.length})
        </button>
      </div>

      <!-- TAB 1: Personal Info -->
      <div id="tab-personal" class="profile-tab-pane space-y-6">
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Basic & Contact Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Full Name *</label>
              <input type="text" id="prof-name" value="${user.name || ''}" class="form-input" placeholder="Alex Chen">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Email Address *</label>
              <input type="email" id="prof-email" value="${user.email || ''}" class="form-input" placeholder="alex@example.com">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input type="text" id="prof-phone" value="${user.phone || ''}" class="form-input" placeholder="+1 (555) 000-0000">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Location (City, State / Country)</label>
              <input type="text" id="prof-location" value="${user.location || ''}" class="form-input" placeholder="San Francisco, CA">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">LinkedIn Profile URL</label>
              <input type="url" id="prof-linkedin" value="${user.linkedin || ''}" class="form-input" placeholder="https://linkedin.com/in/alexchen">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Portfolio / GitHub Website</label>
              <input type="url" id="prof-portfolio" value="${user.portfolio || ''}" class="form-input" placeholder="https://alexchen.dev">
            </div>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Target Role & Professional Summary</h3>
            <button id="btn-prof-ai-summary" class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> AI Generate Summary
            </button>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Target Career Role *</label>
            <input type="text" id="prof-target-role" value="${user.target_role || ''}" class="form-input" placeholder="e.g. Junior Frontend Developer">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Professional Summary</label>
            <textarea id="prof-summary" rows="3" class="form-input" placeholder="Concise overview of your technical background, accomplishments, and career aspirations...">${user.summary || ''}</textarea>
          </div>
        </div>
      </div>

      <!-- TAB 2: Education -->
      <div id="tab-education" class="profile-tab-pane space-y-4 hidden">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Education History</h3>
          <button id="btn-add-education" class="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Degree
          </button>
        </div>
        <div id="education-list-container" class="space-y-4"></div>
      </div>

      <!-- TAB 3: Experience -->
      <div id="tab-experience" class="profile-tab-pane space-y-4 hidden">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Work & Internship Experience</h3>
          <button id="btn-add-experience" class="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Position
          </button>
        </div>
        <div id="experience-list-container" class="space-y-4"></div>
      </div>

      <!-- TAB 4: Skills -->
      <div id="tab-skills" class="profile-tab-pane space-y-6 hidden">
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Add New Skill</h3>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input type="text" id="new-skill-input" class="form-input flex-1 min-w-[200px]" placeholder="e.g. React, PostgreSQL, Docker...">
            <select id="new-skill-category" class="form-input w-40">
              <option value="Technical">Technical</option>
              <option value="Tools">Tools</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Certifications">Certifications</option>
              <option value="Languages">Languages</option>
            </select>
            <select id="new-skill-proficiency" class="form-input w-36">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate" selected>Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button id="btn-add-skill-item" class="btn-primary px-4 py-2.5 text-xs flex items-center gap-1">
              <i data-lucide="plus" class="w-4 h-4"></i> Add Skill
            </button>
          </div>
        </div>

        <div id="skills-category-display" class="space-y-6"></div>
      </div>

      <!-- TAB 5: Projects -->
      <div id="tab-projects" class="profile-tab-pane space-y-4 hidden">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Key Projects</h3>
          <button id="btn-add-project" class="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Project
          </button>
        </div>
        <div id="projects-list-container" class="space-y-4"></div>
      </div>

      <!-- TAB 6: Leadership Experience -->
      <div id="tab-leadership" class="profile-tab-pane space-y-4 hidden">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Leadership & Positions of Responsibility</h3>
          <button id="btn-add-leadership" class="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Leadership Entry
          </button>
        </div>
        <div id="leadership-list-container" class="space-y-4"></div>
      </div>

      <!-- TAB 7: Awards & Achievements -->
      <div id="tab-awards" class="profile-tab-pane space-y-4 hidden">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300">Awards, Honors & Certifications</h3>
          <button id="btn-add-award" class="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Award / Honor
          </button>
        </div>
        <div id="awards-list-container" class="space-y-4"></div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Local state references
  let eduData = [...education];
  let expData = [...experience];
  let skillsData = [...skills];
  let projData = [...projects];
  let leadData = [...leadership];
  let awardData = [...awards];
  let certData = [...certifications];

  // Tab switching logic
  const tabBtns = container.querySelectorAll('.profile-tab-btn');
  const tabPanes = container.querySelectorAll('.profile-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'font-semibold', 'active');
        b.classList.add('text-slate-400');
      });
      btn.classList.remove('text-slate-400');
      btn.classList.add('bg-indigo-600', 'text-white', 'font-semibold', 'active');

      tabPanes.forEach(p => p.classList.add('hidden'));
      container.querySelector('#' + target).classList.remove('hidden');
    });
  });

  // Render Education records
  const renderEducation = () => {
    const el = container.querySelector('#education-list-container');
    el.innerHTML = '';
    eduData.forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3';
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span class="text-xs font-bold text-slate-300">Education #${idx + 1}</span>
          <button class="text-xs text-rose-400 hover:text-rose-300 font-medium btn-del-edu" data-idx="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i> Remove
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-400 mb-1">Institution Name</label>
            <input type="text" class="form-input edu-inst" value="${edu.institution || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Grade / GPA</label>
            <input type="text" class="form-input edu-grade" value="${edu.grade || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Degree</label>
            <input type="text" class="form-input edu-degree" value="${edu.degree || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Major / Field</label>
            <input type="text" class="form-input edu-field" value="${edu.field || ''}">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Start Year</label>
              <input type="text" class="form-input edu-start" value="${edu.start_year || ''}">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">End Year</label>
              <input type="text" class="form-input edu-end" value="${edu.end_year || ''}">
            </div>
          </div>
        </div>
      `;
      el.appendChild(card);
    });

    el.querySelectorAll('.btn-del-edu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.dataset.idx);
        eduData.splice(i, 1);
        renderEducation();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Experience records with AI Bullet Enhancer
  const renderExperience = () => {
    const el = container.querySelector('#experience-list-container');
    el.innerHTML = '';
    expData.forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4';
      
      const bulletsHtml = (exp.achievements || []).map((b, bIdx) => `
        <div class="flex items-start gap-2">
          <span class="text-indigo-400 font-bold mt-2">•</span>
          <textarea class="form-input flex-1 text-xs exp-bullet" data-expidx="${idx}" data-bidx="${bIdx}" rows="2">${b}</textarea>
          <button type="button" class="btn-ai-enhance-bullet px-2.5 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1 transition" data-expidx="${idx}" data-bidx="${bIdx}" title="Enhance with X-Y-Z Formula">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> AI
          </button>
          <button type="button" class="btn-del-bullet p-2 text-slate-400 hover:text-rose-400 rounded-lg" data-expidx="${idx}" data-bidx="${bIdx}">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span class="text-xs font-bold text-slate-300">Position #${idx + 1}</span>
          <button class="text-xs text-rose-400 hover:text-rose-300 font-medium btn-del-exp" data-idx="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i> Remove
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Company / Organization</label>
            <input type="text" class="form-input exp-company" value="${exp.company || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Job Title</label>
            <input type="text" class="form-input exp-title" value="${exp.job_title || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Location</label>
            <input type="text" class="form-input exp-loc" value="${exp.location || ''}">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Start Date</label>
              <input type="text" class="form-input exp-start" value="${exp.start_date || ''}">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">End Date</label>
              <input type="text" class="form-input exp-end" value="${exp.end_date || ''}">
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Accomplishments & Bullets (X-Y-Z Format)</label>
            <button type="button" class="btn-add-bullet text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1" data-idx="${idx}">
              + Add Bullet
            </button>
          </div>
          <div class="space-y-2">${bulletsHtml}</div>
        </div>
      `;
      el.appendChild(card);
    });

    // Wire AI Bullet Enhancer Buttons
    el.querySelectorAll('.btn-ai-enhance-bullet').forEach(btn => {
      btn.addEventListener('click', () => {
        const eIdx = parseInt(btn.dataset.expidx);
        const bIdx = parseInt(btn.dataset.bidx);
        const currentText = expData[eIdx]?.achievements?.[bIdx] || "";
        BulletEnhancerModal.open(currentText, (enhancedText) => {
          expData[eIdx].achievements[bIdx] = enhancedText;
          renderExperience();
        });
      });
    });

    el.querySelectorAll('.btn-add-bullet').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        if (!expData[i].achievements) expData[i].achievements = [];
        expData[i].achievements.push("Accomplished [task], resulting in [measurable impact], by [methods/tools used].");
        renderExperience();
      });
    });

    el.querySelectorAll('.btn-del-bullet').forEach(btn => {
      btn.addEventListener('click', () => {
        const eIdx = parseInt(btn.dataset.expidx);
        const bIdx = parseInt(btn.dataset.bidx);
        expData[eIdx].achievements.splice(bIdx, 1);
        renderExperience();
      });
    });

    el.querySelectorAll('.btn-del-exp').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        expData.splice(i, 1);
        renderExperience();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Categorized Skills
  const renderSkills = () => {
    const el = container.querySelector('#skills-category-display');
    el.innerHTML = '';

    const categories = ['Technical', 'Tools', 'Soft Skills', 'Certifications', 'Languages'];

    categories.forEach(cat => {
      const catSkills = skillsData.filter(s => s.category === cat);
      const catBox = document.createElement('div');
      catBox.className = 'p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3';
      catBox.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-300">${cat} (${catSkills.length})</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${catSkills.map(sk => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200">
              <strong>${sk.skill}</strong>
              <span class="text-[10px] text-slate-400">(${sk.proficiency || 'Intermediate'})</span>
              <button class="text-slate-400 hover:text-rose-400 btn-remove-skill ml-1" data-id="${sk.id}">
                <i data-lucide="x" class="w-3 h-3"></i>
              </button>
            </span>
          `).join('')}
          ${catSkills.length === 0 ? `<span class="text-xs text-slate-500 italic">No ${cat.toLowerCase()} added yet.</span>` : ''}
        </div>
      `;
      el.appendChild(catBox);
    });

    el.querySelectorAll('.btn-remove-skill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        skillsData = skillsData.filter(s => s.id !== id);
        renderSkills();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Projects
  const renderProjects = () => {
    const el = container.querySelector('#projects-list-container');
    el.innerHTML = '';
    projData.forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3';
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span class="text-xs font-bold text-slate-300">Project #${idx + 1}</span>
          <button class="text-xs text-rose-400 hover:text-rose-300 font-medium btn-del-proj" data-idx="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i> Remove
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Project Name</label>
            <input type="text" class="form-input proj-name" value="${proj.name || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Project / Repo URL</label>
            <input type="url" class="form-input proj-url" value="${proj.url || ''}">
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-400 mb-1">Technologies Used (comma separated)</label>
            <input type="text" class="form-input proj-tech" value="${proj.technologies || ''}">
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-400 mb-1">Description & Architecture</label>
            <textarea class="form-input proj-desc" rows="2">${proj.description || ''}</textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-400 mb-1">Measurable Outcome / Impact</label>
            <input type="text" class="form-input proj-outcome" value="${proj.outcome || ''}">
          </div>
        </div>
      `;
      el.appendChild(card);
    });

    el.querySelectorAll('.btn-del-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        projData.splice(i, 1);
        renderProjects();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Leadership Experience
  const renderLeadership = () => {
    const el = container.querySelector('#leadership-list-container');
    el.innerHTML = '';
    leadData.forEach((lead, idx) => {
      const card = document.createElement('div');
      card.className = 'p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3';
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span class="text-xs font-bold text-slate-300">Leadership Role #${idx + 1}</span>
          <button class="text-xs text-rose-400 hover:text-rose-300 font-medium btn-del-lead" data-idx="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i> Remove
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-400 mb-1">Role / Position Title</label>
            <input type="text" class="form-input lead-role" value="${lead.role || ''}">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Year</label>
            <input type="text" class="form-input lead-year" value="${lead.year || ''}">
          </div>
          <div class="sm:col-span-3">
            <label class="block text-xs text-slate-400 mb-1">Organization / Committee</label>
            <input type="text" class="form-input lead-org" value="${lead.organization || ''}">
          </div>
          <div class="sm:col-span-3">
            <label class="block text-xs text-slate-400 mb-1">Key Responsibilities & Impact</label>
            <textarea class="form-input lead-desc" rows="2">${lead.description || ''}</textarea>
          </div>
        </div>
      `;
      el.appendChild(card);
    });

    el.querySelectorAll('.btn-del-lead').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        leadData.splice(i, 1);
        renderLeadership();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Awards & Achievements
  const renderAwards = () => {
    const el = container.querySelector('#awards-list-container');
    el.innerHTML = '';
    awardData.forEach((aw, idx) => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-300">Award / Honor #${idx + 1}</span>
          <button class="text-xs text-rose-400 hover:text-rose-300 font-medium btn-del-aw" data-idx="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i> Remove
          </button>
        </div>
        <div>
          <textarea class="form-input aw-title" rows="2">${aw.title || aw}</textarea>
        </div>
      `;
      el.appendChild(card);
    });

    el.querySelectorAll('.btn-del-aw').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        awardData.splice(i, 1);
        renderAwards();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Initial renders
  renderEducation();
  renderExperience();
  renderSkills();
  renderProjects();
  renderLeadership();
  renderAwards();

  // Add Item buttons
  container.querySelector('#btn-add-education').addEventListener('click', () => {
    eduData.push({ id: 'edu_' + Date.now(), institution: '', degree: '', field: '', start_year: '', end_year: '', grade: '' });
    renderEducation();
  });

  container.querySelector('#btn-add-experience').addEventListener('click', () => {
    expData.push({ id: 'exp_' + Date.now(), company: '', job_title: '', location: '', start_date: '', end_date: '', current: false, description: '', achievements: [''] });
    renderExperience();
  });

  container.querySelector('#btn-add-project').addEventListener('click', () => {
    projData.push({ id: 'proj_' + Date.now(), name: '', description: '', technologies: '', role: '', outcome: '', url: '' });
    renderProjects();
  });

  container.querySelector('#btn-add-leadership').addEventListener('click', () => {
    leadData.push({ id: 'lead_' + Date.now(), role: '', organization: '', year: '2026', description: '' });
    renderLeadership();
  });

  container.querySelector('#btn-add-award').addEventListener('click', () => {
    awardData.push({ id: 'aw_' + Date.now(), title: '' });
    renderAwards();
  });

  container.querySelector('#btn-add-skill-item').addEventListener('click', () => {
    const input = container.querySelector('#new-skill-input');
    const name = input.value.trim();
    if (!name) return;
    const cat = container.querySelector('#new-skill-category').value;
    const prof = container.querySelector('#new-skill-proficiency').value;

    skillsData.push({
      id: 'sk_' + Date.now(),
      skill: name,
      category: cat,
      proficiency: prof
    });
    input.value = '';
    renderSkills();
  });

  // AI Summary button on profile
  container.querySelector('#btn-prof-ai-summary').addEventListener('click', () => {
    const currentProfile = {
      user: {
        name: container.querySelector('#prof-name').value,
        target_role: container.querySelector('#prof-target-role').value
      },
      education: eduData,
      experience: expData,
      skills: skillsData
    };
    SummaryModal.open(currentProfile, (selectedSummary) => {
      container.querySelector('#prof-summary').value = selectedSummary;
    });
  });

  // Save profile to database
  const saveAll = async () => {
    const updatedUser = {
      ...user,
      name: container.querySelector('#prof-name').value,
      email: container.querySelector('#prof-email').value,
      phone: container.querySelector('#prof-phone').value,
      location: container.querySelector('#prof-location').value,
      linkedin: container.querySelector('#prof-linkedin').value,
      portfolio: container.querySelector('#prof-portfolio').value,
      target_role: container.querySelector('#prof-target-role').value,
      summary: container.querySelector('#prof-summary').value
    };

    // Harvest education inputs
    const eduCards = container.querySelectorAll('#education-list-container > div');
    eduCards.forEach((c, idx) => {
      if (eduData[idx]) {
        eduData[idx].institution = c.querySelector('.edu-inst').value;
        eduData[idx].grade = c.querySelector('.edu-grade').value;
        eduData[idx].degree = c.querySelector('.edu-degree').value;
        eduData[idx].field = c.querySelector('.edu-field').value;
        eduData[idx].start_year = c.querySelector('.edu-start').value;
        eduData[idx].end_year = c.querySelector('.edu-end').value;
      }
    });

    // Harvest experience inputs
    const expCards = container.querySelectorAll('#experience-list-container > div');
    expCards.forEach((c, idx) => {
      if (expData[idx]) {
        expData[idx].company = c.querySelector('.exp-company').value;
        expData[idx].job_title = c.querySelector('.exp-title').value;
        expData[idx].location = c.querySelector('.exp-loc').value;
        expData[idx].start_date = c.querySelector('.exp-start').value;
        expData[idx].end_date = c.querySelector('.exp-end').value;
        const bEls = c.querySelectorAll('.exp-bullet');
        expData[idx].achievements = Array.from(bEls).map(b => b.value);
      }
    });

    // Harvest projects inputs
    const projCards = container.querySelectorAll('#projects-list-container > div');
    projCards.forEach((c, idx) => {
      if (projData[idx]) {
        projData[idx].name = c.querySelector('.proj-name').value;
        projData[idx].url = c.querySelector('.proj-url').value;
        projData[idx].technologies = c.querySelector('.proj-tech').value;
        projData[idx].description = c.querySelector('.proj-desc').value;
        projData[idx].outcome = c.querySelector('.proj-outcome').value;
      }
    });

    // Harvest leadership inputs
    const leadCards = container.querySelectorAll('#leadership-list-container > div');
    leadCards.forEach((c, idx) => {
      if (leadData[idx]) {
        leadData[idx].role = c.querySelector('.lead-role').value;
        leadData[idx].organization = c.querySelector('.lead-org').value;
        leadData[idx].year = c.querySelector('.lead-year').value;
        leadData[idx].description = c.querySelector('.lead-desc').value;
      }
    });

    // Harvest awards inputs
    const awCards = container.querySelectorAll('#awards-list-container > div');
    awCards.forEach((c, idx) => {
      if (awardData[idx]) {
        awardData[idx].title = c.querySelector('.aw-title').value;
      }
    });

    // Save to DB
    await db.db.users.put(updatedUser);
    
    await db.db.education.where('user_id').equals(updatedUser.id).delete();
    for (const edu of eduData) await db.db.education.put({ ...edu, user_id: updatedUser.id });

    await db.db.experience.where('user_id').equals(updatedUser.id).delete();
    for (const exp of expData) await db.db.experience.put({ ...exp, user_id: updatedUser.id });

    await db.db.skills.where('user_id').equals(updatedUser.id).delete();
    for (const sk of skillsData) await db.db.skills.put({ ...sk, user_id: updatedUser.id });

    await db.db.projects.where('user_id').equals(updatedUser.id).delete();
    for (const pr of projData) await db.db.projects.put({ ...pr, user_id: updatedUser.id });

    // Also update default resume content
    const resumes = await db.getResumes(updatedUser.id);
    if (resumes.length > 0) {
      const r = resumes[0];
      r.summary = updatedUser.summary;
      r.content = {
        personal: updatedUser,
        education: eduData,
        experience: expData,
        skills: skillsData,
        projects: projData,
        leadership: leadData,
        awards: awardData,
        certifications: certData
      };
      await db.db.resumes.put(r);
    }

    Toast.show("Career profile saved successfully!", "success");
  };

  container.querySelector('#btn-save-profile-main').addEventListener('click', saveAll);

  container.querySelector('#btn-load-sample-profile').addEventListener('click', async () => {
    if (confirm("Reset to Joel J placement profile? This will restore the uploaded template demonstration data.")) {
      await db.initSeedData(true);
      Toast.show("Joel J Placement profile loaded!", "success");
      renderProfileView(container, navigateTo);
    }
  });
}
