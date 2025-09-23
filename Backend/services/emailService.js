const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter
   */
  createTransporter() {
    // For development without email setup, use a mock transporter
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USERNAME) {
      return {
        sendMail: async (mailOptions) => {
          console.log('\n📧 EMAIL WOULD BE SENT:');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('Preview would be available at: http://localhost:5000/api/health');
          return { messageId: 'mock-' + Date.now() };
        }
      };
    }
    
    // For production, configure with your actual email service
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Development configuration with real email service
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  /**
   * Send email verification
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} verificationToken - Verification token
   */
  async sendVerificationEmail(email, name, verificationToken) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Student Material Hub" <${process.env.EMAIL_FROM || 'noreply@studenthub.com'}>`,
      to: email,
      subject: 'Verify Your Email - Student Material Hub',
      html: this.getVerificationEmailTemplate(name, verificationUrl)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      
      // Log preview URL for development (only if real nodemailer)
      if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_USERNAME && nodemailer.getTestMessageUrl) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} resetToken - Password reset token
   */
  async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Student Material Hub" <${process.env.EMAIL_FROM || 'noreply@studenthub.com'}>`,
      to: email,
      subject: 'Password Reset - Student Material Hub',
      html: this.getPasswordResetEmailTemplate(name, resetUrl)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      
      // Log preview URL for development (only if real nodemailer)
      if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_USERNAME && nodemailer.getTestMessageUrl) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email after verification
   * @param {string} email - User email
   * @param {string} name - User name
   */
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"Student Material Hub" <${process.env.EMAIL_FROM || 'noreply@studenthub.com'}>`,
      to: email,
      subject: 'Welcome to Student Material Hub!',
      html: this.getWelcomeEmailTemplate(name)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome emails as it's not critical
      return { success: false, error: error.message };
    }
  }

  /**
   * Email verification template
   */
  getVerificationEmailTemplate(name, verificationUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Student Material Hub</h1>
            </div>
            <div class="content">
                <h2>Welcome, ${name}!</h2>
                <p>Thank you for registering with Student Material Hub. To complete your registration and start sharing study materials, please verify your email address.</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
                </div>
                
                <p>After verification, you'll be able to:</p>
                <ul>
                    <li>📖 Access study materials from other students</li>
                    <li>📤 Upload and share your own notes</li>
                    <li>💫 Like and bookmark helpful materials</li>
                    <li>🔍 Search for materials by subject and topic</li>
                </ul>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Student Material Hub Team</p>
                <p>If you have any questions, please contact us at support@studenthub.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Password reset email template
   */
  getPasswordResetEmailTemplate(name, resetUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
                <h2>Hello, ${name}</h2>
                <p>We received a request to reset your password for your Student Material Hub account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul>
                        <li>This reset link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you create a new one</li>
                    </ul>
                </div>
                
                <p>For security reasons, we recommend choosing a strong password that:</p>
                <ul>
                    <li>Contains at least 8 characters</li>
                    <li>Includes uppercase and lowercase letters</li>
                    <li>Contains numbers and special characters</li>
                    <li>Is unique to your Student Material Hub account</li>
                </ul>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Student Material Hub Team</p>
                <p>If you need help, contact us at support@studenthub.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Welcome email template
   */
  getWelcomeEmailTemplate(name) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Student Material Hub</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Student Material Hub!</h1>
            </div>
            <div class="content">
                <h2>Hello, ${name}!</h2>
                <p>Congratulations! Your email has been verified and your account is now active. You're ready to start your journey with Student Material Hub!</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
                </div>
                
                <h3>🚀 What you can do now:</h3>
                
                <div class="feature">
                    <h4>📚 Explore Study Materials</h4>
                    <p>Browse through thousands of study materials shared by students from various universities and courses.</p>
                </div>
                
                <div class="feature">
                    <h4>📤 Share Your Knowledge</h4>
                    <p>Upload your notes, assignments, and study materials to help fellow students succeed.</p>
                </div>
                
                <div class="feature">
                    <h4>💫 Bookmark & Like</h4>
                    <p>Save useful materials to your bookmarks and like content that helps you study better.</p>
                </div>
                
                <div class="feature">
                    <h4>🔍 Smart Search</h4>
                    <p>Find exactly what you need with our advanced search and filtering options.</p>
                </div>
                
                <h3>📝 Quick Tips:</h3>
                <ul>
                    <li>Complete your profile for better material recommendations</li>
                    <li>Use descriptive titles and tags when uploading materials</li>
                    <li>Check out the most popular materials in your subjects</li>
                    <li>Join the community by liking and commenting on materials</li>
                </ul>
                
                <p>Happy studying! 📖✨</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Student Material Hub Team</p>
                <p>Need help? Visit our <a href="${process.env.CLIENT_URL}/help">Help Center</a> or contact support@studenthub.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate verification token
   */
  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = EmailService;