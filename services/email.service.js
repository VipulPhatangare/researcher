import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s/g, '') : '' // Remove spaces from app password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Researcher Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Welcome to Researcher!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for signing up. Please use the following OTP to verify your account:</p>
        <div style="background: #f7fafc; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #718096; font-size: 12px;">This is an automated email from Researcher. Please do not reply.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordEmail = async (email, tempPassword, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - Researcher',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Your temporary password is:</p>
        <div style="background: #f7fafc; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #667eea; margin: 0;">${tempPassword}</h2>
        </div>
        <p><strong>Important:</strong> Please change this password after logging in.</p>
        <p>If you didn't request this, please contact support immediately.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #718096; font-size: 12px;">This is an automated email from Researcher. Please do not reply.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
