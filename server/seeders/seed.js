import bcrypt from 'bcryptjs';
import {
  sequelize,
  User,
  Course,
  Module,
  UserProgress,
  Assessment,
  Material,
  Certificate,
  Announcement,
  SupportTicket,
  VideoNote,
} from '../models/index.js';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Sync database schemas
  await sequelize.sync({ force: true });

  // 1. Create Users
  const learnerPassword = await bcrypt.hash('learner123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const learner = await User.create({
    name: 'John Abraham',
    email: 'john.abraham@sdacademy.in',
    password_hash: learnerPassword,
    role: 'learner',
    department: 'Design & Planning Department',
    role_label: 'Architect',
    initials: 'JA',
  });

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@sdacademy.in',
    password_hash: adminPassword,
    role: 'admin',
    department: 'HR / L&D',
    role_label: 'Administrator',
    initials: 'AD',
  });

  const david = await User.create({
    name: 'David K',
    email: 'david.k@sdacademy.in',
    password_hash: learnerPassword,
    role: 'learner',
    department: 'Engineering',
    role_label: 'HOD Reviewer',
    initials: 'DK',
  });

  // 2. Create Courses & Modules
  const course1 = await Course.create({
    title: 'Intro to Architectural Fundamentals',
    description: 'Learn the fundamental principles and concepts of architecture.',
    track: 'core',
    department: 'Architecture',
    estimated_time: '1h 30m',
  });

  await Module.create({
    course_id: course1.id,
    title: 'Watch: Architectural Fundamentals',
    type: 'video',
    duration: '23:45',
    order_index: 1,
  });

  await Module.create({
    course_id: course1.id,
    title: 'Architectural Design SOP',
    type: 'sop',
    duration: '45m',
    order_index: 2,
  });

  // 3. User Progress
  await UserProgress.create({
    user_id: learner.id,
    course_id: course1.id,
    status: 'in_progress',
    progress_pct: 55,
  });

  // 4. Assessments
  await Assessment.create({
    title: 'Sketching Essential Quiz',
    type: 'quiz',
    status_label: 'Attempted',
  });

  await Assessment.create({
    title: 'Advanced CAD Assignment',
    type: 'assignment',
    status_label: 'Passed',
  });

  // 5. Materials
  await Material.bulkCreate([
    { title: 'Architectural Design SOP', type: 'sop', department: 'Architecture', phase: 'Design Phase', icon: '📋', version: 'V1.4' },
    { title: 'Site Analysis SOP', type: 'sop', department: 'Architecture', phase: 'Design Phase', icon: '📋', version: 'V1.4' },
    { title: 'Permit Application SOP', type: 'sop', department: 'Architecture', phase: 'Preliminary', icon: '📋', version: 'V1.4' },
    { title: 'Design Review Checklist', type: 'checklist', department: 'Architecture', phase: 'Design Phase', icon: '☑️', version: 'V1.4' },
    { title: 'Company Safety Policy', type: 'policy', department: 'HR', phase: 'All Phases', icon: '📃', version: 'V1.0' },
  ]);

  // 6. Certificates
  await Certificate.bulkCreate([
    { user_id: learner.id, course_title: 'Writing Engaging Content', issued_date: '2026-02-10' },
    { user_id: learner.id, course_title: 'CRM Fundamentals', issued_date: '2026-01-15' },
    { user_id: learner.id, course_title: 'Procurement SOP Master', issued_date: '2026-01-20' },
  ]);

  // 7. Announcements
  await Announcement.bulkCreate([
    {
      title: 'Company Team Building Event Next Friday',
      author: 'Laura HR',
      category: 'hr',
      tag: 'HR Announcement',
      tag_cls: 'badge-navy',
      body: 'We are excited to announce a team-building event next Friday from 2 PM to 5 PM.',
      likes_count: 45,
      comments_count: 12,
    },
    {
      title: 'New Remote Work Policy Update',
      author: 'Laura HR',
      category: 'hr',
      tag: 'Policy',
      tag_cls: 'badge-warning',
      body: 'Please note that our remote work policy has been updated effective from the 1st of next month.',
      likes_count: 45,
      comments_count: 12,
    },
  ]);

  // 8. Support Tickets
  await SupportTicket.create({
    user_id: learner.id,
    subject: 'VPN Connection issue',
    department: 'IT Support',
    description: 'Unable to connect to company VPN from remote location.',
    status: 'in_progress',
    status_badge: 'In Progress',
    time_ago: '1 Day ago',
    assigned_agent: 'Rachel',
    assigned_role: 'IT Support',
    latest_comment: 'We are investigating the issue. Please wait while we resolve it.',
  });

  // 9. Video Notes
  await VideoNote.bulkCreate([
    { user_id: learner.id, timestamp_sec: '00:45', text: 'Defining the target audience is critical', is_mine: true, is_bookmarked: false },
    { user_id: learner.id, timestamp_sec: '02:15', text: 'Content should be concise and clear', is_mine: true, is_bookmarked: true },
    { user_id: learner.id, timestamp_sec: '03:30', text: 'Gathering date through surveys is important', is_mine: false, is_bookmarked: false },
    { user_id: learner.id, timestamp_sec: '05:50', text: 'Addressing audience pain points', is_mine: true, is_bookmarked: false },
  ]);

  console.log('✅ Database seeded successfully with SQLite database file!');
}

// Run directly if called via script
if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
}
