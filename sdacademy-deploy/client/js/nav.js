/* ============================================================
   SD Academy — Shared Navigation & Micro-Interactions Framework
   ============================================================ */

(function () {
  'use strict';

  /* ── Session helpers ─────────────────────────────────────── */
  function getCurrentUser() {
    const saved = sessionStorage.getItem('sda_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  }

  function logout() {
    showToast('Logging out…', 'info');
    setTimeout(() => {
      sessionStorage.removeItem('sda_user');
      localStorage.removeItem('sda_token');
      const base = getBase();
      window.location.href = base + 'login.html';
    }, 600);
  }

  function getBase() {
    return window.location.pathname.includes('/admin/') ? '../' : '';
  }

  /* ── Toast Framework ─────────────────────────────────────── */
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    // Use text labels instead of emoji for consistent screen-reader output
    const labelMap = { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' };
    toast.innerHTML = `<span class="toast-label">${labelMap[type] || 'Info'}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ── Learner nav items ───────────────────────────────────── */
  const LEARNER_NAV = [
    { icon: 'grid',        label: 'Dashboard',        href: 'dashboard.html' },
    { icon: 'book-open',   label: 'My Learning Path',  href: 'learning-path.html' },
    { icon: 'play',        label: 'Video Player',       href: 'video-player.html' },
    { icon: 'file-text',   label: 'Materials',          href: 'materials.html' },
    { icon: 'clipboard',   label: 'Assessments',        href: 'assessments.html' },
    { icon: 'award',       label: 'Certificates',       href: 'certificates.html' },
    { icon: 'bell',        label: 'Announcements',      href: 'announcements.html' },
    { icon: 'help-circle', label: 'Support',            href: 'support.html' },
  ];

  /* ── Admin nav items ─────────────────────────────────────── */
  const ADMIN_NAV = [
    { icon: 'grid',      label: 'Dashboard',              href: 'dashboard.html' },
    { icon: 'users',     label: 'User Management',        href: 'users.html' },
    { icon: 'layers',    label: 'Course Builder',         href: 'course-builder.html' },
    { icon: 'archive',   label: 'Content Library',        href: 'content.html' },
    { icon: 'bar-chart', label: 'Reports & Escalations',  href: 'reports.html' },
  ];

  /* ── SVG icon set ────────────────────────────────────────── */
  const ICONS = {
    'grid':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'book-open':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    'play':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    'file-text':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    'clipboard':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    'award':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    'bell':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    'help-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'users':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'layers':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'archive':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    'bar-chart':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'log-out':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  };

  function icon(name) {
    return `<span class="nav-icon-svg">${ICONS[name] || ''}</span>`;
  }

  /* ── Build sidebar ───────────────────────────────────────── */
  function buildSidebar(user) {
    const base    = getBase();
    const isAdmin = user.role === 'admin';
    const nav     = isAdmin ? ADMIN_NAV : LEARNER_NAV;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    const items = nav.map(item => {
      const isActive = currentFile === item.href ? 'active' : '';
      const safeId   = item.label.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      return `<a href="${base}${isAdmin ? 'admin/' : ''}${item.href}" class="nav-item ${isActive}" id="nav-${safeId}" aria-current="${isActive ? 'page' : 'false'}">
        ${icon(item.icon)}
        <span>${item.label}</span>
      </a>`;
    }).join('');

    const initials = user.initials || (user.name ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'U');

    return `
      <aside class="sidebar" id="sidebar" role="navigation" aria-label="Main navigation">
        <div class="sidebar-brand">
          <img src="${base}assets/logo.png" alt="SD Academy Logo" class="brand-logo-img" style="width:38px;height:38px;" />
          <div class="brand-info">
            <div class="brand-name">SD Academy</div>
            <div class="brand-sub">${escapeHtml(user.name)} &bull; ${escapeHtml(user.roleLabel || user.role)}</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${items}
        </nav>
        <div class="sidebar-footer">
          <button onclick="SDA.logout()" class="nav-item" aria-label="Log out" style="width:100%;background:transparent;border:none;cursor:pointer;">
            ${icon('log-out')}
            <span>Logout</span>
          </button>
        </div>
      </aside>`;
  }

  /* ── Build topbar ────────────────────────────────────────── */
  function buildTopbar(user, opts) {
    const base     = getBase();
    const showHome = opts && opts.showHome;
    const initials = user.initials || (user.name ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'U');
    return `
      <header class="topbar" id="topbar" role="banner">
        <div class="topbar-search">
          <input type="search" id="global-search" placeholder="Search courses, SOPs, modules…" autocomplete="off" aria-label="Search SD Academy" />
          <span class="search-icon" aria-hidden="true">${ICONS['help-circle'].replace('help-circle','').replace(/<[^>]+>/,'') || ''}</span>
        </div>
        ${showHome ? `<a href="${base}index.html" class="topbar-home-link">&#8592; Home</a>` : ''}
        <div class="topbar-actions">
          <button class="topbar-bell" id="notif-btn" title="Notifications" aria-label="Notifications" onclick="SDA.showToast('You have new announcements. Check the Announcements section.','info')">
            <span aria-hidden="true">${ICONS['bell']}</span>
            <span class="badge" aria-hidden="true"></span>
          </button>
          <div class="topbar-user" id="user-menu-toggle" role="button" tabindex="0" aria-label="User menu — ${escapeHtml(user.name)}" onclick="SDA.showToast('${escapeHtml(user.roleLabel || user.role)} — ${escapeHtml(user.department || '')}','info')">
            <div class="user-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
            <span class="user-name">${escapeHtml(user.name)}</span>
          </div>
        </div>
      </header>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Guard ───────────────────────────────────────────────── */
  function guard(requiredRole) {
    const user = getCurrentUser();
    const base = getBase();
    if (!user) {
      window.location.href = base + 'login.html';
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'admin') {
        window.location.href = base + 'admin/dashboard.html';
      } else {
        window.location.href = base + 'dashboard.html';
      }
      return null;
    }
    return user;
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init(opts) {
    opts = opts || {};
    const user = guard(opts.role);
    if (!user) return;

    const shell = document.getElementById('app-shell');
    if (shell) {
      shell.insertAdjacentHTML('afterbegin', buildSidebar(user));
      const mainContent = shell.querySelector('.main-content');
      if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', buildTopbar(user, opts));
      }
    }
    return user;
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.SDA = {
    init,
    getCurrentUser,
    logout,
    showToast,
  };
})();
