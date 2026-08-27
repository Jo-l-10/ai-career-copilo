// AI Professional Summary Generator Modal with 3 ATS-Friendly Versions

import { MasterAgentManager } from '../agentManager.js';
import { Toast } from './toast.js';

export class SummaryModal {
  static open(profile, onSelectCallback = null) {
    const existing = document.getElementById('summary-generator-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'summary-generator-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in';

    modal.innerHTML = `
      <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <i data-lucide="file-text" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                AI Professional Summary Generator
              </h3>
              <p class="text-xs text-slate-400">Tailored to your education, experience, skills, and target role</p>
            </div>
          </div>
          <button id="close-summary-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-5">
          <!-- Profile context banner -->
          <div class="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div>
              <span class="text-slate-400">Target Role:</span> <strong class="text-white">${profile.user?.target_role || 'Not specified'}</strong>
            </div>
            <button id="regenerate-summary-btn" class="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Regenerate
            </button>
          </div>

          <!-- Loading state -->
          <div id="summary-loading" class="py-8 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs text-cyan-400 font-medium animate-pulse">Generating ATS-optimized professional summaries...</span>
          </div>

          <!-- Results -->
          <div id="summary-results" class="space-y-4 hidden">
            <!-- 1. Short Version -->
            <div id="card-short" class="summary-card p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition cursor-pointer flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Version 1: Short (1-2 sentences)
                </span>
                <span class="text-xs text-cyan-400 font-medium flex items-center gap-1">Use this <i data-lucide="check" class="w-3.5 h-3.5"></i></span>
              </div>
              <p id="text-short" class="text-sm text-slate-100 font-normal leading-relaxed"></p>
            </div>

            <!-- 2. Standard Version -->
            <div id="card-standard" class="summary-card p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition cursor-pointer flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Version 2: Standard (3-4 sentences)
                </span>
                <span class="text-xs text-blue-400 font-medium flex items-center gap-1">Use this <i data-lucide="check" class="w-3.5 h-3.5"></i></span>
              </div>
              <p id="text-standard" class="text-sm text-slate-100 font-normal leading-relaxed"></p>
            </div>

            <!-- 3. ATS Focused Version -->
            <div id="card-ats" class="summary-card p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition cursor-pointer flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Version 3: Strong ATS-Focused
                </span>
                <span class="text-xs text-indigo-400 font-medium flex items-center gap-1">Use this <i data-lucide="check" class="w-3.5 h-3.5"></i></span>
              </div>
              <p id="text-ats" class="text-sm text-slate-100 font-normal leading-relaxed"></p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by Agent 2 (Resume Agent)</span>
          <button id="cancel-summary-btn" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    const closeBtn = modal.querySelector('#close-summary-btn');
    const cancelBtn = modal.querySelector('#cancel-summary-btn');
    const regenBtn = modal.querySelector('#regenerate-summary-btn');
    const loadingEl = modal.querySelector('#summary-loading');
    const resultsEl = modal.querySelector('#summary-results');

    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const generate = async () => {
      loadingEl.classList.remove('hidden');
      resultsEl.classList.add('hidden');

      try {
        const result = await MasterAgentManager.executeTask('resume', 'generate_summary', { profile });

        loadingEl.classList.add('hidden');

        if (result.status === 'success' && result.summaries) {
          resultsEl.classList.remove('hidden');

          const s = result.summaries;
          modal.querySelector('#text-short').textContent = s.short;
          modal.querySelector('#text-standard').textContent = s.standard;
          modal.querySelector('#text-ats').textContent = s.ats_focused;

          const wireCard = (cardId, text) => {
            const card = modal.querySelector(cardId);
            card.onclick = () => {
              if (onSelectCallback) onSelectCallback(text);
              Toast.show("Professional summary updated!", "success");
              closeModal();
            };
          };

          wireCard('#card-short', s.short);
          wireCard('#card-standard', s.standard);
          wireCard('#card-ats', s.ats_focused);

          if (window.lucide) window.lucide.createIcons();
        } else {
          Toast.show(result.message || "Failed to generate summaries", "error");
        }
      } catch (err) {
        loadingEl.classList.add('hidden');
        Toast.show("Error connecting to AI service", "error");
      }
    };

    regenBtn.addEventListener('click', generate);
    generate();
  }
}
