import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, User } from './models/index.js';
import { seedDatabase } from './seeders/seed.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';
import assessmentRoutes from './routes/assessments.js';
import materialRoutes from './routes/materials.js';
import certificateRoutes from './routes/certificates.js';
import announcementRoutes from './routes/announcements.js';
import ticketRoutes from './routes/tickets.js';
import noteRoutes from './routes/notes.js';
import contactRoutes from './routes/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Header Middleware
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// In-Memory Simple Rate Limiting for Auth
const authAttempts = new Map();
app.use('/api/auth/login', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 10;

  const userAttempts = authAttempts.get(ip) || [];
  const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Please try again after 15 minutes.'
    });
  }

  recentAttempts.push(now);
  authAttempts.set(ip, recentAttempts);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'SD Academy LMS Express API',
    database: `${sequelize.getDialect().toUpperCase()} (Sequelize ORM — Active)`,
    timestamp: new Date(),
  });
});

// Clean URL Frontend Route Mappings (Supports URLs with or without .html extension)
const frontendPage = page => (req, res) => res.sendFile(path.join(__dirname, `../client/${page}`));

app.get(['/', '/index', '/index.html'], frontendPage('index.html'));
app.get(['/login', '/login.html'], frontendPage('login.html'));
app.get(['/dashboard', '/dashboard.html'], frontendPage('dashboard.html'));
app.get(['/learning-path', '/learning-path.html'], frontendPage('learning-path.html'));
app.get(['/assessments', '/assessments.html'], frontendPage('assessments.html'));
app.get(['/certificates', '/certificates.html'], frontendPage('certificates.html'));
app.get(['/materials', '/materials.html'], frontendPage('materials.html'));
app.get(['/support', '/support.html'], frontendPage('support.html'));
app.get(['/announcements', '/announcements.html'], frontendPage('announcements.html'));
app.get(['/video-player', '/video-player.html'], frontendPage('video-player.html'));
app.get(['/privacy-policy', '/privacy-policy.html'], frontendPage('privacy-policy.html'));
app.get(['/terms-of-use', '/terms-of-use.html'], frontendPage('terms-of-use.html'));
app.get(['/employee-data-policy', '/employee-data-policy.html'], frontendPage('employee-data-policy.html'));
app.get(['/help', '/help.html'], frontendPage('help.html'));

// 404 Fallback for unknown frontend or API routes
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
  }
  if (req.accepts('json')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.status(404).type('txt').send('404 Not Found');
});

// Initialize database & start server
async function startServer() {
  try {
    await sequelize.authenticate();
    const dialectName = sequelize.getDialect().toUpperCase();
    console.log(`✅ ${dialectName} Database connected successfully via Sequelize ORM!`);

    await sequelize.sync();

    // Check if database needs initial seed data
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('📦 Empty database detected. Auto-seeding initial data...');
      await seedDatabase();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 SD Academy Express Backend running on http://0.0.0.0:${PORT}`);
      console.log(`🔗 API Base Endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
}

startServer();
