/* ============================================================
   SD Academy — API Client Module
   Communicates with Node.js Express + SQLite API (Port 5000)
   ============================================================ */

(function () {
  'use strict';

  const API_BASE = 'http://localhost:5000/api';

  function getToken() {
    return localStorage.getItem('sda_jwt') || '';
  }

  function setToken(token) {
    localStorage.setItem('sda_jwt', token);
  }

  function removeToken() {
    localStorage.removeItem('sda_jwt');
  }

  async function apiFetch(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        removeToken();
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'API Request failed');
      }
      return data;
    } catch (err) {
      console.warn(`[API] ${endpoint} -> ${err.message}`);
      throw err;
    }
  }

  window.SDA_API = {
    getToken,
    setToken,
    removeToken,

    // Auth
    async login(email, password) {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setToken(res.token);
      return res;
    },

    async getMe() {
      return await apiFetch('/auth/me');
    },

    // Users
    async getUsers() {
      return await apiFetch('/users');
    },

    async createUser(userData) {
      return await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    async updateUser(id, userData) {
      return await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    async deleteUser(id) {
      return await apiFetch(`/users/${id}`, {
        method: 'DELETE',
      });
    },

    // Courses & Progress
    async getCourses(track) {
      return await apiFetch(`/courses${track ? '?track=' + track : ''}`);
    },

    async createCourse(courseData) {
      return await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
    },

    async updateCourse(id, courseData) {
      return await apiFetch(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
    },

    async deleteCourse(id) {
      return await apiFetch(`/courses/${id}`, {
        method: 'DELETE',
      });
    },

    async getMyProgress() {
      return await apiFetch('/progress/me');
    },

    // Materials
    async getMaterials(type) {
      return await apiFetch(`/materials${type ? '?type=' + type : ''}`);
    },

    async createMaterial(materialData) {
      return await apiFetch('/materials', {
        method: 'POST',
        body: JSON.stringify(materialData),
      });
    },

    async updateMaterial(id, materialData) {
      return await apiFetch(`/materials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(materialData),
      });
    },

    async deleteMaterial(id) {
      return await apiFetch(`/materials/${id}`, {
        method: 'DELETE',
      });
    },

    async acknowledgeMaterial(id) {
      return await apiFetch(`/materials/${id}/acknowledge`, { method: 'POST' });
    },

    // Assessments
    async getAssessments() {
      return await apiFetch('/assessments');
    },

    async submitAssessment(id, answers, score) {
      return await apiFetch(`/assessments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, score }),
      });
    },

    // Certificates
    async getCertificates() {
      return await apiFetch('/certificates/me');
    },

    // Announcements
    async getAnnouncements(category) {
      return await apiFetch(`/announcements${category ? '?category=' + category : ''}`);
    },

    // Tickets
    async getTickets() {
      return await apiFetch('/tickets/me');
    },

    async createTicket(subject, department, description) {
      return await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, department, description }),
      });
    },

    // Notes
    async getNotes() {
      return await apiFetch('/notes/me');
    },

    async createNote(timestamp_sec, text, is_bookmarked) {
      return await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify({ timestamp_sec, text, is_bookmarked }),
      });
    },
  };
})();
