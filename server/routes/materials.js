import express from 'express';
import { Material } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/materials
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, department, phase } = req.query;
    const where = {};
    if (type) where.type = type;
    if (department) where.department = department;
    if (phase) where.phase = phase;

    const materials = await Material.findAll({ where, order: [['id', 'ASC']] });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/materials/:id/acknowledge
router.post('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    let acks = [];
    try { acks = JSON.parse(material.acknowledged_by || '[]'); } catch(e){}
    if (!acks.includes(req.user.id)) {
      acks.push(req.user.id);
      material.acknowledged_by = JSON.stringify(acks);
      await material.save();
    }

    res.json({ message: 'Material acknowledged', material });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/materials (Admin only - Create/Upload content)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, type, department, phase, file_url, description, is_sop } = req.body;
    const material = await Material.create({
      title,
      type: type || 'video',
      department: department || 'Architecture',
      phase: phase || 'Onboarding',
      file_url: file_url || '',
      description: description || '',
      is_sop: is_sop || false,
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/materials/:id (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    await material.update(req.body);
    res.json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/materials/:id (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    await material.destroy();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
