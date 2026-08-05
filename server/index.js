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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'SD Academy LMS Express API',
    database: `${sequelize.getDialect().toUpperCase()} (Sequelize ORM — Cloud Active)`,
    timestamp: new Date(),
  });
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

    app.listen(PORT, () => {
      console.log(`🚀 SD Academy Express Backend running on http://localhost:${PORT}`);
      console.log(`🔗 API Base Endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
}

startServer();
