import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not found. Email functionality will be disabled.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface VAWelcomeEmailData {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}

export async function sendVAWelcomeEmail(data: VAWelcomeEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('Email not sent - RESEND_API_KEY not configured');
    return;
  }

  try {
    await resend.emails.send({
      from: 'noreply@your-domain.com', // You'll need to configure this with your domain
      to: data.email,
      subject: 'Welcome to Car Lead Management - Your Account Details',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Car Lead Management</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #1f2937; margin-bottom: 20px;">Welcome to Car Lead Management!</h1>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Hi ${data.name},
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Your Virtual Assistant account has been created. You can now access the Car Lead Management system to submit and manage leads.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Your Login Details:</h3>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Password:</strong> ${data.password}</p>
              <p style="margin: 15px 0 5px 0; color: #4b5563;"><strong>Login URL:</strong></p>
              <a href="${data.loginUrl}" style="color: #3b82f6; text-decoration: none;">${data.loginUrl}</a>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Important:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need help getting started, please don't hesitate to reach out to your administrator.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Best regards,<br>
              The Car Lead Management Team
            </p>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </body>
        </html>
      `,
      text: `
Welcome to Car Lead Management!

Hi ${data.name},

Your Virtual Assistant account has been created. You can now access the Car Lead Management system to submit and manage leads.

Your Login Details:
Email: ${data.email}
Password: ${data.password}
Login URL: ${data.loginUrl}

IMPORTANT: Please change your password after your first login for security purposes.

If you have any questions or need help getting started, please don't hesitate to reach out to your administrator.

Best regards,
The Car Lead Management Team

This is an automated message. Please do not reply to this email.
      `
    });
    
    console.log(`Welcome email sent successfully to ${data.email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}