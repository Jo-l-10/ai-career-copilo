// AI Bullet Enhancer Modal with X-Y-Z Principle & 3 Alternatives

import { MasterAgentManager } from '../agentManager.js';
import { Toast } from './toast.js';

export class BulletEnhancerModal {
  static open(initialText = "", onSelectCallback = null) {
    // Remove existing modal if any
    const existing = document.getElementById('bullet-enhancer-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'bullet-enhancer-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in';

    modal.innerHTML = `
      <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <i data-lucide="sparkles" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                AI Resume Bullet Point Enhancer
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">X-Y-Z Formula</span>
              </h3>
              <p class="text-xs text-slate-400">Accomplished [X], as measured by [Y], by doing [Z]</p>
            </div>
          </div>
          <button id="close-enhancer-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto space-y-5">
          <!-- Input area -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Raw Experience Bullet Point:
            </label>
            <div class="relative">
              <textarea id="raw-bullet-input" rows="3" class="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="e.g. Worked on sales reports using Excel and SQL...">${initialText || ""}</textarea>
            </div>
            <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>💡 <strong class="text-slate-300">Guardrail Rule:</strong> Preserves your genuine achievements without fabricating fake stats or fake tools.</span>
              <button id="trigger-enhance-btn" class="btn-primary flex items-center gap-2 px-4 py-2 text-xs">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                Enhance with AI
              </button>
            </div>
          </div>

          <!-- Loading state -->
          <div id="enhancer-loading" class="hidden py-8 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs text-indigo-400 font-medium animate-pulse">Crafting professional X-Y-Z alternatives...</span>
          </div>

          <!-- Results Container -->
          <div id="enhancer-results" class="space-y-3 hidden">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
              Select an Enhanced Version:
            </h4>
            <div id="alternatives-list" class="space-y-3"></div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by Agent 2 (Resume Agent) • Free & Open-Source</span>
          <button id="cancel-enhancer-btn" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    const closeBtn = modal.querySelector('#close-enhancer-btn');
    const cancelBtn = modal.querySelector('#cancel-enhancer-btn');
    const triggerBtn = modal.querySelector('#trigger-enhance-btn');
    const rawInput = modal.querySelector('#raw-bullet-input');
    const loadingEl = modal.querySelector('#enhancer-loading');
    const resultsEl = modal.querySelector('#enhancer-results');
    const listEl = modal.querySelector('#alternatives-list');

    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const runEnhance = async () => {
      const text = rawInput.value.trim();
      if (!text) {
        Toast.show("Please enter a bullet point to enhance.", "warning");
        return;
      }

      loadingEl.classList.remove('hidden');
      resultsEl.classList.add('hidden');
      triggerBtn.disabled = true;

      try {
        const result = await MasterAgentManager.executeTask('resume', 'enhance_bullet', {
          bullet: text,
          context: {}
        });

        loadingEl.classList.add('hidden');
        triggerBtn.disabled = false;

        if (result.status === 'success' && result.alternatives && result.alternatives.length > 0) {
          resultsEl.classList.remove('hidden');
          listEl.innerHTML = '';

          result.alternatives.forEach((alt, idx) => {
            const card = document.createElement('div');
            card.className = 'group p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition cursor-pointer flex flex-col gap-2';
            card.innerHTML = `
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Option ${idx + 1}: ${alt.type}
                </span>
                <span class="text-xs text-indigo-400 group-hover:text-indigo-300 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Use this bullet <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </span>
              </div>
              <p class="text-sm text-slate-100 font-medium leading-relaxed">${alt.text}</p>
              ${alt.rationale ? `<p class="text-xs text-slate-400 italic">Why: ${alt.rationale}</p>` : ''}
            `;

            card.addEventListener('click', () => {
              if (onSelectCallback) onSelectCallback(alt.text);
              Toast.show("Bullet point updated with X-Y-Z enhancement!", "success");
              closeModal();
            });

            listEl.appendChild(card);
          });

          if (window.lucide) window.lucide.createIcons();
        } else {
          Toast.show(result.message || "Failed to generate bullet variations.", "error");
        }
      } catch (err) {
        loadingEl.classList.add('hidden');
        triggerBtn.disabled = false;
        Toast.show("Error connecting to AI service.", "error");
      }
    };

    triggerBtn.addEventListener('click', runEnhance);

    // Auto-run if initialText provided
    if (initialText && initialText.length > 5) {
      runEnhance();
    }
  }
}
