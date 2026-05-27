/**
 * app/static/js/app.js
 * ─────────────────────────────────────────────────────────────
 * Global Alpine.js data and small utility functions.
 *
 * WHY Alpine for this instead of vanilla JS?
 *   Alpine keeps reactive state (like toast messages) co-located
 *   with the HTML that uses it. No querySelector() chains needed.
 *
 * WHY a global shopApp() function?
 *   base.html sets x-data="shopApp()" on <html> so all child
 *   elements can access shared app-level state via $store or
 *   inherited data. Alpine components nested inside can still
 *   declare their own x-data without conflict.
 */

/** Main Alpine data object — mounted on <html> in base.html */
function shopApp() {
  return {
    // ── App-level state ───────────────────────────────────────
    sidebarOpen: false,

    // ── Utility: format currency for display ─────────────────
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(amount);
    },

    // ── Utility: format a date string as "12 Jan 2025" ───────
    formatDate(dateStr) {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    },
  };
}


/**
 * HTMX configuration
 * ─────────────────────────────────────────────────────────────
 * Configure HTMX globally before any requests fire.
 */
document.addEventListener('DOMContentLoaded', () => {

  // Tell HTMX to include the CSRF header if we add one later.
  // For now, SameSite=Lax on cookies handles CSRF for same-origin.
  document.body.addEventListener('htmx:configRequest', (evt) => {
    // Placeholder: add csrf token header here in Phase 7 if needed
    // evt.detail.headers['X-CSRFToken'] = getCsrfToken();
  });

  // After every HTMX swap, re-initialize Alpine on new elements.
  // Alpine v3 handles this automatically via MutationObserver,
  // but this log helps with debugging in development.
  document.body.addEventListener('htmx:afterSettle', (evt) => {
    if (window.__DEV__) {
      console.debug('[htmx] settled', evt.detail.target?.id);
    }
  });

  // Show a console warning on HTMX errors (development only)
  document.body.addEventListener('htmx:responseError', (evt) => {
    console.warn('[htmx] server error', evt.detail.xhr.status, evt.detail.xhr.responseURL);
  });

  // Mark as dev mode for debug logging
  window.__DEV__ = document.documentElement.dataset.env === 'development';
});


/**
 * Utility: trigger a toast notification from JavaScript.
 * Usage: showToast('Saved!', 'success')
 * In Phase 2+, toasts are usually triggered by HTMX server responses.
 * This function is for client-side-only cases (e.g. clipboard copy).
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const div = document.createElement('div');
  div.innerHTML = `
    <div x-data="{ show: true }"
         x-show="show"
         x-init="setTimeout(() => show = false, 3000)"
         class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
                shadow-xl text-sm
                ${type === 'error'
                  ? 'bg-rose-900/90 border border-rose-700 text-rose-100'
                  : 'bg-emerald-900/90 border border-emerald-700 text-emerald-100'}">
      <span>${message}</span>
    </div>`;

  container.appendChild(div.firstElementChild);

  // Initialize Alpine on the new element
  if (window.Alpine) {
    Alpine.initTree(container.lastElementChild);
  }
}
