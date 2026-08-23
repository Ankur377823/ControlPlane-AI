/**
 * ControlPlane AI — Floating Toast Notification System
 * Replaces native browser alert() popups with sleek non-blocking toasts.
 */

export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px; pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgMap = {
    success: 'rgba(16, 185, 129, 0.95)',
    error: 'rgba(239, 68, 68, 0.95)',
    info: 'rgba(139, 92, 246, 0.95)',
    cyan: 'rgba(6, 182, 212, 0.95)',
  };

  toast.style.cssText = `
    background: ${bgMap[type] || bgMap.info};
    color: #ffffff; padding: 12px 18px; border-radius: 12px;
    font-size: 0.88rem; font-weight: 600; font-family: system-ui, sans-serif;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: auto;
    display: flex; align-items: center; gap: 10px;
    animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2);
  `;

  const iconMap = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
    cyan: '⚡',
  };

  toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
