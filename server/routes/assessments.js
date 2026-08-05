import express from 'express';
import { Assessment, AssessmentResult } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/assessments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const assessments = await Assessment.findAll();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assessments/:id/submit
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers, score } = req.body;
    const result = await AssessmentResult.create({
      user_id: req.user.id,
      assessment_id: req.params.id,
      score: score || 100,
      status: 'passed',
      answers_json: JSON.stringify(answers || {}),
    });
    res.json({ message: 'Assessment submitted successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
