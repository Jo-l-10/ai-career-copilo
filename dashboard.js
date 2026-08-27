// Dashboard View

import { db } from '../db.js';
import { MasterAgentManager } from '../agentManager.js';

export async function renderDashboardView(container, navigateTo) {
  const user = await db.getCurrentUser();
  const resumes = (await db.getResumes(user?.id)) || [];
  const jds = (await db.getJobDescriptions(user?.id)) || [];
  const matches = (await db.getMatchAnalyses(user?.id)) || [];
  const fullProfile = user ? await db.getFullUserProfile(user.id) : null;

  // Calculate profile completeness using Agent 1
  let completeness = 85;
  if (fullProfile) {
    const profCheck = await MasterAgentManager.executeTask('profile', 'validate_profile', fullProfile);
    if (profCheck.completeness) completeness = profCheck.completeness;
  }

  const latestMatch = matches.length > 0 ? matches[matches.length - 1] : null;

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <!-- Top Welcome Banner -->
      <div class="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> AI Copilot Dashboard
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, ${user?.name || "Job Seeker"}! 👋
          </h1>
          <p class="text-sm text-slate-300">
            Target Role: <strong class="text-indigo-300">${user?.target_role || "Software Engineering Professional"}</strong>
          </p>
        </div>

        <!-- Profile Readiness Gauge -->
        <div class="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div class="relative w-14 h-14 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-slate-800" stroke-width="3.5" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="text-indigo-500" stroke-dasharray="${completeness}, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span class="absolute text-xs font-bold text-white">${completeness}%</span>
          </div>
          <div class="text-xs">
            <div class="font-bold text-slate-200">Profile Readiness</div>
            <div class="text-slate-400 mt-0.5">
              ${completeness >= 90 ? 'Ready for Job Matching' : 'Complete remaining fields'}
            </div>
            <button id="btn-edit-profile-top" class="text-indigo-400 hover:text-indigo-300 font-medium mt-1 inline-flex items-center gap-1">
              Edit Profile <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 4 Quick Actions Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Action 1 -->
        <button id="qa-build-resume" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-start gap-3 group text-left">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
            <i data-lucide="file-edit" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-white group-hover:text-indigo-300 transition">Build Resume</div>
            <div class="text-xs text-slate-400 mt-0.5">Live ATS resume editor</div>
          </div>
        </button>

        <!-- Action 2 -->
        <button id="qa-improve-resume" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col items-start gap-3 group text-left">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-white group-hover:text-cyan-300 transition">Improve Resume</div>
            <div class="text-xs text-slate-400 mt-0.5">X-Y-Z AI bullet polisher</div>
          </div>
        </button>

        <!-- Action 3 -->
        <button id="qa-analyze-job" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col items-start gap-3 group text-left">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
            <i data-lucide="crosshair" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-white group-hover:text-emerald-300 transition">Analyze Job</div>
            <div class="text-xs text-slate-400 mt-0.5">0–100% JD match score</div>
          </div>
        </button>

        <!-- Action 4 -->
        <button id="qa-practice-interview" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 transition flex flex-col items-start gap-3 group text-left">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
            <i data-lucide="message-square" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-white group-hover:text-purple-300 transition">Practice Interview</div>
            <div class="text-xs text-slate-400 mt-0.5">Role-specific Q&A prep</div>
          </div>
        </button>
      </div>

      <!-- Main 2-Column Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left 2 Cols: Resumes & Recent Job Match Analyses -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Recent Match Score Widget -->
          <div class="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="activity" class="w-5 h-5 text-indigo-400"></i>
                Latest Job Match Analysis
              </h3>
              <button id="btn-new-match" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                + New Analysis
              </button>
            </div>

            ${latestMatch ? `
              <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${
                    latestMatch.overall_score >= 80 ? 'from-emerald-600 to-teal-500' :
                    latestMatch.overall_score >= 60 ? 'from-amber-600 to-yellow-500' : 'from-rose-600 to-red-500'
                  } flex flex-col items-center justify-center text-white font-bold shadow-lg">
                    <span class="text-lg">${latestMatch.overall_score}%</span>
                    <span class="text-[9px] uppercase tracking-wider font-semibold opacity-80">Match</span>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-white">Target Job Comparison</h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      Matching Skills: <span class="text-emerald-400 font-medium">${(latestMatch.matching_keywords || []).length}</span> | 
                      Missing Gaps: <span class="text-rose-400 font-medium">${(latestMatch.missing_keywords || []).length}</span>
                    </p>
                  </div>
                </div>
                <button id="btn-view-match-details" class="btn-primary px-4 py-2 text-xs font-semibold">
                  View Full Breakdown
                </button>
              </div>
            ` : `
              <div class="p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                <p class="text-xs text-slate-400">No job match analysis run yet.</p>
                <button id="btn-run-first-match" class="btn-primary px-4 py-2 text-xs">
                  Run Your First Match Analysis
                </button>
              </div>
            `}
          </div>

          <!-- Saved Resumes Section -->
          <div class="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="file-text" class="w-5 h-5 text-cyan-400"></i>
                Saved Resumes (${resumes.length})
              </h3>
              <button id="btn-create-resume-sec" class="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
                + Create Resume
              </button>
            </div>

            <div class="space-y-3">
              ${resumes.map(res => `
                <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <i data-lucide="file" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">${res.title}</div>
                      <div class="text-xs text-slate-400">Version ${res.version || 1} • Single-Column ATS Format</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="btn-edit-resume-item px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition" data-id="${res.id}">
                      Edit & Export
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Col: Saved Target JDs & Quick Skill Gaps -->
        <div class="space-y-6">
          <!-- Saved Target Job Descriptions -->
          <div class="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <i data-lucide="briefcase" class="w-4 h-4 text-purple-400"></i>
                Target Job Descriptions
              </h3>
            </div>

            <div class="space-y-3">
              ${jds.map(jd => `
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div class="text-xs font-bold text-white">${jd.title}</div>
                  <div class="text-[11px] text-slate-400">${jd.company || 'Company'}</div>
                  <div class="pt-1 flex items-center justify-between text-[11px]">
                    <span class="text-emerald-400 font-medium">${jd.extracted_skills?.length || 10}+ skills identified</span>
                    <button class="text-indigo-400 hover:text-indigo-300 font-medium btn-analyze-specific-jd" data-id="${jd.id}">
                      Match Score →
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Free Tier & Privacy Badge -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 space-y-3 text-xs">
            <div class="flex items-center gap-2 text-emerald-400 font-bold">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              100% Free & Private Platform
            </div>
            <p class="text-slate-400 leading-relaxed">
              Your resume, education records, and job match analyses are stored securely inside your local browser database. Zero subscriptions, zero telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Wire navigation buttons
  const wire = (id, target) => {
    const el = container.querySelector(id);
    if (el) el.addEventListener('click', () => navigateTo(target));
  };

  wire('#btn-edit-profile-top', 'profile');
  wire('#qa-build-resume', 'resume-builder');
  wire('#qa-improve-resume', 'resume-builder');
  wire('#qa-analyze-job', 'job-match');
  wire('#qa-practice-interview', 'job-match');
  wire('#btn-new-match', 'job-match');
  wire('#btn-view-match-details', 'job-match');
  wire('#btn-run-first-match', 'job-match');
  wire('#btn-create-resume-sec', 'resume-builder');

  container.querySelectorAll('.btn-edit-resume-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('resume-builder'));
  });

  container.querySelectorAll('.btn-analyze-specific-jd').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('job-match'));
  });
}
