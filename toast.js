// Toast Notification Utility

export class Toast {
  static show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all transform translate-y-2 opacity-0 animate-fade-in ${
      type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-900/30' :
      type === 'error' ? 'bg-rose-600 text-white shadow-rose-900/30' :
      type === 'warning' ? 'bg-amber-600 text-white shadow-amber-900/30' :
      'bg-slate-800 text-white border border-slate-700 shadow-slate-950/40'
    }`;

    const iconMap = {
      success: `<i data-lucide="check-circle" class="w-5 h-5 flex-shrink-0"></i>`,
      error: `<i data-lucide="alert-circle" class="w-5 h-5 flex-shrink-0"></i>`,
      warning: `<i data-lucide="alert-triangle" class="w-5 h-5 flex-shrink-0"></i>`,
      info: `<i data-lucide="info" class="w-5 h-5 flex-shrink-0"></i>`
    };

    toast.innerHTML = `
      ${iconMap[type] || iconMap.info}
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Trigger transition
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}
