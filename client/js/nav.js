/* ============================================================
   SD Academy — Shared Navigation & Micro-Interactions Framework
   ============================================================ */

(function () {
  'use strict';

  /* ── Mock session store ──────────────────────────────────── */
  const USERS = {
    learner: {
      id: 'u1',
      name: 'John Abraham',
      role: 'learner',
      department: 'Design & Planning Department',
      roleLabel: 'Architect',
      initials: 'JA',
    },
    admin: {
      id: 'a1',
      name: 'Admin',
      role: 'admin',
      department: 'HR / L&D',
      roleLabel: 'Administrator',
      initials: 'AD',
    },
  };

  function getCurrentUser() {
    const saved = sessionStorage.getItem('sda_user');
    if (saved) return JSON.parse(saved);
    return null;
  }

  function logout() {
    showToast('Logging out...', 'info');
    setTimeout(() => {
      sessionStorage.removeItem('sda_user');
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
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = { success: '✅', error: '❌', info: '🔔', warning: '⚠️' };
    toast.innerHTML = `<span>${iconMap[type] || '🔔'}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ── Learner nav items ───────────────────────────────────── */
  const LEARNER_NAV = [
    { icon: '⊞', label: 'Dashboard',       href: 'dashboard.html' },
    { icon: '📘', label: 'My Learning Path',href: 'learning-path.html' },
    { icon: '▶',  label: 'Video Player',    href: 'video-player.html' },
    { icon: '📄', label: 'Materials',       href: 'materials.html' },
    { icon: '📝', label: 'Assessments',     href: 'assessments.html' },
    { icon: '🏅', label: 'Certificates',    href: 'certificates.html' },
    { icon: '📢', label: 'Announcements',   href: 'announcements.html' },
    { icon: '🔧', label: 'Support',         href: 'support.html' },
  ];

  /* ── Admin nav items ─────────────────────────────────────── */
  const ADMIN_NAV = [
    { icon: '⊞', label: 'Dashboard',          href: 'dashboard.html' },
    { icon: '👥', label: 'User Management',    href: 'users.html' },
    { icon: '🏗️', label: 'Course Builder',     href: 'course-builder.html' },
    { icon: '📚', label: 'Content Library',    href: 'content.html' },
    { icon: '📊', label: 'Reports & Escalations', href: 'reports.html' },
  ];

  /* ── Build sidebar ───────────────────────────────────────── */
  function buildSidebar(user) {
    const base  = getBase();
    const isAdmin = user.role === 'admin';
    const nav   = isAdmin ? ADMIN_NAV : LEARNER_NAV;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    const items = nav.map(item => {
      const isActive = currentFile === item.href ? 'active' : '';
      return `<a href="${base}${isAdmin ? 'admin/' : ''}${item.href}" class="nav-item ${isActive}" id="nav-${item.label.replace(/\s+/g,'-').toLowerCase()}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>`;
    }).join('');

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand" style="display:flex;align-items:center;gap:12px;padding:18px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <img src="${base}assets/logo.png" alt="SD Academy Logo" class="brand-logo-img" style="width:38px;height:38px;background:#fff;padding:2px;border-radius:50%;object-fit:contain;box-shadow:0 2px 8px rgba(0,0,0,0.2);" />
          <div class="brand-info">
            <div class="brand-name" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;color:#ffffff;letter-spacing:0.3px;">SD Academy</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">${user.name} • ${user.roleLabel}</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${items}
        </nav>
        <div style="padding:16px;border-top:1px solid rgba(255,255,255,.08);">
          <button onclick="SDA.logout()" class="nav-item" style="width:100%;background:transparent;border:none;cursor:pointer;">
            <span class="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>`;
  }

  /* ── Build topbar ────────────────────────────────────────── */
  function buildTopbar(user, opts) {
    const base = getBase();
    const showHome = opts && opts.showHome;
    return `
      <header class="topbar" id="topbar">
        <div class="topbar-search">
          <input type="text" id="global-search" placeholder="Search videos, SOPs, modules..." autocomplete="off" />
          <span class="search-icon">🔍</span>
        </div>
        ${showHome ? `<a href="${base}index.html" class="topbar-home-link">← Home</a>` : ''}
        <div class="topbar-actions">
          <button class="topbar-bell" id="notif-btn" title="Notifications" onclick="SDA.showToast('You have 2 new announcements!','info')">
            🔔
            <span class="badge"></span>
          </button>
          <div class="topbar-user" id="user-menu-toggle" onclick="SDA.showToast('User Role: ${user.roleLabel} (${user.department})','info')">
            <div class="user-avatar">${user.initials}</div>
            <span class="user-name">${user.name}</span>
          </div>
        </div>
      </header>`;
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
    USERS,
    showToast,
    setUser(key) {
      sessionStorage.setItem('sda_user', JSON.stringify(USERS[key]));
    },
  };
})();
