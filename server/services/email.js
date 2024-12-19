const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/log');

// Email templates
const templates = {
  'email-verification': {
    subject: 'Verify your email address',
    html: (context) => `
      <h1>Welcome to VAM Tank Control!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${context.verificationLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `
  },
  'password-reset': {
    subject: 'Reset your password',
    html: (context) => `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to set a new password:</p>
      <a href="${context.resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `
  }
};

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: config.email.host || 'smtp.gmail.com',
  port: config.email.port || 587,
  secure: config.email.secure || false,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

/**
 * Send an email using a template
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.context - Template context
 */
const sendEmail = async ({ to, template, context }) => {
  try {
    if (!templates[template]) {
      throw new Error(`Template ${template} not found`);
    }

    const mailOptions = {
      from: config.email.from || '"VAM Tank Control" <no-reply@vamtankcontrol.com>',
      to,
      subject: templates[template].subject,
      html: templates[template].html(context)
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Verify email configuration on startup
const verifyEmailConfig = async () => {
  try {
    if (config.email?.user && config.email?.password) {
      await transporter.verify();
      logger.info('Email service is ready');
    } else {
      logger.warn('Email configuration is missing. Email features will not work.');
    }
  } catch (error) {
    logger.error('Email service verification failed:', error);
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig
}; 