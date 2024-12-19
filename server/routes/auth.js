const express = require('express');
const router = express.Router();
const UserService = require('../services/user');
const logger = require('../utils/log');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts. Please try again later.' }
});

// Log route initialization
logger.info('Auth routes initialized');

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, isAdmin = false } = req.body;

    // Check if user already exists
    const existingUser = await UserService.getByEmail(email);
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ 
        error: 'A user with this email already exists' 
      });
    }

    // Create new user using UserService
    const user = await UserService.createUser({ 
      email, 
      password, 
      firstName,
      lastName,
      isAdmin 
    });

    // Generate JWT token for immediate login if user is active
    if (user.status === 'active') {
      const token = jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        config.jwt.secret,
        { expiresIn: config.jwt.expiration }
      );

      logger.info(`New user registered and activated: ${email} with isAdmin: ${user.isAdmin}`);
      res.status(201).json({
        message: 'User created successfully and activated.',
        token,
        isAdmin: user.isAdmin,
        status: user.status
      });
    } else {
      // For non-first users who need email verification
      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        template: 'email-verification',
        context: {
          verificationLink: `${config.clientUrl}/verify-email?token=${verificationToken}`
        }
      });

      logger.info(`New user registered: ${email} with isAdmin: ${user.isAdmin} - pending verification`);
      res.status(201).json({
        message: 'User created successfully. Please check your email to verify your account.',
        isAdmin: user.isAdmin,
        status: user.status
      });
    }
  } catch (error) {
    logger.error('Registration error:', error);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Internal server error during registration'
    });
  }
});

// Login route with rate limiting
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Log request details
    logger.debug('Login request received:', {
      email,
      hasPassword: !!password,
      passwordType: typeof password,
      passwordLength: password?.length,
      rememberMe,
      contentType: req.headers['content-type'],
      bodyKeys: Object.keys(req.body),
      body: JSON.stringify(req.body)
    });

    // Validate request body
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials:', {
        hasEmail: !!email,
        hasPassword: !!password,
        emailType: typeof email,
        passwordType: typeof password,
        body: JSON.stringify(req.body)
      });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate user
    const user = await UserService.authenticateWithPassword(email, password);
    
    if (!user) {
      logger.warn(`Login attempt failed - invalid credentials: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = await UserService.generateToken(user);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`User logged in successfully: ${email} with isAdmin: ${user.isAdmin}`);
    res.json({
      token,
      isAdmin: user.isAdmin,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      body: JSON.stringify(req.body)
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await UserService.findByEmailVerificationToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.status = 'active';
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserService.getByEmail(email);
    
    // Don't reveal if user exists
    if (!user) {
      return res.json({ message: 'If an account exists, you will receive a password reset email.' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      template: 'password-reset',
      context: {
        resetLink: `${config.clientUrl}/reset-password?token=${resetToken}`
      }
    });

    res.json({ message: 'If an account exists, you will receive a password reset email.' });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await UserService.findByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate all remember me tokens
    user.rememberMeTokens = [];
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove remember me token if provided
    const { rememberMeToken } = req.body;
    if (rememberMeToken) {
      user.rememberMeTokens = user.rememberMeTokens.filter(
        t => t.token !== rememberMeToken
      );
      await user.save();
    }

    logger.info('User logged out successfully');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserService.getByEmail(email);

    if (!user || user.emailVerified) {
      return res.json({ 
        message: 'If an unverified account exists, a new verification email will be sent.' 
      });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Verify your email',
      template: 'email-verification',
      context: {
        verificationLink: `${config.clientUrl}/verify-email?token=${verificationToken}`
      }
    });

    res.json({ 
      message: 'If an unverified account exists, a new verification email will be sent.' 
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;