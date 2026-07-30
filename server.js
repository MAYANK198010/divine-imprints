import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to create nodemailer transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.zoho.in';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'accounts@mayankzen.in';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'mPJscy7WXr9h';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }

  // Fallback json transport for logging when SMTP credentials are not yet configured
  return nodemailer.createTransport({
    jsonTransport: true
  });
}

// API endpoint for Quote Requests
app.post('/api/quote', async (req, res) => {
  const { name, email, type, quantity, pages, phone, message } = req.body;

  console.log('--- NEW QUOTE REQUEST RECEIVED ---');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Type: ${type}`);
  console.log(`Quantity: ${quantity}`);
  console.log(`Pages: ${pages}`);
  if (phone) console.log(`Phone: ${phone}`);
  if (message) console.log(`Message: ${message}`);

  const targetEmail = process.env.TO_MAIL || process.env.TO_EMAIL || 'info@divineimprints.in';

  const mailOptions = {
    from: `"Divine Imprints Website" <${process.env.SMTP_USER || 'accounts@mayankzen.in'}>`,
    to: targetEmail,
    subject: `[Divine Imprints] New Quote Request from ${name || 'Customer'}`,
    text: `New Quote Request Received:
----------------------------------
Name: ${name || 'N/A'}
Email: ${email || 'N/A'}
Phone: ${phone || 'N/A'}
Project Type: ${type || 'N/A'}
Quantity: ${quantity || 'N/A'}
Pages / Panels: ${pages || 'N/A'}
Message / Details: ${message || 'None'}
Timestamp: ${new Date().toLocaleString()}
----------------------------------`,
    html: `
      <h2>New Quote Request Received</h2>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email || 'N/A'}</a></p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Project Type:</strong> ${type || 'N/A'}</p>
      <p><strong>Quantity:</strong> ${quantity || 'N/A'}</p>
      <p><strong>Pages / Panels:</strong> ${pages || 'N/A'}</p>
      <p><strong>Message / Details:</strong> ${message || 'None'}</p>
      <hr />
      <p><small>Submitted at ${new Date().toLocaleString()}</small></p>
    `
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId || info.response || JSON.stringify(info));
    return res.status(200).json({
      success: true,
      message: 'Thanks. Your request has been send our team shortly contact you.'
    });
  } catch (error) {
    console.error('Error sending quote email:', error.message || error);
    if (error.code === 'EAUTH' || (error.message && error.message.includes('Application-specific password required'))) {
      console.warn('NOTE: Gmail requires a 16-character App Password (from Google Account > Security > App passwords) to send automated SMTP emails.');
    }
    // Fall back to recording submission in logs so no customer message is lost
    console.log('--- SAVED SUBMISSION (BACKUP LOG) ---');
    console.log(JSON.stringify({ type: 'QUOTE_REQUEST', name, email, phone, projectType: type, quantity, pages, message, date: new Date().toISOString() }, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Thanks. Your request has been send our team shortly contact you.'
    });
  }
});

// API endpoint for Contact Form Messages
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log('--- NEW CONTACT MESSAGE RECEIVED ---');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone}`);
  console.log(`Message: ${message}`);

  const targetEmail = process.env.TO_MAIL || process.env.TO_EMAIL || 'info@divineimprints.in';

  const mailOptions = {
    from: `"Divine Imprints Website" <${process.env.SMTP_USER || 'accounts@mayankzen.in'}>`,
    to: targetEmail,
    subject: `[Divine Imprints] New Contact Message from ${name || 'Customer'}`,
    text: `New Contact Message Received:
----------------------------------
Name: ${name || 'N/A'}
Email: ${email || 'N/A'}
Phone: ${phone || 'N/A'}
Message: ${message || 'N/A'}
Timestamp: ${new Date().toLocaleString()}
----------------------------------`,
    html: `
      <h2>New Contact Message Received</h2>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email || 'N/A'}</a></p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Message:</strong> ${message || 'N/A'}</p>
      <hr />
      <p><small>Submitted at ${new Date().toLocaleString()}</small></p>
    `
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId || info.response || JSON.stringify(info));
    return res.status(200).json({
      success: true,
      message: 'Thanks. Your request has been send our team shortly contact you.'
    });
  } catch (error) {
    console.error('Error sending contact email:', error.message || error);
    if (error.code === 'EAUTH' || (error.message && error.message.includes('Application-specific password required'))) {
      console.warn('NOTE: Gmail requires a 16-character App Password (from Google Account > Security > App passwords) to send automated SMTP emails.');
    }
    // Fall back to recording submission in logs so no customer message is lost
    console.log('--- SAVED SUBMISSION (BACKUP LOG) ---');
    console.log(JSON.stringify({ type: 'CONTACT_MESSAGE', name, email, phone, message, date: new Date().toISOString() }, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Thanks. Your request has been send our team shortly contact you.'
    });
  }
});

// Explicit route for sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Explicit route for robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Serve static assets from root directory
app.use(express.static(__dirname));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback for HTML pages requested without extension (e.g., /about -> about.html)
app.use((req, res, next) => {
  if (req.method === 'GET' && !path.extname(req.path)) {
    const htmlPath = path.join(__dirname, `${req.path}.html`);
    res.sendFile(htmlPath, (err) => {
      if (err) {
        next();
      }
    });
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
