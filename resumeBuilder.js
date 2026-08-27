// Resume Builder View — Live ATS Editor & Free PDF Export

import { db } from '../db.js';
import { Toast } from '../components/toast.js';
import { DocumentAgent, MasterAgentManager } from '../agentManager.js';
import { BulletEnhancerModal } from '../components/bulletEnhancerModal.js';
import { SummaryModal } from '../components/summaryModal.js';

export async function renderResumeBuilderView(container, navigateTo) {
  const user = await db.getCurrentUser();
  const resumes = (await db.getResumes(user?.id)) || [];
  let currentResume = resumes[0] || null;

  if (!currentResume) {
    await db.initSeedData(true);
    const u = await db.getCurrentUser();
    currentResume = (await db.getResumes(u.id))[0];
  }

  let resumeContent = currentResume.content || {};

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <!-- Header Toolbar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-1">
            <i data-lucide="file-check-2" class="w-3.5 h-3.5"></i> Single-Column ATS Format
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            ATS Resume Builder
          </h1>
          <p class="text-xs text-slate-400">Institutional Placement, Executive Corporate, and Single-Column ATS formats with instant live preview.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
            <span class="text-[11px] text-slate-400 font-medium">Template:</span>
            <select id="select-resume-template" class="bg-transparent text-xs font-semibold text-indigo-300 focus:outline-none cursor-pointer max-w-[220px]">
              <!-- Dynamically populated from db.templates -->
            </select>
          </div>
          <button id="btn-goto-tmpl-studio" class="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition">
            <i data-lucide="palette" class="w-3.5 h-3.5"></i> + Create / Upload Template
          </button>
          <button id="btn-ai-gen-summary-top" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> AI Summary
          </button>
          <button id="btn-save-resume" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition flex items-center gap-1.5">
            <i data-lucide="save" class="w-3.5 h-3.5"></i> Save
          </button>
          <button id="btn-export-pdf" class="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30">
            <i data-lucide="download" class="w-4 h-4"></i> Export PDF
          </button>
          <button id="btn-send-to-jd-match" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5">
            <i data-lucide="crosshair" class="w-3.5 h-3.5"></i> Match with JD →
          </button>
        </div>
      </div>

      <!-- Main Split Layout: Left Editor, Right Live ATS Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT: Low-Code Live Section Editor (5 Cols) -->
        <div class="lg:col-span-5 space-y-5">
          <!-- ATS Quality Score Card -->
          <div id="ats-score-badge-card" class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm" id="ats-score-display">
                95%
              </div>
              <div>
                <div class="text-xs font-bold text-white flex items-center gap-1.5">
                  ATS Parser Compatibility
                  <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">PASSED</span>
                </div>
                <div class="text-[11px] text-slate-400">Single-column • Standard fonts • No tables</div>
              </div>
            </div>
            <button id="btn-recheck-ats" class="text-xs text-slate-400 hover:text-white" title="Re-evaluate ATS rules">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Section Tabs / Accordion -->
          <div class="space-y-3">
            <!-- 1. Contact & Summary Section -->
            <div class="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div class="p-3.5 bg-slate-950/60 flex items-center justify-between cursor-pointer accordion-header" data-target="#sec-summary-pane">
                <span class="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <i data-lucide="user" class="w-4 h-4 text-indigo-400"></i> Contact & Professional Summary
                </span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
              </div>
              <div id="sec-summary-pane" class="p-4 space-y-3">
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Resume Header Title</label>
                  <input type="text" id="rb-title" value="${currentResume.title}" class="form-input text-xs">
                </div>
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-[11px] text-slate-400">Summary Statement</label>
                    <button type="button" id="rb-ai-summary-inline" class="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
                      <i data-lucide="sparkles" class="w-3 h-3"></i> AI Rewrite
                    </button>
                  </div>
                  <textarea id="rb-summary" rows="3" class="form-input text-xs">${resumeContent.summary || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- 2. Work Experience Section -->
            <div class="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div class="p-3.5 bg-slate-950/60 flex items-center justify-between cursor-pointer accordion-header" data-target="#sec-experience-pane">
                <span class="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <i data-lucide="briefcase" class="w-4 h-4 text-cyan-400"></i> Experience Bullets (X-Y-Z)
                </span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
              </div>
              <div id="sec-experience-pane" class="p-4 space-y-4">
                <div id="rb-experience-items" class="space-y-4"></div>
              </div>
            </div>

            <!-- 3. Skills Section -->
            <div class="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div class="p-3.5 bg-slate-950/60 flex items-center justify-between cursor-pointer accordion-header" data-target="#sec-skills-pane">
                <span class="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <i data-lucide="award" class="w-4 h-4 text-emerald-400"></i> Skills & Competencies
                </span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
              </div>
              <div id="sec-skills-pane" class="p-4 space-y-3">
                <p class="text-[11px] text-slate-400">Manage skills in the Career Profile tab or quickly edit below.</p>
                <div id="rb-skills-pills" class="flex flex-wrap gap-1.5"></div>
              </div>
            </div>

            <!-- 4. Education & Projects Section -->
            <div class="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div class="p-3.5 bg-slate-950/60 flex items-center justify-between cursor-pointer accordion-header" data-target="#sec-edu-proj-pane">
                <span class="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <i data-lucide="graduation-cap" class="w-4 h-4 text-purple-400"></i> Education & Projects
                </span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
              </div>
              <div id="sec-edu-proj-pane" class="p-4 space-y-3 text-xs text-slate-300">
                <p class="text-[11px] text-slate-400">Synced directly with your Career Profile. To add new degrees or portfolio projects, use the Career Profile editor.</p>
                <button id="btn-goto-profile-from-rb" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Edit Education & Projects in Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Live Single-Column ATS Resume Document Preview (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="flex items-center gap-2">
              <i data-lucide="eye" class="w-4 h-4 text-slate-400"></i>
              Live ATS Document Rendering (Print & Parser View)
            </span>
            <span class="text-[11px] text-slate-500 font-mono">Standard Letter / A4 Format</span>
          </div>

          <!-- Document Box -->
          <div class="resume-preview-wrapper p-2 bg-slate-800/40 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
            <div id="resume-live-preview-container" class="flex justify-center p-2 sm:p-4 bg-slate-950/60 rounded-xl overflow-x-auto">
              <!-- Rendered via DocumentAgent -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Accordion toggle logic
  container.querySelectorAll('.accordion-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const target = container.querySelector(hdr.dataset.target);
      if (target) target.classList.toggle('hidden');
    });
  });

  // Re-render Preview Function
  const updateLivePreview = async () => {
    // Collect updated summary and title
    resumeContent.summary = container.querySelector('#rb-summary')?.value || resumeContent.summary;

    const templateStyle = container.querySelector('#select-resume-template')?.value || currentResume.template_style || 'placement_elite';
    let tmplObj = templateStyle;
    
    // Check if custom template config exists in db
    try {
      const customTmpl = await db.getTemplateById(templateStyle);
      if (customTmpl) tmplObj = customTmpl;
    } catch (e) {
      console.warn("Could not fetch template config", e);
    }

    const liveHtml = DocumentAgent.renderCleanATSHtml(resumeContent, tmplObj);
    const prevContainer = container.querySelector('#resume-live-preview-container');
    if (prevContainer) {
      prevContainer.innerHTML = liveHtml;
    }

    // Run ATS Compliance audit
    const check = DocumentAgent.validateATSCompliance(resumeContent);
    const scoreBadge = container.querySelector('#ats-score-display');
    if (scoreBadge) {
      scoreBadge.textContent = `${check.ats_score}%`;
    }
  };

  // Populate Templates dropdown
  const initTemplateOptions = async () => {
    const templates = await db.getTemplates();
    const sel = container.querySelector('#select-resume-template');
    if (!sel) return;

    sel.innerHTML = templates.map(t => `
      <option value="${t.id}" class="bg-slate-900 text-white" ${currentResume.template_style === t.id ? 'selected' : ''}>
        ${t.name}
      </option>
    `).join('');
  };

  await initTemplateOptions();

  // Render Experience list in Editor
  const renderExperienceEditor = () => {
    const el = container.querySelector('#rb-experience-items');
    el.innerHTML = '';

    (resumeContent.experience || []).forEach((exp, eIdx) => {
      const expBox = document.createElement('div');
      expBox.className = 'p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2';
      
      const bullets = (exp.achievements || []).map((b, bIdx) => `
        <div class="flex items-start gap-1.5">
          <textarea class="form-input flex-1 text-xs rb-exp-bullet" data-eidx="${eIdx}" data-bidx="${bIdx}" rows="2">${b}</textarea>
          <button type="button" class="btn-rb-ai-bullet p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs transition" data-eidx="${eIdx}" data-bidx="${bIdx}" title="Enhance with X-Y-Z formula">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');

      expBox.innerHTML = `
        <div class="text-xs font-bold text-slate-200 flex items-center justify-between">
          <span>${exp.job_title || 'Position'} @ ${exp.company || 'Company'}</span>
        </div>
        <div class="space-y-1.5">${bullets}</div>
      `;
      el.appendChild(expBox);
    });

    // Wire live input & AI enhancement
    el.querySelectorAll('.rb-exp-bullet').forEach(t => {
      t.addEventListener('input', () => {
        const eIdx = parseInt(t.dataset.eidx);
        const bIdx = parseInt(t.dataset.bidx);
        resumeContent.experience[eIdx].achievements[bIdx] = t.value;
        updateLivePreview();
      });
    });

    el.querySelectorAll('.btn-rb-ai-bullet').forEach(btn => {
      btn.addEventListener('click', () => {
        const eIdx = parseInt(btn.dataset.eidx);
        const bIdx = parseInt(btn.dataset.bidx);
        const curText = resumeContent.experience[eIdx].achievements[bIdx];
        BulletEnhancerModal.open(curText, (enhanced) => {
          resumeContent.experience[eIdx].achievements[bIdx] = enhanced;
          renderExperienceEditor();
          updateLivePreview();
        });
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render skills pills
  const renderSkillsPills = () => {
    const el = container.querySelector('#rb-skills-pills');
    el.innerHTML = (resumeContent.skills || []).map(sk => `
      <span class="px-2 py-1 rounded-md bg-slate-950 border border-slate-700 text-[11px] text-slate-300">
        ${sk.skill}
      </span>
    `).join('');
  };

  // Initial renders
  renderExperienceEditor();
  renderSkillsPills();
  updateLivePreview();

  // Wire summary inputs
  container.querySelector('#rb-summary').addEventListener('input', updateLivePreview);

  // Wire template style dropdown change
  container.querySelector('#select-resume-template').addEventListener('change', () => {
    currentResume.template_style = container.querySelector('#select-resume-template').value;
    updateLivePreview();
  });

  // Wire AI Summary modal triggers
  const triggerSummaryGen = () => {
    SummaryModal.open(resumeContent, (selectedSummary) => {
      resumeContent.summary = selectedSummary;
      container.querySelector('#rb-summary').value = selectedSummary;
      updateLivePreview();
    });
  };

  container.querySelector('#btn-ai-gen-summary-top').addEventListener('click', triggerSummaryGen);
  container.querySelector('#rb-ai-summary-inline').addEventListener('click', triggerSummaryGen);

  // Save Resume to DB
  container.querySelector('#btn-save-resume').addEventListener('click', async () => {
    currentResume.title = container.querySelector('#rb-title').value;
    currentResume.summary = container.querySelector('#rb-summary').value;
    currentResume.template_style = container.querySelector('#select-resume-template').value;
    currentResume.content = resumeContent;
    currentResume.updated_at = new Date().toISOString();

    await db.db.resumes.put(currentResume);
    Toast.show("Resume and template preferences saved!", "success");
  });

  // Free PDF Export
  container.querySelector('#btn-export-pdf').addEventListener('click', () => {
    const filename = `${(resumeContent.personal?.name || 'Resume').replace(/\s+/g, '_')}_ATS_Resume.pdf`;
    Toast.show("Generating clean vector ATS PDF...", "info");
    DocumentAgent.exportToPDF('ats-resume-print-area', filename);
  });

  // Send to JD Matcher
  container.querySelector('#btn-send-to-jd-match').addEventListener('click', () => {
    navigateTo('job-match');
  });

  container.querySelector('#btn-goto-tmpl-studio')?.addEventListener('click', () => {
    navigateTo('template-studio');
  });

  container.querySelector('#btn-recheck-ats').addEventListener('click', () => {
    updateLivePreview();
    Toast.show("ATS compatibility re-evaluated.", "info");
  });
}
