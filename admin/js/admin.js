/**
 * admin.js — Shared Admin Panel Logic & Utilities
 * Ashraf Islamia Model Public Secondary School
 */

(function () {
  'use strict';

  // Create toast container if not exists
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Toast Notification
  window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      <button style="background:none;border:none;color:inherit;cursor:pointer;opacity:0.8;font-size:16px;" onclick="this.parentElement.remove()">&times;</button>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  };

  // Confirmation Modal
  let activeModal = null;
  window.showConfirmModal = function ({ title, message, confirmText = 'Delete', confirmClass = 'btn-danger', onConfirm }) {
    if (activeModal) activeModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="modal-title" id="modal-title">${escapeHtml(title)}</h3>
        <p class="modal-message">${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" id="modal-cancel-btn">Cancel</button>
          <button class="btn ${confirmClass}" id="modal-confirm-btn">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    activeModal = overlay;

    requestAnimationFrame(() => overlay.classList.add('active'));

    const cancelBtn = overlay.querySelector('#modal-cancel-btn');
    const confirmBtn = overlay.querySelector('#modal-confirm-btn');

    const closeModal = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 200);
      activeModal = null;
    };

    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Processing...';
      try {
        if (onConfirm) await onConfirm();
        closeModal();
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = confirmText;
        window.showToast(err.message || 'Operation failed.', 'error');
      }
    });

    // Escape key
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  };

  // Logout action
  window.handleAdminLogout = async function () {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/admin/login.html';
      } else {
        window.showToast('Failed to log out.', 'error');
      }
    } catch (err) {
      window.location.href = '/admin/login.html';
    }
  };

  // Helpers
  window.escapeHtml = function (str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  window.formatBytes = function (bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  window.formatDate = function (dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Check auth session
  window.checkAdminAuth = async function () {
    try {
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/admin/login.html';
        }
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch (err) {
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/admin/login.html';
      }
      return null;
    }
  };
})();
