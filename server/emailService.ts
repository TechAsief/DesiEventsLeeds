import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: Transporter | null;

  constructor() {
    // Create transporter - works in both dev and production if EMAIL_USER is set
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Email credentials are configured - send real emails
      console.log('📧 Email service initialized with Gmail - real emails will be sent');
      try {
        // Use the correct method name: createTransport (not createTransporter)
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        console.log('📧 Transporter created successfully');
      } catch (err) {
        console.error('📧 Error creating transporter:', err);
        this.transporter = null;
      }
    } else {
      // No email credentials - just log to console
      console.log('📧 Email service initialized in development mode - emails will be logged to console');
      this.transporter = null;
    }
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
      if (this.transporter && process.env.EMAIL_USER) {
        // Real email sending - credentials are configured
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@desieventsleeds.com',
          to,
          subject,
          html,
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Real email sent successfully to:', to);
        return true;
      } else {
        // Development mode - just log the email details
        console.log('📧 ===== EMAIL WOULD BE SENT =====');
        console.log('📧 To:', to);
        console.log('📧 Subject:', subject);
        console.log('📧 From:', process.env.EMAIL_FROM || 'noreply@desieventsleeds.com');
        console.log('📧 HTML Length:', html.length);
        console.log('📧 ================================');
        return true; // Return true to simulate successful email sending
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  generatePasswordResetEmail(userName: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Desi Events Leeds</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Desi Events Leeds</h1>
            <p>Community • Culture • Connection</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${userName || 'Valued Member'},</p>
            <p>We received a request to reset your password for your Desi Events Leeds account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetLink}</p>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, this link can only be used once</li>
            </ul>
            <p>If you continue to have problems, please contact our support team.</p>
            <p>Best regards,<br>The Desi Events Leeds Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Desi Events Leeds. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetSuccessEmail(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Successful - Desi Events Leeds</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Desi Events Leeds</h1>
            <p>Community • Culture • Connection</p>
          </div>
          <div class="content">
            <h2>Password Reset Successful</h2>
            <p>Hello ${userName || 'Valued Member'},</p>
            <p>Your password has been successfully reset for your Desi Events Leeds account.</p>
            <p>You can now log in with your new password.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The Desi Events Leeds Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Desi Events Leeds. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateEventApprovalEmail(event: any, approveLink: string, rejectLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Event Pending Approval - Desi Events Leeds</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35; }
          .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
          .approve-btn { background: #28a745; color: white; }
          .reject-btn { background: #dc3545; color: white; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Desi Events Leeds</h1>
            <p>Community • Culture • Connection</p>
          </div>
          <div class="content">
            <h2>New Event Pending Approval</h2>
            <p>Hello Asief,</p>
            <p>A new event has been submitted and is waiting for your approval:</p>
            
            <div class="event-details">
              <h3 style="color: #ff6b35; margin-top: 0;">${event.title}</h3>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()} at ${event.time}</p>
              <p><strong>Location:</strong> ${event.locationText}</p>
              <p><strong>Category:</strong> ${event.category}</p>
              <p><strong>Contact:</strong> ${event.contactEmail}</p>
              <p><strong>Description:</strong></p>
              <p>${event.description}</p>
              ${event.imageUrl ? `<p><strong>Image:</strong> <a href="${event.imageUrl}" target="_blank">View Event Image</a></p>` : ''}
              ${event.bookingLink ? `<p><strong>Booking Link:</strong> <a href="${event.bookingLink}" target="_blank">${event.bookingLink}</a></p>` : ''}
            </div>
            
            <p>Please review the event details above and take action:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approveLink}" class="button approve-btn">✅ Approve Event</a>
              <a href="${rejectLink}" class="button reject-btn">❌ Reject Event</a>
            </div>
            
            <p><strong>Note:</strong> These links will expire in 7 days for security reasons.</p>
            <p>Best regards,<br>The Desi Events Leeds Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Desi Events Leeds. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
