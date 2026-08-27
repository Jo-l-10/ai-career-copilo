// AI Provider Settings & Model Selector Modal

import { AISettings, AI_PROVIDERS, aiClient } from '../aiProviders.js';
import { Toast } from './toast.js';

export class AISettingsModal {
  static open(onSaveCallback = null) {
    const existing = document.getElementById('ai-settings-modal');
    if (existing) existing.remove();

    const current = AISettings.getSettings();

    const modal = document.createElement('div');
    modal.id = 'ai-settings-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';

    modal.innerHTML = `
      <div class="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <i data-lucide="cpu" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">AI Engine & Model Configuration</h3>
              <p class="text-xs text-slate-400">100% Free & Open-Source AI Integration</p>
            </div>
          </div>
          <button id="close-ai-settings-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <!-- Provider Selection -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select Active AI Provider:
            </label>
            <div class="grid grid-cols-2 gap-3">
              <!-- Offline NLP -->
              <label class="provider-radio flex items-start gap-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950/60 cursor-pointer hover:border-indigo-500 transition">
                <input type="radio" name="ai_provider" value="${AI_PROVIDERS.OFFLINE}" ${current.provider === AI_PROVIDERS.OFFLINE ? 'checked' : ''} class="mt-1 text-indigo-500 focus:ring-0">
                <div>
                  <div class="text-sm font-semibold text-white flex items-center gap-1.5">
                    Offline NLP Engine
                    <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">100% FREE</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">Zero config, offline, instant latency, no API keys needed.</div>
                </div>
              </label>

              <!-- Local Ollama -->
              <label class="provider-radio flex items-start gap-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950/60 cursor-pointer hover:border-indigo-500 transition">
                <input type="radio" name="ai_provider" value="${AI_PROVIDERS.OLLAMA}" ${current.provider === AI_PROVIDERS.OLLAMA ? 'checked' : ''} class="mt-1 text-indigo-500 focus:ring-0">
                <div>
                  <div class="text-sm font-semibold text-white flex items-center gap-1.5">
                    Local Ollama
                    <span class="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">LOCAL AI</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">Llama 3.2, Mistral, Qwen running on your machine.</div>
                </div>
              </label>

              <!-- Groq Free Cloud -->
              <label class="provider-radio flex items-start gap-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950/60 cursor-pointer hover:border-indigo-500 transition">
                <input type="radio" name="ai_provider" value="${AI_PROVIDERS.GROQ}" ${current.provider === AI_PROVIDERS.GROQ ? 'checked' : ''} class="mt-1 text-indigo-500 focus:ring-0">
                <div>
                  <div class="text-sm font-semibold text-white flex items-center gap-1.5">
                    Groq Cloud Free
                    <span class="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">ULTRA FAST</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">Llama 3.3 70B (Free tier: 14.4k req/day).</div>
                </div>
              </label>

              <!-- OpenRouter Free -->
              <label class="provider-radio flex items-start gap-3 p-3.5 rounded-xl border border-slate-700 bg-slate-950/60 cursor-pointer hover:border-indigo-500 transition">
                <input type="radio" name="ai_provider" value="${AI_PROVIDERS.OPENROUTER}" ${current.provider === AI_PROVIDERS.OPENROUTER ? 'checked' : ''} class="mt-1 text-indigo-500 focus:ring-0">
                <div>
                  <div class="text-sm font-semibold text-white flex items-center gap-1.5">
                    OpenRouter Free
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">Access free open-source models with free key.</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Dynamic Config Sections -->
          <div id="config-ollama" class="config-pane space-y-3 ${current.provider === AI_PROVIDERS.OLLAMA ? '' : 'hidden'}">
            <h4 class="text-xs font-semibold uppercase text-slate-400">Ollama Configuration:</h4>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-400 mb-1">Ollama Base URL</label>
                <input type="text" id="cfg-ollama-url" value="${current.ollamaUrl}" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200">
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-1">Model Name</label>
                <input type="text" id="cfg-ollama-model" value="${current.ollamaModel}" placeholder="e.g. llama3.2, mistral" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200">
              </div>
            </div>
            <p class="text-[11px] text-slate-500">Tip: Run <code>ollama run llama3.2</code> in your terminal. Ollama must have CORS enabled or be accessible on localhost:11434.</p>
          </div>

          <div id="config-groq" class="config-pane space-y-3 ${current.provider === AI_PROVIDERS.GROQ ? '' : 'hidden'}">
            <h4 class="text-xs font-semibold uppercase text-slate-400">Groq Free Cloud Config:</h4>
            <div>
              <label class="block text-xs text-slate-400 mb-1">Groq API Key (Free)</label>
              <input type="password" id="cfg-groq-key" value="${current.groqApiKey}" placeholder="gsk_..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200">
            </div>
            <p class="text-[11px] text-slate-500">Free tier limit: 30 RPM, 14,400 requests/day, 100% free with zero credit card at console.groq.com.</p>
          </div>

          <div id="config-openrouter" class="config-pane space-y-3 ${current.provider === AI_PROVIDERS.OPENROUTER ? '' : 'hidden'}">
            <h4 class="text-xs font-semibold uppercase text-slate-400">OpenRouter Free Config:</h4>
            <div>
              <label class="block text-xs text-slate-400 mb-1">OpenRouter Free API Key</label>
              <input type="password" id="cfg-openrouter-key" value="${current.openRouterApiKey}" placeholder="sk-or-..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200">
            </div>
          </div>

          <!-- Connection Test Feedback -->
          <div class="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div id="conn-test-msg" class="text-xs text-slate-300 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Select provider and click Test Connection</span>
            </div>
            <button id="test-conn-btn" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition">
              <i data-lucide="activity" class="w-3.5 h-3.5"></i>
              Test Connection
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-500">No paid API subscriptions required</span>
          <div class="flex items-center gap-2">
            <button id="cancel-ai-btn" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition">Cancel</button>
            <button id="save-ai-btn" class="btn-primary px-5 py-2 text-xs font-medium">Save Settings</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    // Elements
    const closeBtn = modal.querySelector('#close-ai-settings-btn');
    const cancelBtn = modal.querySelector('#cancel-ai-btn');
    const saveBtn = modal.querySelector('#save-ai-btn');
    const testBtn = modal.querySelector('#test-conn-btn');
    const testMsg = modal.querySelector('#conn-test-msg');
    const radios = modal.querySelectorAll('input[name="ai_provider"]');

    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Toggle panes on radio change
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const val = radio.value;
        modal.querySelector('#config-ollama').classList.toggle('hidden', val !== AI_PROVIDERS.OLLAMA);
        modal.querySelector('#config-groq').classList.toggle('hidden', val !== AI_PROVIDERS.GROQ);
        modal.querySelector('#config-openrouter').classList.toggle('hidden', val !== AI_PROVIDERS.OPENROUTER);
      });
    });

    // Test connection
    testBtn.addEventListener('click', async () => {
      const selected = modal.querySelector('input[name="ai_provider"]:checked').value;
      testMsg.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Testing connection...`;

      const customConfig = {
        ollamaUrl: modal.querySelector('#cfg-ollama-url')?.value,
        ollamaModel: modal.querySelector('#cfg-ollama-model')?.value,
        groqApiKey: modal.querySelector('#cfg-groq-key')?.value,
        openRouterApiKey: modal.querySelector('#cfg-openrouter-key')?.value
      };

      const result = await aiClient.testConnection(selected, customConfig);

      if (result.success) {
        testMsg.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> <span class="text-emerald-300 font-medium">${result.message} (${result.latencyMs}ms)</span>`;
      } else {
        testMsg.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> <span class="text-rose-300">${result.message}</span>`;
      }
    });

    // Save
    saveBtn.addEventListener('click', () => {
      const selected = modal.querySelector('input[name="ai_provider"]:checked').value;
      const newSettings = {
        provider: selected,
        ollamaUrl: modal.querySelector('#cfg-ollama-url')?.value || 'http://localhost:11434',
        ollamaModel: modal.querySelector('#cfg-ollama-model')?.value || 'llama3.2',
        groqApiKey: modal.querySelector('#cfg-groq-key')?.value || '',
        groqModel: 'llama-3.3-70b-versatile',
        openRouterApiKey: modal.querySelector('#cfg-openrouter-key')?.value || '',
        openRouterModel: 'meta-llama/llama-3.2-3b-instruct:free'
      };

      AISettings.saveSettings(newSettings);
      Toast.show("AI provider configuration saved!", "success");
      if (onSaveCallback) onSaveCallback(newSettings);
      closeModal();
    });
  }
}
