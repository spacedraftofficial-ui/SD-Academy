import express from 'express';
import { VideoNote } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notes/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const notes = await VideoNote.findAll({
      where: { user_id: req.user.id },
      order: [['id', 'ASC']]
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notes
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { timestamp_sec, text, is_bookmarked } = req.body;
    const note = await VideoNote.create({
      user_id: req.user.id,
      timestamp_sec: timestamp_sec || '05:18',
      text,
      is_mine: true,
      is_bookmarked: !!is_bookmarked,
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await VideoNote.destroy({
      where: { id: req.params.id, user_id: req.user.id }
    });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
