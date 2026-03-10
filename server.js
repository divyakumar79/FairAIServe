const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// configure transporter -- replace with real credentials or use environment variables
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  console.warn('EMAIL_USER/PASS not set; emails will not actually be sent.');
  transporter = null;
}

app.post('/submit', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'your.email@gmail.com',
    to: 'bhargava.divya14@gmail.com',
    subject: 'New AI governance assessment request',
    text: `A user has requested an assessment. Contact email: ${email}`
  };

  try {
    if (transporter) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('Received email request (no transporter configured):', email);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending mail:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
