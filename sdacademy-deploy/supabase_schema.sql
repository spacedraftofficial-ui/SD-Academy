-- ============================================================================
--   SD Academy — Complete Supabase PostgreSQL Schema & Initial Seed Data
--   Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table (for profiles & LMS roles)
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'learner', -- 'admin', 'learner', 'reviewer'
    department VARCHAR(255) DEFAULT 'Architecture',
    role_label VARCHAR(255) DEFAULT 'Architect',
    level VARCHAR(50) DEFAULT 'L1',
    initials VARCHAR(10) DEFAULT 'SD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    track VARCHAR(50) DEFAULT 'core',
    department VARCHAR(255) DEFAULT 'Architecture',
    estimated_time VARCHAR(50) DEFAULT '1h 30m',
    thumbnail_color VARCHAR(255) DEFAULT 'linear-gradient(135deg, #3b82f6, #1e2545)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'video', -- 'video', 'sop', 'quiz'
    content_url VARCHAR(500),
    duration VARCHAR(50) DEFAULT '23:45',
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id BIGINT,
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    progress_pct INT DEFAULT 0,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'quiz',
    status_label VARCHAR(100) DEFAULT 'Not Started',
    questions_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Assessment Results Table
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    assessment_id BIGINT REFERENCES public.assessments(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'attempted',
    answers_json JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Materials Table (SOPs, Policies, Checklists)
CREATE TABLE IF NOT EXISTS public.materials (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'sop', -- 'sop', 'policy', 'checklist'
    department VARCHAR(255) DEFAULT 'Architecture',
    phase VARCHAR(255) DEFAULT 'Design Phase',
    icon VARCHAR(50) DEFAULT '📋',
    file_url VARCHAR(500),
    version VARCHAR(50) DEFAULT 'V1.4',
    acknowledged_by JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    issued_date VARCHAR(50),
    pdf_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) DEFAULT 'Laura HR',
    category VARCHAR(50) DEFAULT 'hr',
    tag VARCHAR(100) DEFAULT 'HR Announcement',
    tag_cls VARCHAR(50) DEFAULT 'badge-navy',
    body TEXT NOT NULL,
    likes_count INT DEFAULT 45,
    comments_count INT DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    department VARCHAR(255) DEFAULT 'IT Support',
    description TEXT,
    status VARCHAR(50) DEFAULT 'in_progress',
    status_badge VARCHAR(50) DEFAULT 'In Progress',
    time_ago VARCHAR(50) DEFAULT '1 Day ago',
    assigned_agent VARCHAR(255) DEFAULT 'Rachel',
    assigned_role VARCHAR(255) DEFAULT 'IT Support',
    latest_comment TEXT DEFAULT 'We are investigating the issue. Please wait while we resolve it.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create Video Notes Table
CREATE TABLE IF NOT EXISTS public.video_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    timestamp_sec VARCHAR(50) DEFAULT '05:18',
    text TEXT NOT NULL,
    is_mine BOOLEAN DEFAULT TRUE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
--   ROW LEVEL SECURITY (RLS) POLICIES — Enable Clean Public Access
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_notes ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write for all application tables
CREATE POLICY "Allow public read/write users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write user_progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write assessment_results" ON public.assessment_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write materials" ON public.materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write support_tickets" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write video_notes" ON public.video_notes FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
--   INITIAL SEED DATA
-- ============================================================================

-- Clear existing data
TRUNCATE TABLE public.users, public.courses, public.modules, public.user_progress, public.assessments, public.materials, public.certificates, public.announcements, public.support_tickets, public.video_notes RESTART IDENTITY CASCADE;

-- 1. Users (Passwords: admin123, learner123)
INSERT INTO public.users (name, email, password_hash, role, department, role_label, level, initials)
VALUES 
('Admin', 'admin@sdacademy.in', '$2a$10$wSimiMDuL0xALlKzcdN06Ohy9BKBffOZd3tkgxIkaWw75nTGsPwOm', 'admin', 'HR / L&D', 'Administrator', 'L5', 'AD'),
('John Abraham', 'john.abraham@sdacademy.in', '$2a$10$V83Pj5IDyqvKDWMJ8RKhQeFmc0RldXWEVKXeynIsOkI1r1P7YH2KS', 'learner', 'Design & Planning Department', 'Architect', 'L1', 'JA'),
('David K', 'david.k@sdacademy.in', '$2a$10$V83Pj5IDyqvKDWMJ8RKhQeFmc0RldXWEVKXeynIsOkI1r1P7YH2KS', 'learner', 'Engineering', 'HOD Reviewer', 'L3', 'DK');

-- 2. Courses & Modules
INSERT INTO public.courses (id, title, description, track, department, estimated_time)
VALUES (1, 'Intro to Architectural Fundamentals', 'Learn the fundamental principles and concepts of architecture.', 'core', 'Architecture', '1h 30m');

INSERT INTO public.modules (course_id, title, type, duration, order_index)
VALUES 
(1, 'Watch: Architectural Fundamentals', 'video', '23:45', 1),
(1, 'Architectural Design SOP', 'sop', '45m', 2);

-- 3. User Progress
INSERT INTO public.user_progress (user_id, course_id, status, progress_pct)
VALUES (2, 1, 'in_progress', 55);

-- 4. Assessments
INSERT INTO public.assessments (title, type, status_label)
VALUES 
('Sketching Essential Quiz', 'quiz', 'Attempted'),
('Advanced CAD Assignment', 'assignment', 'Passed');

-- 5. Materials
INSERT INTO public.materials (title, type, department, phase, icon, version)
VALUES 
('Architectural Design SOP', 'sop', 'Architecture', 'Design Phase', '📋', 'V1.4'),
('Site Analysis SOP', 'sop', 'Architecture', 'Design Phase', '📋', 'V1.4'),
('Permit Application SOP', 'sop', 'Architecture', 'Preliminary', '📋', 'V1.4'),
('Design Review Checklist', 'checklist', 'Architecture', 'Design Phase', '☑️', 'V1.4'),
('Company Safety Policy', 'policy', 'HR', 'All Phases', '📃', 'V1.0');

-- 6. Certificates
INSERT INTO public.certificates (user_id, course_title, issued_date)
VALUES 
(2, 'Writing Engaging Content', '2026-02-10'),
(2, 'CRM Fundamentals', '2026-01-15'),
(2, 'Procurement SOP Master', '2026-01-20');

-- 7. Announcements
INSERT INTO public.announcements (title, author, category, tag, tag_cls, body, likes_count, comments_count)
VALUES 
('Company Team Building Event Next Friday', 'Laura HR', 'hr', 'HR Announcement', 'badge-navy', 'We are excited to announce a team-building event next Friday from 2 PM to 5 PM.', 45, 12),
('New Remote Work Policy Update', 'Laura HR', 'hr', 'Policy', 'badge-warning', 'Please note that our remote work policy has been updated effective from the 1st of next month.', 45, 12);

-- 8. Support Tickets
INSERT INTO public.support_tickets (user_id, subject, department, description, status, status_badge, time_ago, assigned_agent, assigned_role, latest_comment)
VALUES 
(2, 'VPN Connection issue', 'IT Support', 'Unable to connect to company VPN from remote location.', 'in_progress', 'In Progress', '1 Day ago', 'Rachel', 'IT Support', 'We are investigating the issue. Please wait while we resolve it.');

-- 9. Video Notes
INSERT INTO public.video_notes (user_id, timestamp_sec, text, is_mine, is_bookmarked)
VALUES 
(2, '00:45', 'Defining the target audience is critical', true, false),
(2, '02:15', 'Content should be concise and clear', true, true),
(2, '03:30', 'Gathering date through surveys is important', false, false),
(2, '05:50', 'Addressing audience pain points', true, false);
