// Template Studio View
// Allows users to create custom resume templates by uploading a sample (PDF/Image/Text)
// or using interactive low-code visual controls, with live A4 preview and template library management.

import { db } from '../db.js';
import { DocumentAgent } from '../agentManager.js';
import { Toast } from '../components/toast.js';
import { SAMPLE_USER_PROFILE } from '../sampleData.js';

export async function renderTemplateStudioView(container, navigateTo) {
  const user = await db.getCurrentUser();
  const userId = user?.id || SAMPLE_USER_PROFILE.user.id;
  const fullProfile = await db.getFullUserProfile(userId);

  // Active template configuration in editor
  let activeTemplateConfig = {
    id: 'tmpl_custom_' + Date.now(),
    name: 'My Custom Institutional Template',
    description: 'Custom created resume layout with specialized formatting',
    type: 'custom',
    config: {
      header_style: 'placement_banner',
      section_banner_style: 'shaded_bar',
      banner_bg_color: '#d1d5db',
      banner_text_color: '#000000',
      border_color: '#4b5563',
      education_style: 'table_grid',
      left_tag_column: true,
      bullet_style: 'square',
      footer_style: 'bottom_bar',
      font_family: 'calibri',
      accent_color: '#0044cc'
    }
  };

  let previewDataSource = 'user'; // 'user' or 'joel_j'

  const getActiveResumeContent = () => {
    if (previewDataSource === 'joel_j') {
      return {
        personal: SAMPLE_USER_PROFILE.user,
        education: SAMPLE_USER_PROFILE.education,
        experience: SAMPLE_USER_PROFILE.experience,
        skills: SAMPLE_USER_PROFILE.skills,
        projects: SAMPLE_USER_PROFILE.projects,
        leadership: SAMPLE_USER_PROFILE.leadership,
        awards: SAMPLE_USER_PROFILE.awards,
        certifications: SAMPLE_USER_PROFILE.certifications
      };
    }
    return {
      personal: fullProfile.user,
      education: fullProfile.education,
      experience: fullProfile.experience,
      skills: fullProfile.skills,
      projects: fullProfile.projects,
      leadership: fullProfile.leadership,
      awards: fullProfile.awards,
      certifications: fullProfile.certifications
    };
  };

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in">
      <!-- Top Title Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              Template Studio
            </span>
            <span class="text-xs text-slate-500 font-mono">Sample 1 (Joel J) Preserved</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Custom Template Creator & Sample Importer
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            Upload any sample resume (PDF, image, or text) to auto-extract its visual layout, or customize institutional banners, table grids, tag badges, and color palettes.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-tmpl-goto-builder" class="btn-primary px-4 py-2 text-xs flex items-center gap-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Resume Builder
          </button>
        </div>
      </div>

      <!-- Main Layout: Left Controls (5 cols), Right Live A4 Preview (7 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT: Uploader & Visual Customizer (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Card 1: Sample Resume Uploader -->
          <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <i data-lucide="upload-cloud" class="w-4 h-4 text-indigo-400"></i>
                1. Upload Sample Resume
              </h3>
              <span class="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                Auto-Extract Layout
              </span>
            </div>

            <!-- Drag & Drop Zone -->
            <div id="dropzone-sample-resume" class="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/50 group">
              <input type="file" id="sample-file-input" class="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt,.html,.docx">
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-xl bg-indigo-600/10 group-hover:bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center transition">
                  <i data-lucide="file-up" class="w-5 h-5"></i>
                </div>
                <p class="text-xs font-semibold text-slate-300">
                  Click or drag sample resume here
                </p>
                <p class="text-[11px] text-slate-500">
                  Supports PDF, PNG/JPG, TXT, or HTML sample templates
                </p>
              </div>
            </div>

            <!-- Upload Analysis Insights Container -->
            <div id="analysis-insights-box" class="hidden p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-cyan-300 flex items-center gap-1.5">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Sample Layout Detected
                </span>
                <span id="detected-file-badge" class="text-[10px] text-cyan-400 font-mono">sample.pdf</span>
              </div>
              <ul id="analysis-insights-list" class="space-y-1 text-slate-300 text-[11px] list-disc list-inside"></ul>
            </div>
          </div>

          <!-- Card 2: Visual Layout & Styling Controls -->
          <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <i data-lucide="palette" class="w-4 h-4 text-cyan-400"></i>
              2. Visual Layout Customizer
            </h3>

            <!-- Template Name & Description -->
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-slate-400 mb-1 font-semibold">Template Name</label>
                <input type="text" id="ctrl-tmpl-name" class="form-input text-xs" value="${activeTemplateConfig.name}">
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-1">Description / Category</label>
                <input type="text" id="ctrl-tmpl-desc" class="form-input text-xs" value="${activeTemplateConfig.description}">
              </div>
            </div>

            <div class="border-t border-slate-800/80 pt-4 space-y-4">
              <!-- Section Header Banner Style -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-400 mb-1">Section Banner Style</label>
                  <select id="ctrl-banner-style" class="form-input text-xs">
                    <option value="shaded_bar">Shaded Banner (Institutional / IIM)</option>
                    <option value="underline">Clean Underline (Classic ATS)</option>
                    <option value="boxed">Boxed Accent Bar (Modern Tech)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-slate-400 mb-1">Header Style</label>
                  <select id="ctrl-header-style" class="form-input text-xs">
                    <option value="placement_banner">Left Banner with Email</option>
                    <option value="classic_center">Centered Traditional</option>
                    <option value="modern_split">Modern Split with Accent</option>
                  </select>
                </div>
              </div>

              <!-- Education Layout & Left Tags -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-400 mb-1">Education Section Format</label>
                  <select id="ctrl-edu-style" class="form-input text-xs">
                    <option value="table_grid">4-Column Grid Table (Placement)</option>
                    <option value="list_bullets">Bulleted List Format</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-slate-400 mb-1">Left Category Tag Boxes</label>
                  <select id="ctrl-left-tags" class="form-input text-xs">
                    <option value="true">Enabled (Responsibilities, Projects Tags)</option>
                    <option value="false">Disabled (Standard Full-Width)</option>
                  </select>
                </div>
              </div>

              <!-- Bullet Symbol & Typography -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-400 mb-1">Bullet Point Symbol</label>
                  <select id="ctrl-bullet-style" class="form-input text-xs">
                    <option value="square">Square Bullet (▪)</option>
                    <option value="disc">Standard Disc (•)</option>
                    <option value="dash">En Dash (–)</option>
                    <option value="arrow">Pointer Arrow (▸)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-slate-400 mb-1">Typography Font</label>
                  <select id="ctrl-font-family" class="form-input text-xs">
                    <option value="calibri">Calibri / Arial (Institutional Standard)</option>
                    <option value="times">Times New Roman (Academic / Legal)</option>
                    <option value="inter">Inter (Modern Clean Sans)</option>
                    <option value="arial">Arial (Executive Clean)</option>
                  </select>
                </div>
              </div>

              <!-- Color Palette Controls -->
              <div class="space-y-3 pt-2">
                <label class="block text-xs font-semibold text-slate-300">Color Palette & Accents</label>
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Banner BG</label>
                    <div class="flex items-center gap-1.5">
                      <input type="color" id="ctrl-banner-bg-picker" class="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent" value="#d1d5db">
                      <input type="text" id="ctrl-banner-bg" class="form-input text-[11px] p-1.5" value="#d1d5db">
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Border Color</label>
                    <div class="flex items-center gap-1.5">
                      <input type="color" id="ctrl-border-picker" class="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent" value="#4b5563">
                      <input type="text" id="ctrl-border-col" class="form-input text-[11px] p-1.5" value="#4b5563">
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400 mb-1">Accent Link</label>
                    <div class="flex items-center gap-1.5">
                      <input type="color" id="ctrl-accent-picker" class="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent" value="#0044cc">
                      <input type="text" id="ctrl-accent-col" class="form-input text-[11px] p-1.5" value="#0044cc">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Contact Style -->
              <div>
                <label class="block text-xs text-slate-400 mb-1">Contact Bar Location</label>
                <select id="ctrl-footer-style" class="form-input text-xs">
                  <option value="bottom_bar">Bottom Footer Bar (Placement Elite Standard)</option>
                  <option value="top_contact">Top Header Inline</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-3 pt-3">
              <button type="button" id="btn-save-custom-template" class="btn-primary flex-1 w-full py-2.5 text-xs flex items-center justify-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> Save Custom Template
              </button>
              <button type="button" id="btn-apply-template-to-resume" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition w-full sm:w-auto">
                <i data-lucide="check" class="w-4 h-4"></i> Apply to Resume
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: Live A4 Document Canvas Preview (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <i data-lucide="eye" class="w-4 h-4 text-cyan-400"></i>
              <span class="font-bold text-slate-200">Live Template Canvas Preview</span>
            </div>
            
            <div class="flex items-center gap-3">
              <!-- Sample Data Selector -->
              <div class="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                <span class="text-slate-500">Preview Data:</span>
                <button type="button" id="toggle-data-user" class="px-2 py-0.5 rounded ${previewDataSource === 'user' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}">My Profile</button>
                <button type="button" id="toggle-data-joel" class="px-2 py-0.5 rounded ${previewDataSource === 'joel_j' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}">Sample 1 (Joel J)</button>
              </div>

              <button type="button" id="btn-tmpl-export-pdf" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Export PDF
              </button>
            </div>
          </div>

          <!-- Document Canvas Wrapper -->
          <div class="p-2 sm:p-4 bg-slate-950/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl flex justify-center">
            <div id="tmpl-live-preview-container" class="flex justify-center w-full overflow-x-auto">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM: Template Library Manager -->
      <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="layers" class="w-5 h-5 text-indigo-400"></i>
              Template Library
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Manage built-in standard institutional templates and your custom created templates.
            </p>
          </div>
        </div>

        <div id="templates-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Re-render Live Preview
  const updateStudioPreview = () => {
    const resumeContent = getActiveResumeContent();
    const liveHtml = DocumentAgent.renderCleanATSHtml(resumeContent, activeTemplateConfig);
    const prev = container.querySelector('#tmpl-live-preview-container');
    if (prev) prev.innerHTML = liveHtml;
  };

  // Sync inputs to activeTemplateConfig
  const syncInputsToConfig = () => {
    activeTemplateConfig.name = container.querySelector('#ctrl-tmpl-name').value;
    activeTemplateConfig.description = container.querySelector('#ctrl-tmpl-desc').value;
    activeTemplateConfig.config.section_banner_style = container.querySelector('#ctrl-banner-style').value;
    activeTemplateConfig.config.header_style = container.querySelector('#ctrl-header-style').value;
    activeTemplateConfig.config.education_style = container.querySelector('#ctrl-edu-style').value;
    activeTemplateConfig.config.left_tag_column = container.querySelector('#ctrl-left-tags').value === 'true';
    activeTemplateConfig.config.bullet_style = container.querySelector('#ctrl-bullet-style').value;
    activeTemplateConfig.config.font_family = container.querySelector('#ctrl-font-family').value;
    activeTemplateConfig.config.banner_bg_color = container.querySelector('#ctrl-banner-bg').value;
    activeTemplateConfig.config.border_color = container.querySelector('#ctrl-border-col').value;
    activeTemplateConfig.config.accent_color = container.querySelector('#ctrl-accent-col').value;
    activeTemplateConfig.config.footer_style = container.querySelector('#ctrl-footer-style').value;

    updateStudioPreview();
  };

  // Sync config back to form controls
  const syncConfigToInputs = (tmpl) => {
    activeTemplateConfig = { ...tmpl };
    container.querySelector('#ctrl-tmpl-name').value = tmpl.name || 'Custom Template';
    container.querySelector('#ctrl-tmpl-desc').value = tmpl.description || '';
    container.querySelector('#ctrl-banner-style').value = tmpl.config.section_banner_style || 'shaded_bar';
    container.querySelector('#ctrl-header-style').value = tmpl.config.header_style || 'placement_banner';
    container.querySelector('#ctrl-edu-style').value = tmpl.config.education_style || 'table_grid';
    container.querySelector('#ctrl-left-tags').value = tmpl.config.left_tag_column ? 'true' : 'false';
    container.querySelector('#ctrl-bullet-style').value = tmpl.config.bullet_style || 'square';
    container.querySelector('#ctrl-font-family').value = tmpl.config.font_family || 'calibri';
    
    container.querySelector('#ctrl-banner-bg').value = tmpl.config.banner_bg_color || '#d1d5db';
    container.querySelector('#ctrl-banner-bg-picker').value = tmpl.config.banner_bg_color || '#d1d5db';
    
    container.querySelector('#ctrl-border-col').value = tmpl.config.border_color || '#4b5563';
    container.querySelector('#ctrl-border-picker').value = tmpl.config.border_color || '#4b5563';
    
    container.querySelector('#ctrl-accent-col').value = tmpl.config.accent_color || '#0044cc';
    container.querySelector('#ctrl-accent-picker').value = tmpl.config.accent_color || '#0044cc';

    container.querySelector('#ctrl-footer-style').value = tmpl.config.footer_style || 'bottom_bar';

    updateStudioPreview();
  };

  // Wire input listeners
  const inputSelectors = [
    '#ctrl-tmpl-name', '#ctrl-tmpl-desc', '#ctrl-banner-style', '#ctrl-header-style',
    '#ctrl-edu-style', '#ctrl-left-tags', '#ctrl-bullet-style', '#ctrl-font-family',
    '#ctrl-banner-bg', '#ctrl-border-col', '#ctrl-accent-col', '#ctrl-footer-style'
  ];
  inputSelectors.forEach(sel => {
    container.querySelector(sel)?.addEventListener('input', syncInputsToConfig);
    container.querySelector(sel)?.addEventListener('change', syncInputsToConfig);
  });

  // Color pickers sync
  container.querySelector('#ctrl-banner-bg-picker').addEventListener('input', (e) => {
    container.querySelector('#ctrl-banner-bg').value = e.target.value;
    syncInputsToConfig();
  });
  container.querySelector('#ctrl-border-picker').addEventListener('input', (e) => {
    container.querySelector('#ctrl-border-col').value = e.target.value;
    syncInputsToConfig();
  });
  container.querySelector('#ctrl-accent-picker').addEventListener('input', (e) => {
    container.querySelector('#ctrl-accent-col').value = e.target.value;
    syncInputsToConfig();
  });

  // Render Template Library Cards
  const renderTemplateLibrary = async () => {
    const templates = await db.getTemplates();
    const grid = container.querySelector('#templates-grid');
    grid.innerHTML = '';

    templates.forEach(t => {
      const card = document.createElement('div');
      card.className = `p-4 rounded-xl border transition ${t.id === activeTemplateConfig.id ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'} space-y-3 flex flex-col justify-between`;
      card.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold ${t.id === activeTemplateConfig.id ? 'text-indigo-300' : 'text-white'}">
              ${t.name}
            </span>
            ${t.type === 'builtin' ? `
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">Preset</span>
            ` : `
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">Custom</span>
            `}
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">${t.description || 'Custom template layout'}</p>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button class="btn-load-tmpl px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-white font-medium flex-1 transition" data-id="${t.id}">
            Load & Edit
          </button>
          ${t.type !== 'builtin' ? `
            <button class="btn-del-tmpl p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition" data-id="${t.id}" title="Delete Template">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.btn-load-tmpl').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const tmpl = await db.getTemplateById(id);
        if (tmpl) {
          syncConfigToInputs(tmpl);
          renderTemplateLibrary();
          Toast.show(`Loaded '${tmpl.name}' into editor`, 'info');
        }
      });
    });

    grid.querySelectorAll('.btn-del-tmpl').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm("Delete this custom template?")) {
          await db.deleteTemplate(id);
          Toast.show("Custom template deleted", "success");
          renderTemplateLibrary();
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Sample Upload Handler
  const dropzone = container.querySelector('#dropzone-sample-resume');
  const fileInput = container.querySelector('#sample-file-input');

  dropzone.addEventListener('click', () => fileInput.click());

  const handleFileUpload = async (file) => {
    if (!file) return;
    Toast.show(`Analyzing sample '${file.name}'...`, 'info');

    let textContent = '';
    try {
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.html')) {
        textContent = await file.text();
      } else {
        textContent = file.name; // Fallback text extractor
      }
    } catch (e) {
      console.warn("Could not read file text", e);
    }

    const detected = DocumentAgent.analyzeUploadedSample(file.name, textContent);
    syncConfigToInputs(detected);

    // Show analysis insights
    const insightsBox = container.querySelector('#analysis-insights-box');
    const insightsList = container.querySelector('#analysis-insights-list');
    const fileBadge = container.querySelector('#detected-file-badge');
    
    fileBadge.textContent = file.name;
    insightsList.innerHTML = detected.analysis_insights.map(i => `<li>${i}</li>`).join('');
    insightsBox.classList.remove('hidden');

    Toast.show(`Extracted visual layout from '${file.name}'!`, 'success');
  };

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-indigo-500', 'bg-indigo-950/20');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  // Toggle Preview Data Source
  container.querySelector('#toggle-data-user').addEventListener('click', () => {
    previewDataSource = 'user';
    container.querySelector('#toggle-data-user').className = 'px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold';
    container.querySelector('#toggle-data-joel').className = 'px-2 py-0.5 rounded text-slate-400';
    updateStudioPreview();
  });

  container.querySelector('#toggle-data-joel').addEventListener('click', () => {
    previewDataSource = 'joel_j';
    container.querySelector('#toggle-data-joel').className = 'px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold';
    container.querySelector('#toggle-data-user').className = 'px-2 py-0.5 rounded text-slate-400';
    updateStudioPreview();
  });

  // Save Custom Template
  container.querySelector('#btn-save-custom-template').addEventListener('click', async () => {
    syncInputsToConfig();
    const savedId = await db.saveTemplate(activeTemplateConfig);
    activeTemplateConfig.id = savedId;
    Toast.show(`Template '${activeTemplateConfig.name}' saved to library!`, 'success');
    renderTemplateLibrary();
  });

  // Apply Template to Resume & Navigate
  container.querySelector('#btn-apply-template-to-resume').addEventListener('click', async () => {
    syncInputsToConfig();
    const savedId = await db.saveTemplate(activeTemplateConfig);
    
    // Update default resume with this template
    const resumes = await db.getResumes(userId);
    if (resumes.length > 0) {
      resumes[0].template_style = savedId;
      await db.db.resumes.put(resumes[0]);
    }

    Toast.show(`Applied '${activeTemplateConfig.name}' to your active resume!`, 'success');
    navigateTo('resume-builder');
  });

  // Export PDF from preview
  container.querySelector('#btn-tmpl-export-pdf').addEventListener('click', () => {
    const filename = `${activeTemplateConfig.name.replace(/\s+/g, '_')}.pdf`;
    Toast.show("Exporting vector PDF...", "info");
    DocumentAgent.exportToPDF('ats-resume-print-area', filename);
  });

  container.querySelector('#btn-tmpl-goto-builder').addEventListener('click', () => {
    navigateTo('resume-builder');
  });

  // Initial renders
  updateStudioPreview();
  renderTemplateLibrary();
}
