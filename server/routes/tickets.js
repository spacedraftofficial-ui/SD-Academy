import express from 'express';
import { SupportTicket } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tickets/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { user_id: req.user.id },
      order: [['id', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, department, description } = req.body;
    const ticket = await SupportTicket.create({
      user_id: req.user.id,
      subject,
      department: department || 'IT Support',
      description,
      status: 'open',
      status_badge: 'Open',
      time_ago: 'Just now',
      assigned_agent: 'Support Team',
      assigned_role: department || 'IT Support',
      latest_comment: 'Your ticket has been received and is pending assignment.',
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
