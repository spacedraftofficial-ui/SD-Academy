import express from 'express';
import { Certificate } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/certificates/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const certs = await Certificate.findAll({ where: { user_id: req.user.id } });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
