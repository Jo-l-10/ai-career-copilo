// Landing Page View

export function renderLandingView(container, navigateTo) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16 animate-fade-in">
      <!-- Hero Section -->
      <section class="text-center space-y-6 pt-8 pb-4">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
          <i data-lucide="sparkles" class="w-4 h-4 text-indigo-400"></i>
          <span>100% Free & Open-Source AI Career Platform</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          AI Career Copilot
        </h1>

        <p class="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
          Build a stronger resume. Match it to the right jobs. Prepare for interviews.
        </p>

        <p class="max-w-xl mx-auto text-sm text-slate-400">
          Designed specifically for students, fresh graduates, and job seekers. Zero paid subscriptions, 100% privacy, local AI support, and ATS-optimized document generation.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button id="cta-build-resume" class="btn-primary flex items-center gap-2 px-6 py-3.5 text-base font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50">
            <i data-lucide="file-plus" class="w-5 h-5"></i>
            Build My Resume
          </button>
          <button id="cta-analyze-job" class="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition flex items-center gap-2">
            <i data-lucide="crosshair" class="w-5 h-5"></i>
            Analyze Job Match
          </button>
          <button id="cta-demo-profile" class="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium border border-slate-800 transition flex items-center gap-2 text-sm">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
            Try Demo Profile
          </button>
        </div>
      </section>

      <!-- 4 Core Feature Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Feature 1 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i data-lucide="user-check" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-white mb-2">1. Career Profile</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Centralized repository for education, work experience, categorized skills, and portfolio projects with zero cloud locks.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i data-lucide="sparkles" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-white mb-2">2. X-Y-Z AI Enhancer</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Transform ordinary bullets into quantifiable "Accomplished [X], as measured by [Y], by doing [Z]" bullet points without hallucinated facts.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i data-lucide="target" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-white mb-2">3. 0–100% ATS Match</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Compare your resume against any Job Description to calculate sub-scores, keyword gaps, and tailored portfolio project ideas.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition hover:-translate-y-1 group">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i data-lucide="file-down" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-white mb-2">4. Free ATS PDF Export</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Export compliant single-column ATS resumes with standard fonts, clear headings, and zero hidden formatting tags.
          </p>
        </div>
      </section>

      <!-- Workflow Timeline -->
      <section class="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-white">The Core AI Copilot Workflow</h2>
          <p class="text-xs text-slate-400">Streamlined path from raw experience to interview readiness</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
            <span class="font-semibold text-slate-200">Profile</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
            <span class="font-semibold text-slate-200">Resume</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
            <span class="font-semibold text-slate-200">AI Polish</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
            <span class="font-semibold text-slate-200">ATS Resume</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">5</span>
            <span class="font-semibold text-slate-200">Paste JD</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">6</span>
            <span class="font-semibold text-slate-200">AI Analysis</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">7</span>
            <span class="font-semibold text-slate-200">Match Score</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-1.5">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">8</span>
            <span class="font-semibold text-slate-200">Skill Gaps</span>
          </div>
        </div>
      </section>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Button handlers
  container.querySelector('#cta-build-resume').addEventListener('click', () => navigateTo('resume-builder'));
  container.querySelector('#cta-analyze-job').addEventListener('click', () => navigateTo('job-match'));
  container.querySelector('#cta-demo-profile').addEventListener('click', () => navigateTo('dashboard'));
}
