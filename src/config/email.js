// Email API Configuration
// Backend server configuration for nodemailer

export const EMAIL_API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  endpoints: {
    sendEmail: '/api/send-email',
    health: '/api/health'
  }
};

/*
Instructions to set up the email server:

1. Navigate to the server directory: cd server
2. Install dependencies: npm install
3. Copy .env.example to .env: cp .env.example .env
4. Configure your email credentials in .env:
   - For Gmail:
     * Enable 2-factor authentication
     * Generate an "App Password" (not your regular password)
     * Set EMAIL_SERVICE=gmail
     * Set EMAIL_USER=your-email@gmail.com
     * Set EMAIL_PASSWORD=your-app-password
   
   - For other services:
     * Set EMAIL_SERVICE to: outlook, yahoo, etc.
     * Or configure custom SMTP in server.js

5. Start the server: npm run dev (for development) or npm start (for production)

The server will run on port 5000 by default and provide the email sending API.
*/
