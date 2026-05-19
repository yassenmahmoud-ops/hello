// Small UI helpers: toast and confirm modal
export function showToast(message, { timeout = 2200 } = {}) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  container.appendChild(t);
  // force reflow then show
  requestAnimationFrame(() => t.classList.add('show'));
  const id = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 180);
  }, timeout);
  return () => { clearTimeout(id); t.remove(); };
}

export function showConfirm({ title = 'تأكيد', message = 'هل أنت متأكد؟', confirmText = 'نعم', cancelText = 'إلغاء' } = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="text-lg font-semibold mb-2">${title}</div>
      <div class="text-sm text-slate-600 mb-4">${message}</div>
      <div class="flex justify-end gap-2">
        <button class="btn-cancel px-3 py-2 rounded-md">${cancelText}</button>
        <button class="btn-confirm px-3 py-2 bg-rose-500 text-white rounded-md">${confirmText}</button>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    const cleanup = () => backdrop.remove();
    modal.querySelector('.btn-cancel').addEventListener('click', () => { cleanup(); resolve(false); });
    modal.querySelector('.btn-confirm').addEventListener('click', () => { cleanup(); resolve(true); });
  });
}

export function pulseElement(el) {
  if (!el) return;
  el.classList.add('cart-pulse');
  setTimeout(() => el.classList.remove('cart-pulse'), 420);
}

function setupPageActionButton() {
  const action = document.body.dataset.pageAction;
  const button = document.getElementById('pageActionBtn');
  if (!action || !button) return;

  const isHome = action === 'scroll-top';
  button.classList.add('motion-btn');

  if (isHome) {
    button.innerHTML = '<span class="page-action-icon">↑</span><span>أعلى</span>';
    // start hidden at the top; show after a small threshold to avoid flicker
    // use inline style to force visibility (more robust than toggling classes)
    const SHOW_THRESHOLD = 10; // px
    const showButton = () => { button.style.display = 'inline-flex'; button.setAttribute('aria-hidden','false'); };
    const hideButton = () => { button.style.display = 'none'; button.setAttribute('aria-hidden','true'); };
    const updateVisibility = () => {
      if (window.scrollY > SHOW_THRESHOLD) showButton();
      else hideButton();
    };

    // initialize hidden state
    hideButton();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return;
  }

  button.innerHTML = '<span class="page-action-icon">←</span><span>المتجر</span>';
  // ensure the 'store' button is always visible on non-home pages
  button.style.display = 'inline-flex';
  button.setAttribute('aria-hidden', 'false');
  button.classList.remove('hidden');
  button.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPageActionButton, { once: true });
} else {
  setupPageActionButton();
}
