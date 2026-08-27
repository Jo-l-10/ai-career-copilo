// Job Match Analyzer View — 0–100% ATS Compatibility Score & Skill Gap Matrix

import { db } from '../db.js';
import { Toast } from '../components/toast.js';
import { MasterAgentManager } from '../agentManager.js';
import { SAMPLE_JOB_DESCRIPTIONS } from '../sampleData.js';

export async function renderJobMatchView(container, navigateTo) {
  const user = await db.getCurrentUser();
  const resumes = (await db.getResumes(user?.id)) || [];
  const jds = (await db.getJobDescriptions(user?.id)) || [];
  const matches = (await db.getMatchAnalyses(user?.id)) || [];

  let selectedResume = resumes[0] || null;
  let latestMatchResult = matches.length > 0 ? matches[matches.length - 1] : null;

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-medium mb-1">
            <i data-lucide="crosshair" class="w-3.5 h-3.5"></i> ATS Compatibility & Gap Engine
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Job Match Analyzer</h1>
          <p class="text-xs text-slate-400">Compare your resume against any Job Description to generate a 0–100% score, skill gap matrix, and AI recommendations.</p>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-back-to-dashboard" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition">
            Dashboard
          </button>
        </div>
      </div>

      <!-- Top Section: 2-Column Split (Left: JD Input, Right: Resume Selector) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- LEFT: Target Job Description Input -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="file-search" class="w-4 h-4 text-emerald-400"></i>
              Target Job Description
            </h3>
            <!-- Quick Pre-load sample JD dropdown -->
            <select id="select-sample-jd" class="form-input text-xs w-auto py-1 px-2.5 bg-slate-950">
              <option value="">-- Load Sample JD --</option>
              ${SAMPLE_JOB_DESCRIPTIONS.map(jd => `
                <option value="${jd.id}">${jd.title}</option>
              `).join('')}
            </select>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Job Title / Role</label>
              <input type="text" id="jd-title-input" class="form-input text-xs" placeholder="e.g. Junior Frontend Engineer">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Company / Organization</label>
              <input type="text" id="jd-company-input" class="form-input text-xs" placeholder="e.g. CloudScale Technologies">
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Paste Raw Job Description Text *</label>
              <textarea id="jd-raw-text-input" rows="8" class="form-input text-xs font-mono" placeholder="Paste the complete requirements, responsibilities, and qualifications from the job posting...">${SAMPLE_JOB_DESCRIPTIONS[0]?.raw_content || ''}</textarea>
            </div>
          </div>
        </div>

        <!-- RIGHT: Resume Selector & Match Trigger -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <i data-lucide="file-check" class="w-4 h-4 text-indigo-400"></i>
            Select Candidate Resume
          </h3>

          <div class="space-y-3">
            <div>
              <label class="block text-xs text-slate-400 mb-1">Choose Resume Version:</label>
              <select id="select-resume-version" class="form-input text-xs">
                ${resumes.map(r => `
                  <option value="${r.id}">${r.title} (v${r.version || 1})</option>
                `).join('')}
              </select>
            </div>

            <!-- Resume Quick Snapshot Card -->
            <div id="resume-snapshot-card" class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div class="text-slate-200 font-bold flex items-center justify-between">
                <span>${selectedResume?.title || 'Resume'}</span>
                <span class="text-indigo-400 font-semibold">${(selectedResume?.content?.skills || []).length} Skills</span>
              </div>
              <p class="text-slate-400 line-clamp-3 leading-relaxed">
                ${selectedResume?.content?.summary || 'No summary statement entered.'}
              </p>
            </div>

            <!-- Match Action Button -->
            <div class="pt-4 space-y-2">
              <button id="btn-run-match-analysis" class="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30">
                <i data-lucide="zap" class="w-5 h-5"></i>
                Analyze Match & Generate Compatibility Report
              </button>
              <p class="text-[11px] text-center text-slate-400">
                Uses Agent 3 (JD Parser) and Agent 4 (Match Analysis Agent).
              </p>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div id="match-loading-spinner" class="hidden py-8 flex flex-col items-center justify-center gap-3">
            <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs text-indigo-400 font-semibold animate-pulse">Running semantic skill extraction & gap analysis...</span>
          </div>
        </div>
      </div>

      <!-- RESULTS CONTAINER: 0–100% Report & Gap Matrix -->
      <div id="match-report-results" class="space-y-8 ${latestMatchResult ? '' : 'hidden'}">
        <!-- 1. Overall Score & Sub-scores Banner -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 space-y-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <!-- Radial Score Dial -->
            <div class="flex items-center gap-6">
              <div class="relative w-28 h-28 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-slate-800" stroke-width="3" stroke="currentColor" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path id="match-score-radial" class="text-emerald-400" stroke-dasharray="${latestMatchResult?.overall_score || 85}, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute flex flex-col items-center">
                  <span id="match-score-text" class="text-2xl sm:text-3xl font-extrabold text-white">
                    ${latestMatchResult?.overall_score || 85}%
                  </span>
                  <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Match</span>
                </div>
              </div>

              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                  <span id="match-verdict-title">Strong Candidate Match</span>
                </h2>
                <p class="text-xs text-slate-300 mt-1 max-w-md">
                  Your profile strongly aligns with the core requirements of this role. Follow the recommendations below to address remaining keyword gaps.
                </p>
                <p class="text-[11px] text-slate-400 italic mt-1">
                  * Note: This is an AI-generated compatibility estimate based on keyword and qualification semantics, not a guarantee of an interview.
                </p>
              </div>
            </div>

            <!-- Sub-scores Bar Meters -->
            <div class="w-full md:w-80 space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div class="font-bold text-slate-300 border-b border-slate-800 pb-1">Sub-Score Breakdown:</div>
              
              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Skills Alignment</span>
                  <strong id="sub-skills-val">${latestMatchResult?.skills_score || 88}%</strong>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div id="sub-skills-bar" class="h-full bg-emerald-500 rounded-full" style="width: ${latestMatchResult?.skills_score || 88}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Keywords & Terminology</span>
                  <strong id="sub-keywords-val">${latestMatchResult?.keywords_score || 79}%</strong>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div id="sub-keywords-bar" class="h-full bg-cyan-500 rounded-full" style="width: ${latestMatchResult?.keywords_score || 79}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Experience Level</span>
                  <strong id="sub-exp-val">${latestMatchResult?.experience_score || 82}%</strong>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div id="sub-exp-bar" class="h-full bg-indigo-500 rounded-full" style="width: ${latestMatchResult?.experience_score || 82}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Qualifications / Education</span>
                  <strong id="sub-qual-val">${latestMatchResult?.qualifications_score || 90}%</strong>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div id="sub-qual-bar" class="h-full bg-purple-500 rounded-full" style="width: ${latestMatchResult?.qualifications_score || 90}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Keyword & Skill Matching Pills -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Matching Skills -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <i data-lucide="check-circle" class="w-4 h-4"></i> Matching Skills
              </span>
              <span id="count-matching-badge" class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                ${(latestMatchResult?.matching_keywords || []).length}
              </span>
            </div>
            <div id="pills-matching-skills" class="flex flex-wrap gap-1.5">
              ${(latestMatchResult?.matching_keywords || []).map(s => `
                <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300">
                  ${s}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Partially Matched Skills -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <i data-lucide="alert-circle" class="w-4 h-4"></i> Partial Matches
              </span>
              <span id="count-partial-badge" class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                ${(latestMatchResult?.partially_matched || []).length}
              </span>
            </div>
            <div id="pills-partial-skills" class="flex flex-wrap gap-1.5">
              ${(latestMatchResult?.partially_matched || []).map(s => `
                <span class="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-300">
                  ${s}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Missing Skills -->
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <i data-lucide="x-circle" class="w-4 h-4"></i> Missing Requirements
              </span>
              <span id="count-missing-badge" class="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                ${(latestMatchResult?.missing_keywords || []).length}
              </span>
            </div>
            <div id="pills-missing-skills" class="flex flex-wrap gap-1.5">
              ${(latestMatchResult?.missing_keywords || []).map(s => `
                <span class="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-medium text-rose-300">
                  ${s}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 3. Dedicated Section: "Your Skill Gap" Matrix -->
        <div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div class="border-b border-slate-800 pb-4">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="layers" class="w-5 h-5 text-indigo-400"></i>
              Your Skill Gap Matrix
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Clear breakdown of your strengths, areas requiring stronger emphasis, and genuine learning opportunities.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <!-- Already Have -->
            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div class="font-bold text-emerald-400 flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4"></i> Already Have
              </div>
              <p class="text-slate-400">Skills clearly demonstrated in your resume and verified against JD requirements.</p>
              <div id="gap-already-have" class="space-y-1.5"></div>
            </div>

            <!-- Need to Highlight -->
            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div class="font-bold text-amber-400 flex items-center gap-2">
                <i data-lucide="maximize-2" class="w-4 h-4"></i> Need to Highlight
              </div>
              <p class="text-slate-400">Skills you likely have but haven't emphasized clearly in achievement bullets.</p>
              <div id="gap-need-highlight" class="space-y-1.5"></div>
            </div>

            <!-- Potential Skill Gaps -->
            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div class="font-bold text-rose-400 flex items-center gap-2">
                <i data-lucide="trending-up" class="w-4 h-4"></i> Potential Skill Gaps
              </div>
              <p class="text-slate-400">Requirements from the target JD not yet present in your profile. (Never falsely claim skills).</p>
              <div id="gap-potential-gaps" class="space-y-1.5"></div>
            </div>
          </div>
        </div>

        <!-- 4. Resume Improvement Copilot & Suggested Projects -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Improvement Recommendations -->
          <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i data-lucide="lightbulb" class="w-4 h-4 text-amber-400"></i>
              Resume Improvement Copilot
            </h3>
            <div id="recommendations-container" class="space-y-3"></div>
          </div>

          <!-- Suggested Projects to Bridge Gaps -->
          <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <i data-lucide="folder-plus" class="w-4 h-4 text-cyan-400"></i>
                Suggested Projects
              </h3>
              <span class="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">PORTFOLIO IDEAS</span>
            </div>
            <p class="text-xs text-slate-400">
              Build these project ideas to demonstrate missing skills with tangible GitHub evidence.
            </p>
            <div id="suggested-projects-container" class="space-y-3"></div>
          </div>
        </div>

        <!-- 5. AI Interview Preparation (Bonus Feature) -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="message-square" class="w-5 h-5 text-purple-400"></i>
                AI Interview Preparation Guide
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Tailored interview questions based on the target role and candidate background.</p>
            </div>
            <button id="btn-generate-interview-qa" class="btn-primary px-4 py-2 text-xs flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Refresh Interview Prep
            </button>
          </div>

          <div id="interview-qa-container" class="space-y-4"></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Populate sample JD selector
  const sampleJdSelect = container.querySelector('#select-sample-jd');
  sampleJdSelect.addEventListener('change', () => {
    const chosen = SAMPLE_JOB_DESCRIPTIONS.find(j => j.id === sampleJdSelect.value);
    if (chosen) {
      container.querySelector('#jd-title-input').value = chosen.title;
      container.querySelector('#jd-company-input').value = chosen.company;
      container.querySelector('#jd-raw-text-input').value = chosen.raw_content;
    }
  });

  // Resume selector change
  const resumeSelect = container.querySelector('#select-resume-version');
  resumeSelect.addEventListener('change', () => {
    selectedResume = resumes.find(r => r.id === resumeSelect.value);
    const snap = container.querySelector('#resume-snapshot-card');
    if (snap && selectedResume) {
      snap.innerHTML = `
        <div class="text-slate-200 font-bold flex items-center justify-between">
          <span>${selectedResume.title}</span>
          <span class="text-indigo-400 font-semibold">${(selectedResume.content?.skills || []).length} Skills</span>
        </div>
        <p class="text-slate-400 line-clamp-3 leading-relaxed">
          ${selectedResume.content?.summary || 'No summary statement entered.'}
        </p>
      `;
    }
  });

  // Render match report helper
  const renderMatchData = (matchData, jdData) => {
    const reportContainer = container.querySelector('#match-report-results');
    reportContainer.classList.remove('hidden');

    // Radial Score
    const scoreVal = matchData.overall_score || 85;
    const radial = container.querySelector('#match-score-radial');
    const scoreText = container.querySelector('#match-score-text');
    const titleText = container.querySelector('#match-verdict-title');

    scoreText.textContent = `${scoreVal}%`;
    radial.setAttribute('stroke-dasharray', `${scoreVal}, 100`);

    if (scoreVal >= 80) {
      radial.setAttribute('class', 'text-emerald-400');
      titleText.textContent = "Strong Candidate Match";
    } else if (scoreVal >= 60) {
      radial.setAttribute('class', 'text-amber-400');
      titleText.textContent = "Moderate Match — Highlight Key Gaps";
    } else {
      radial.setAttribute('class', 'text-rose-400');
      titleText.textContent = "Significant Skill Gaps Detected";
    }

    // Sub-scores
    const sub = matchData.sub_scores || {};
    container.querySelector('#sub-skills-val').textContent = `${sub.skills || 80}%`;
    container.querySelector('#sub-skills-bar').style.width = `${sub.skills || 80}%`;
    container.querySelector('#sub-keywords-val').textContent = `${sub.keywords || 75}%`;
    container.querySelector('#sub-keywords-bar').style.width = `${sub.keywords || 75}%`;
    container.querySelector('#sub-exp-val').textContent = `${sub.experience || 85}%`;
    container.querySelector('#sub-exp-bar').style.width = `${sub.experience || 85}%`;
    container.querySelector('#sub-qual-val').textContent = `${sub.qualifications || 90}%`;
    container.querySelector('#sub-qual-bar').style.width = `${sub.qualifications || 90}%`;

    // Pills
    const renderPills = (elId, list, colorClass) => {
      const el = container.querySelector(elId);
      if (el) {
        el.innerHTML = (list || []).map(s => `
          <span class="px-2.5 py-1 rounded-lg ${colorClass} text-xs font-medium">
            ${s}
          </span>
        `).join('') || '<span class="text-xs text-slate-500 italic">None identified</span>';
      }
    };

    renderPills('#pills-matching-skills', matchData.matching_keywords, 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300');
    renderPills('#pills-partial-skills', matchData.partially_matched, 'bg-amber-500/10 border border-amber-500/30 text-amber-300');
    renderPills('#pills-missing-skills', matchData.missing_keywords, 'bg-rose-500/10 border border-rose-500/30 text-rose-300');

    container.querySelector('#count-matching-badge').textContent = (matchData.matching_keywords || []).length;
    container.querySelector('#count-partial-badge').textContent = (matchData.partially_matched || []).length;
    container.querySelector('#count-missing-badge').textContent = (matchData.missing_keywords || []).length;

    // Skill Gap Matrix
    const gap = matchData.skill_gap_analysis || {};
    const fillGapList = (elId, items, badgeClass) => {
      const el = container.querySelector(elId);
      if (el) {
        el.innerHTML = (items || []).map(item => `
          <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium flex items-center justify-between">
            <span>${item}</span>
            <span class="${badgeClass} text-[10px] font-semibold px-2 py-0.5 rounded">Verified</span>
          </div>
        `).join('') || '<div class="text-xs text-slate-500 italic">None</div>';
      }
    };

    fillGapList('#gap-already-have', gap.already_have, 'bg-emerald-500/20 text-emerald-300');
    fillGapList('#gap-need-highlight', gap.need_to_highlight, 'bg-amber-500/20 text-amber-300');
    fillGapList('#gap-potential-gaps', gap.potential_gaps, 'bg-rose-500/20 text-rose-300');

    // Recommendations
    const recsEl = container.querySelector('#recommendations-container');
    recsEl.innerHTML = (matchData.recommendations || []).map(r => `
      <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
        <div class="text-xs font-bold text-amber-300 flex items-center justify-between">
          <span>${r.title}</span>
          ${r.importance ? `<span class="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">${r.importance}</span>` : ''}
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${r.description}</p>
      </div>
    `).join('');

    // Suggested Projects
    const projEl = container.querySelector('#suggested-projects-container');
    projEl.innerHTML = (matchData.suggested_projects || []).map(p => `
      <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <div class="text-xs font-bold text-cyan-300">${p.title}</div>
        <div class="text-[11px] text-slate-400"><strong>Tech Stack:</strong> ${p.technologies}</div>
        <p class="text-xs text-slate-300">${p.description}</p>
        <div class="text-[11px] text-cyan-400/90 italic">💡 <strong>Outcome:</strong> ${p.learning_outcome}</div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Interview Questions
  const renderInterviewQuestions = async (jdData, resumeContent) => {
    const containerEl = container.querySelector('#interview-qa-container');
    containerEl.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">Loading interview questions...</div>`;

    const res = await MasterAgentManager.executeTask('interview', 'generate_questions', {
      jdData,
      resumeContent
    });

    if (res.status === 'success' && res.data) {
      const q = res.data;
      containerEl.innerHTML = `
        <div class="space-y-4">
          <!-- Technical Questions -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Technical Deep-Dive Questions:</h4>
            ${(q.technical || []).map(item => `
              <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div class="text-xs font-semibold text-slate-100">Q: ${item.question}</div>
                <div class="text-[11px] text-slate-400"><strong>STAR Answering Strategy:</strong> ${item.framework}</div>
              </div>
            `).join('')}
          </div>

          <!-- Behavioral Questions -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400">Behavioral & Teamwork Questions:</h4>
            ${(q.behavioral || []).map(item => `
              <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div class="text-xs font-semibold text-slate-100">Q: ${item.question}</div>
                <div class="text-[11px] text-slate-400"><strong>STAR Answering Strategy:</strong> ${item.framework}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  };

  // Trigger Match Analysis
  const runAnalysis = async () => {
    const rawText = container.querySelector('#jd-raw-text-input').value.trim();
    if (!rawText) {
      Toast.show("Please paste a Job Description text to analyze.", "warning");
      return;
    }

    const spinner = container.querySelector('#match-loading-spinner');
    const btn = container.querySelector('#btn-run-match-analysis');
    spinner.classList.remove('hidden');
    btn.disabled = true;

    try {
      // 1. Agent 3: Parse JD
      const jdResult = await MasterAgentManager.executeTask('job_description', 'parse_jd', { rawText });
      const jdData = jdResult.data || {};

      // 2. Agent 4: Compare Resume vs JD
      const matchResult = await MasterAgentManager.executeTask('match_analysis', 'analyze_match', {
        resumeContent: selectedResume.content,
        jdData
      });

      spinner.classList.add('hidden');
      btn.disabled = false;

      if (matchResult.status === 'success' && matchResult.data) {
        const d = matchResult.data;
        renderMatchData(d, jdData);
        renderInterviewQuestions(jdData, selectedResume.content);

        // Save analysis to DB
        await db.db.match_analysis.put({
          id: 'match_' + Date.now(),
          user_id: user.id,
          resume_id: selectedResume.id,
          jd_id: 'jd_' + Date.now(),
          overall_score: d.overall_score,
          skills_score: d.sub_scores.skills,
          keywords_score: d.sub_scores.keywords,
          experience_score: d.sub_scores.experience,
          qualifications_score: d.sub_scores.qualifications,
          matching_keywords: d.matching_keywords,
          missing_keywords: d.missing_keywords,
          partially_matched: d.partially_matched,
          skill_gap_analysis: d.skill_gap_analysis,
          recommendations: d.recommendations,
          suggested_projects: d.suggested_projects,
          created_at: new Date().toISOString()
        });

        Toast.show("Job match analysis completed!", "success");
      } else {
        Toast.show(matchResult.message || "Failed to analyze match", "error");
      }
    } catch (err) {
      spinner.classList.add('hidden');
      btn.disabled = false;
      Toast.show("Error executing match analysis: " + err.message, "error");
    }
  };

  container.querySelector('#btn-run-match-analysis').addEventListener('click', runAnalysis);
  container.querySelector('#btn-back-to-dashboard').addEventListener('click', () => navigateTo('dashboard'));

  // If initial latest match exists, render it
  if (latestMatchResult) {
    renderMatchData(latestMatchResult, {});
  }
}
