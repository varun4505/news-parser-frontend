# News Parser Frontend

A React-based frontend application for parsing, displaying, and sending news updates via email using a Node.js backend with nodemailer.

## Email Functionality

This application uses a Node.js backend server with nodemailer to send emails. The system consists of:
- **Frontend**: React application for the user interface
- **Backend**: Express.js server that handles email sending

## Setup Instructions

### Backend Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure email credentials:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your email credentials:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   PORT=5000
   ```

   **For Gmail users:**
   - Enable 2-factor authentication
   - Generate an "App Password" (not your regular password)
   - Use the app password in `EMAIL_PASSWORD`

5. Start the backend server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the API URL (optional):
   - The frontend is configured to use `http://localhost:5000` by default
   - To change this, set the `REACT_APP_API_URL` environment variable

3. Start the development server:
   ```bash
   npm start
   ```

## Features

- Search for news articles
- Filter by language, country, and time period
- Client-specific keyword tracking
- Email article selections to clients with beautiful HTML formatting
- Copy email content to clipboard
- Secure server-side email sending with nodemailer

## Email Template

The system automatically generates professional HTML emails with:
- Responsive design
- Branded header and footer
- Formatted news articles with titles, descriptions, and links
- Plain text fallback for email clients that don't support HTML

## Environment Variables

### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

### Backend
- `EMAIL_SERVICE`: Email service provider (gmail, outlook, yahoo, etc.)
- `EMAIL_USER`: Your email address
- `EMAIL_PASSWORD`: Your email password or app password
- `PORT`: Server port (default: 5000)

## Project Structure

```
├── src/                    # Frontend React application
├── server/                 # Backend Node.js server
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── .gitignore         # Git ignore for backend
└── README.md              # This file
```
