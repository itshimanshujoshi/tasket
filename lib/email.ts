import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Tasket Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Tasket!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for signing up for Tasket. We're excited to have you on board!</p>
          <p>With Tasket, you can:</p>
          <ul>
            <li>Organize your tasks efficiently</li>
            <li>Prioritize your work with AI assistance</li>
            <li>Track your productivity</li>
          </ul>
          <p>Get started by logging in and creating your first task!</p>
        </div>
        <div class="footer">
          <p>© 2026 Tasket Support. All rights reserved.</p>
          <p>If you have any questions, feel free to contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Tasket!',
    html,
  });
}

export async function sendAdminSignupNotification(userEmail: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New User Signup</h1>
        </div>
        <div class="content">
          <h2>New user registered on Tasket</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: 'New User Signup - Tasket',
    html,
  });
}

export async function sendOTPEmail(userEmail: string, userName: string, otp: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .otp-box { background-color: #4F46E5; color: white; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
        .warning { color: #DC2626; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>We received a request to reset your password. Use the OTP below to proceed:</p>
          <div class="otp-box">${otp}</div>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p class="warning">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2026 Tasket Support. All rights reserved.</p>
          <p>For security reasons, never share your OTP with anyone.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Password Reset OTP - Tasket',
    html,
  });
}
