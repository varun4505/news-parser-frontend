# News Parser Frontend

A React-based frontend application for parsing, displaying, and sending news updates via email.

## Email Functionality

This application uses EmailJS to send emails directly from the frontend. To set up the email sending feature:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a new Email Service (e.g., Gmail, Outlook, or another email provider)
3. Create an Email Template with the following variables:
   - `{{to_email}}` - Recipient's email address
   - `{{subject}}` - Email subject
   - `{{client_name}}` - Client's name
   - `{{email_content}}` - Formatted news content
   - `{{from_name}}` - Sender's name

4. Update the configuration in `src/config/email.js` with your:
   - Service ID
   - Template ID
   - User ID (Public Key)

## Example Email Template

```
Subject: {{subject}}

Dear Sir/Madam,

Greetings from {{from_name}}.

Please find below the {{client_name}} Industry News Updates:

{{email_content}}

Warm Regards,
Tracking Team

Integrated Marketing Communication Consultancy
Please review our website: https://www.konnectionsimag.com
```

## Features

- Search for news articles
- Filter by language, country, and time period
- Client-specific keyword tracking
- Email article selections to clients
- Copy email content to clipboard
- Direct email sending via EmailJS integration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure EmailJS: Update credentials in `src/config/email.js`
4. Start the development server: `npm start`

## Environment Variables

To configure the backend URL, update the `BACKEND_URL` constant in `App.js`.
