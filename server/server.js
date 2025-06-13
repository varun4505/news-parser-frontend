const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
    }
  });
};

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to_email, subject, client_name, email_content, from_name } = req.body;

    // Validate required fields
    if (!to_email || !subject || !email_content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to_email, subject, or email_content'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
          }
          .footer {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            font-size: 0.9em;
          }
          .news-item {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 3px solid #007bff;
            background-color: #f8f9fa;
          }
          .news-title {
            font-weight: bold;
            color: #007bff;
            margin-bottom: 8px;
          }
          .news-meta {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 8px;
          }
          .news-link {
            color: #007bff;
            text-decoration: none;
          }
          .news-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${subject}</h2>
        </div>
        
        <div class="content">
          <p>Dear Sir/Madam,</p>
          <p>Greetings from ${from_name || 'Konnections IMAG News Tracking'}.</p>
          
          ${client_name ? `<p>Please find below the <strong>${client_name}</strong> Industry News Updates:</p>` : '<p>Please find below the Industry News Updates:</p>'}
          
          <div class="news-content">
            ${formatEmailContent(email_content)}
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Warm Regards,</strong><br>
          Tracking Team</p>
          <p>Integrated Marketing Communication Consultancy<br>
          Please review our website: <a href="https://www.konnectionsimag.com" target="_blank">https://www.konnectionsimag.com</a></p>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `"${from_name || 'Konnections IMAG'}" <${process.env.EMAIL_USER}>`,
      to: to_email,
      subject: subject,
      html: htmlContent,
      text: createTextVersion(email_content, client_name, from_name)
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Helper function to format email content for HTML
function formatEmailContent(content) {
  // Split content by double newlines to separate articles
  const articles = content.split('\n\n').filter(article => article.trim());
  
  return articles.map(article => {
    const lines = article.split('\n');
    const title = lines[0]?.replace(/^\d+\.\s*/, '') || 'No title';
    const description = lines[1] || 'No description available';
    const meta = lines[2] || '';
    const link = lines[3]?.replace('Link: ', '') || '';
    
    return `
      <div class="news-item">
        <div class="news-title">${title}</div>
        <div class="news-description">${description}</div>
        ${meta ? `<div class="news-meta">${meta}</div>` : ''}
        ${link ? `<div><a href="${link}" target="_blank" class="news-link">Read More</a></div>` : ''}
      </div>
    `;
  }).join('');
}

// Helper function to create plain text version
function createTextVersion(email_content, client_name, from_name) {
  return `
Dear Sir/Madam,

Greetings from ${from_name || 'Konnections IMAG News Tracking'}.

${client_name ? `Please find below the ${client_name} Industry News Updates:` : 'Please find below the Industry News Updates:'}

${email_content}

Warm Regards,
Tracking Team

Integrated Marketing Communication Consultancy
Please review our website: https://www.konnectionsimag.com
  `.trim();
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
