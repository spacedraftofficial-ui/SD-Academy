import express from 'express';
import { UserProgress, Course } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/progress/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const progress = await UserProgress.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Course }],
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/progress/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, progress_pct } = req.body;
    const progress = await UserProgress.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    if (status) progress.status = status;
    if (progress_pct !== undefined) progress.progress_pct = progress_pct;
    if (status === 'completed') progress.completed_at = new Date();

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
