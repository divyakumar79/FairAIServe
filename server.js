const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// serve the static HTML/CSS/JS files from the project root so that
// the client and API share the same origin (avoids cross‑origin fetch issues)
app.use(express.static(path.join(__dirname)));

// debug log environment variables (help troubleshoot bad credentials)
console.log('EMAIL_USER length:', process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

// configure transporter -- replace with real credentials or use environment variables
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    logger: true,
    debug: true // turn on for detailed output
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

  // if transporter wasn't configured above we should treat it as an error so
  // the client doesn't display a misleading "thank you" message
  if (!transporter) {
    console.warn('No transporter configured; request will not be emailed:', email);
    return res.status(500).json({
      error: 'Mail service not configured',
      details: 'Set EMAIL_USER and EMAIL_PASS environment variables or configure SMTP'
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent:', info.response);
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending mail:', err);
    // include error message in response for easier debugging (don't expose in production)
    res.status(500).json({ error: 'Failed to send notification', details: err.message });
  }
});

// simple test endpoint to verify transporter configuration
app.get('/test', async (req, res) => {
  if (!transporter) {
    return res.status(500).json({ error: 'transporter not configured' });
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: 'Transporter test email',
      text: 'This is a test message from FairAIServe backend.'
    });
    res.json({ success: true, info: info.response });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
