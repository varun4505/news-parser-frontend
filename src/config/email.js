// EmailJS Configuration
// Replace these values with your actual EmailJS credentials
// You can sign up for free at https://www.emailjs.com/

export const EMAILJS_CONFIG = {
  serviceId: service_a72p6wt, // Your EmailJS service ID
  templateId: 'template_news_update', // Your EmailJS template ID
  userId: y5IRCALBYow13V80q, // Your EmailJS public key
};


/*
Instructions to set up EmailJS:

1. Create an account at https://www.emailjs.com/
2. Create a new Email Service (e.g., Gmail, Outlook, or other provider)
3. Create an Email Template with the following variables:
   - {{to_email}} - Recipient's email address
   - {{subject}} - Email subject
   - {{client_name}} - Client's name
   - {{email_content}} - Formatted news content
   - {{from_name}} - Sender's name

Template example:

Subject: {{subject}}

Dear Sir/Madam,

Greetings from {{from_name}}.

Please find below the {{client_name}} Industry News Updates:

{{email_content}}

Warm Regards,
Tracking Team

Integrated Marketing Communication Consultancy
Please review our website: https://www.konnectionsimag.com

4. Replace the values in this file with your actual EmailJS credentials
*/
