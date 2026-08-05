import express from 'express';
import { Course, Module } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { track, department } = req.query;
    const where = {};
    if (track) where.track = track;
    if (department) where.department = department;

    const courses = await Course.findAll({
      where,
      include: [{ model: Module }],
      order: [['id', 'ASC']],
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/courses (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/courses/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.update(req.body);
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/courses/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.destroy();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
