import express from 'express';
import { Announcement } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/announcements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category && category !== 'all') where.category = category;

    const list = await Announcement.findAll({ where, order: [['id', 'DESC']] });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/announcements (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const item = await Announcement.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
