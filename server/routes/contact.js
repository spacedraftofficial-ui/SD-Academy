import express from 'express';
const router = express.Router();

// POST /api/contact - Contact form submission with ticket reference generation
router.post('/', (req, res) => {
  try {
    const { name, topic, email, phone, message } = req.body;

    if (!name || !topic || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, topic, email, and message are required fields.'
      });
    }

    // Generate traceable ticket reference ID
    const ticketId = 'SDA-TKT-' + Math.floor(100000 + Math.random() * 900000);

    console.log(`📩 New Contact/Support Submission [${ticketId}]:`, {
      name,
      topic,
      email,
      phone: phone || 'N/A',
      message,
      submittedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      ticketId,
      message: 'Your message has been received. Our HR/L&D support team will respond within 1 business day.',
      expectedSLA: '1 business day'
    });
  } catch (err) {
    console.error('Error handling contact submission:', err);
    res.status(500).json({ success: false, message: 'Internal server error processing contact submission.' });
  }
});

export default router;
