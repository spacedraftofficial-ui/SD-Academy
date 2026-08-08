/* ============================================================
   SD Academy — Universal API Client Module
   Supports: 
     1. Supabase Cloud Database & Auth (Instant 24/7 Serverless)
     2. Native REST API Engine (PHP / Node.js)
   ============================================================ */

(function () {
  'use strict';

  const API_BASE = window.location.protocol === 'file:'
    ? 'http://localhost:3001/api'
    : `${window.location.origin}/api`;

  function getToken() {
    return localStorage.getItem('sda_jwt') || '';
  }

  function setToken(token) {
    localStorage.setItem('sda_jwt', token);
  }

  function removeToken() {
    localStorage.removeItem('sda_jwt');
  }

  // Check if Supabase Cloud is configured
  function isSupabaseConfigured() {
    return !!(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey);
  }

  let _supabase = null;
  function getSupabase() {
    if (_supabase) return _supabase;
    if (isSupabaseConfigured() && window.supabase) {
      _supabase = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
      return _supabase;
    }
    return null;
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
        throw new Error(data.error || data.message || 'API Request failed');
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

    // ── Auth ──
    async login(email, password) {
      const sb = getSupabase();
      if (sb) {
        // Query users table directly in Supabase
        const { data, error } = await sb.from('users').select('*').eq('email', email).single();
        if (error || !data) {
          throw new Error('Invalid email or password');
        }
        // Save session
        const payload = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          roleLabel: data.role_label,
          initials: data.initials,
        };
        const token = 'sb_token_' + btoa(JSON.stringify(payload));
        setToken(token);
        return { message: 'Login successful', token, user: payload };
      }

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setToken(res.token);
      return res;
    },

    async getMe() {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        if (u.id) {
          const { data } = await sb.from('users').select('*').eq('id', u.id).single();
          return data;
        }
      }
      return await apiFetch('/auth/me');
    },

    // ── Users ──
    async getUsers() {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('users').select('id, employee_id, name, email, company, division, department, job_title, role, role_label, level, level_code, level_name, status, manager, joining_date, initials, created_at, updated_at').order('id', { ascending: true });
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/users');
    },

    async createUser(userData) {
      const sb = getSupabase();
      if (sb) {
        const initials = (userData.name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'SD';
        const levelCode = userData.level_code || userData.level || 'L1';
        const levelMap = { 'L1': 'Foundation', 'L2': 'Practitioner', 'L3': 'Senior / Coordinator', 'L4': 'Manager / HOD', 'L5': 'Leadership' };
        const levelName = userData.level_name || levelMap[levelCode] || 'Foundation';

        const fullInsert = {
          name: userData.name,
          email: userData.email,
          password_hash: '$2a$10$wSimiMDuL0xALlKzcdN06Ohy9BKBffOZd3tkgxIkaWw75nTGsPwOm',
          company: userData.company || 'Common SD Group',
          division: userData.division || 'Group Common',
          department: userData.department || 'General',
          job_title: userData.job_title || userData.role_label || 'Specialist',
          role_label: userData.job_title || userData.role_label || 'Specialist',
          role: userData.role || 'learner',
          level: levelCode,
          level_code: levelCode,
          level_name: levelName,
          status: userData.status || 'Active',
          manager: userData.manager || '',
          joining_date: userData.joining_date || new Date().toISOString().split('T')[0],
          employee_id: userData.employee_id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          initials,
        };

        try {
          const { data, error } = await sb.from('users').insert([fullInsert]).select().single();
          if (error) throw error;
          return data;
        } catch (err) {
          // If Supabase table doesn't have the new columns yet, fall back to standard core columns
          if (err.message && err.message.includes('schema cache')) {
            const fallbackInsert = {
              name: userData.name,
              email: userData.email,
              password_hash: '$2a$10$wSimiMDuL0xALlKzcdN06Ohy9BKBffOZd3tkgxIkaWw75nTGsPwOm',
              role: userData.role || 'learner',
              department: userData.department || 'Architecture',
              role_label: userData.job_title || userData.role_label || 'Architect',
              level: levelCode,
              initials,
            };
            const { data, error: fbError } = await sb.from('users').insert([fallbackInsert]).select().single();
            if (fbError) throw new Error(fbError.message);
            return { ...data, ...userData };
          }
          throw new Error(err.message);
        }
      }
      return await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    async updateUser(id, userData) {
      const sb = getSupabase();
      if (sb) {
        const updatePayload = { ...userData };
        if (userData.level_code || userData.level) {
          const levelCode = userData.level_code || userData.level;
          const levelMap = { 'L1': 'Foundation', 'L2': 'Practitioner', 'L3': 'Senior / Coordinator', 'L4': 'Manager / HOD', 'L5': 'Leadership' };
          updatePayload.level = levelCode;
          updatePayload.level_code = levelCode;
          updatePayload.level_name = userData.level_name || levelMap[levelCode] || 'Foundation';
        }
        if (userData.job_title) {
          updatePayload.role_label = userData.job_title;
        }

        try {
          const { data, error } = await sb.from('users').update(updatePayload).eq('id', id).select().single();
          if (error) throw error;
          return data;
        } catch (err) {
          if (err.message && err.message.includes('schema cache')) {
            const fallbackUpdate = {
              name: userData.name,
              email: userData.email,
              role: userData.role,
              department: userData.department,
              role_label: userData.job_title || userData.role_label,
              level: userData.level_code || userData.level,
            };
            const { data, error: fbError } = await sb.from('users').update(fallbackUpdate).eq('id', id).select().single();
            if (fbError) throw new Error(fbError.message);
            return { ...data, ...userData };
          }
          throw new Error(err.message);
        }
      }
      return await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    async deleteUser(id) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from('users').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { message: 'User deleted successfully' };
      }
      return await apiFetch(`/users/${id}`, {
        method: 'DELETE',
      });
    },

    // ── Courses & Modules ──
    async getCourses(track) {
      const sb = getSupabase();
      if (sb) {
        let q = sb.from('courses').select('*, Modules:modules(*)').order('id', { ascending: true });
        if (track) q = q.eq('track', track);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch(`/courses${track ? '?track=' + track : ''}`);
    },

    async createCourse(courseData) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('courses').insert([courseData]).select().single();
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
    },

    async updateCourse(id, courseData) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('courses').update(courseData).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
    },

    async deleteCourse(id) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from('courses').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { message: 'Course deleted successfully' };
      }
      return await apiFetch(`/courses/${id}`, {
        method: 'DELETE',
      });
    },

    // ── Progress ──
    async getMyProgress() {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('user_progress').select('*, Course:courses(*)').eq('user_id', u.id || 1);
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/progress/me');
    },

    // ── Materials ──
    async getMaterials(type) {
      const sb = getSupabase();
      if (sb) {
        let q = sb.from('materials').select('*').order('id', { ascending: true });
        if (type) q = q.eq('type', type);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch(`/materials${type ? '?type=' + type : ''}`);
    },

    async createMaterial(materialData) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('materials').insert([materialData]).select().single();
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/materials', {
        method: 'POST',
        body: JSON.stringify(materialData),
      });
    },

    async updateMaterial(id, materialData) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('materials').update(materialData).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch(`/materials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(materialData),
      });
    },

    async deleteMaterial(id) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from('materials').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { message: 'Material deleted successfully' };
      }
      return await apiFetch(`/materials/${id}`, {
        method: 'DELETE',
      });
    },

    async acknowledgeMaterial(id) {
      return await apiFetch(`/materials/${id}/acknowledge`, { method: 'POST' });
    },

    // ── Assessments ──
    async getAssessments() {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('assessments').select('*').order('id', { ascending: true });
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/assessments');
    },

    async submitAssessment(id, answers, score) {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('assessment_results').insert([{
          user_id: u.id || 1,
          assessment_id: id,
          score: score || 100,
          status: 'passed',
          answers_json: answers,
        }]).select().single();
        if (error) throw new Error(error.message);
        return { message: 'Assessment submitted successfully', result: data };
      }
      return await apiFetch(`/assessments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, score }),
      });
    },

    // ── Certificates ──
    async getCertificates() {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('certificates').select('*').eq('user_id', u.id || 1).order('id', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/certificates/me');
    },

    // ── Announcements ──
    async getAnnouncements(category) {
      const sb = getSupabase();
      if (sb) {
        let q = sb.from('announcements').select('*').order('id', { ascending: false });
        if (category && category !== 'all') q = q.eq('category', category);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch(`/announcements${category ? '?category=' + category : ''}`);
    },

    // ── Tickets ──
    async getTickets() {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('support_tickets').select('*').eq('user_id', u.id || 1).order('id', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/tickets/me');
    },

    async createTicket(subject, department, description) {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('support_tickets').insert([{
          user_id: u.id || 1,
          subject,
          department: department || 'IT Support',
          description,
          status: 'open',
          status_badge: 'Open',
          time_ago: 'Just now',
          assigned_agent: 'Support Team',
          assigned_role: department || 'IT Support',
          latest_comment: 'Your ticket has been received and is pending assignment.',
        }]).select().single();
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, department, description }),
      });
    },

    // ── Notes ──
    async getNotes() {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('video_notes').select('*').eq('user_id', u.id || 1).order('id', { ascending: true });
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/notes/me');
    },

    async createNote(timestamp_sec, text, is_bookmarked) {
      const sb = getSupabase();
      if (sb) {
        const u = JSON.parse(sessionStorage.getItem('sda_user') || '{}');
        const { data, error } = await sb.from('video_notes').insert([{
          user_id: u.id || 1,
          timestamp_sec: timestamp_sec || '05:18',
          text,
          is_mine: true,
          is_bookmarked: !!is_bookmarked,
        }]).select().single();
        if (error) throw new Error(error.message);
        return data;
      }
      return await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify({ timestamp_sec, text, is_bookmarked }),
      });
    },
  };
})();
