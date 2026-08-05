import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, department, role_label } = req.body;
    const password_hash = await bcrypt.hash(password || 'password123', 10);
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || 'learner',
      department: department || 'Architecture',
      role_label: role_label || 'Architect',
      initials,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, email, role, department, role_label } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (role_label) user.role_label = role_label;

    if (name) {
      user.initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/users/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
