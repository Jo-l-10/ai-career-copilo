// Main Application Coordinator & Routing

import { db } from './db.js';
import { AISettingsModal } from './components/aiSettingsModal.js';
import { AISettings, AI_PROVIDERS } from './aiProviders.js';
import { renderLandingView } from './views/landing.js';
import { renderDashboardView } from './views/dashboard.js';
import { renderProfileView } from './views/profile.js';
import { renderResumeBuilderView } from './views/resumeBuilder.js';
import { renderTemplateStudioView } from './views/templateStudio.js';
import { renderJobMatchView } from './views/jobMatch.js';

class App {
  constructor() {
    this.currentView = 'landing';
    this.container = document.getElementById('app-view-container');
    this.aiBadge = document.getElementById('nav-ai-status-badge');
  }

  async init() {
    console.log('Initializing AI Career Copilot Application...');
    
    // 1. Initialize local DB with sample seed profile
    await db.initSeedData(false);

    // 2. Update AI badge status
    this.updateAIBadge();

    // 3. Wire navigation items
    this.bindNavigation();

    // 4. Load initial view
    const initialRoute = window.location.hash.replace('#', '') || 'landing';
    this.navigateTo(initialRoute);

    // 5. Wire AI Settings button in navbar
    document.getElementById('nav-ai-settings-btn').addEventListener('click', () => {
      AISettingsModal.open(() => this.updateAIBadge());
    });
  }

  updateAIBadge() {
    const s = AISettings.getSettings();
    const badgeText = document.getElementById('ai-status-text');
    const badgeDot = document.getElementById('ai-status-dot');

    if (s.provider === AI_PROVIDERS.OFFLINE) {
      badgeText.textContent = "Offline NLP (Free)";
      badgeDot.className = "w-2 h-2 rounded-full bg-emerald-400";
    } else if (s.provider === AI_PROVIDERS.OLLAMA) {
      badgeText.textContent = `Ollama (${s.ollamaModel})`;
      badgeDot.className = "w-2 h-2 rounded-full bg-blue-400";
    } else if (s.provider === AI_PROVIDERS.GROQ) {
      badgeText.textContent = "Groq Cloud (Free)";
      badgeDot.className = "w-2 h-2 rounded-full bg-purple-400";
    } else if (s.provider === AI_PROVIDERS.OPENROUTER) {
      badgeText.textContent = "OpenRouter (Free)";
      badgeDot.className = "w-2 h-2 rounded-full bg-cyan-400";
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        this.navigateTo(route);
      });
    });

    window.addEventListener('popstate', () => {
      const route = window.location.hash.replace('#', '') || 'landing';
      this.navigateTo(route, false);
    });
  }

  async navigateTo(viewName, pushState = true) {
    this.currentView = viewName;
    if (pushState) {
      window.location.hash = viewName;
    }

    // Highlight active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.route === viewName) {
        link.classList.add('text-indigo-400', 'bg-indigo-500/10');
        link.classList.remove('text-slate-400');
      } else {
        link.classList.remove('text-indigo-400', 'bg-indigo-500/10');
        link.classList.add('text-slate-400');
      }
    });

    this.container.innerHTML = `<div class="py-20 flex justify-center"><div class="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>`;

    const navCallback = (route) => this.navigateTo(route);

    switch (viewName) {
      case 'landing':
        renderLandingView(this.container, navCallback);
        break;
      case 'dashboard':
        await renderDashboardView(this.container, navCallback);
        break;
      case 'profile':
        await renderProfileView(this.container, navCallback);
        break;
      case 'resume-builder':
        await renderResumeBuilderView(this.container, navCallback);
        break;
      case 'template-studio':
        await renderTemplateStudioView(this.container, navCallback);
        break;
      case 'job-match':
        await renderJobMatchView(this.container, navCallback);
        break;
      default:
        renderLandingView(this.container, navCallback);
        break;
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
