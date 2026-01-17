import express from 'express';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserById } from '../models/db.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateTempToken, verifyTempToken, verifyMfaToken, verifyBackupCode } from '../utils/mfa.js';
import { updateUser } from '../models/db.js';

const router = express.Router();

// Temporary storage for MFA pending logins (in production, use Redis)
const pendingMfaLogins = new Map();

// Login (Step 1: Email + Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if MFA is enabled for admin/teacher
    console.log('User MFA check:', {
      role: user.role,
      mfa_enabled: user.mfa_enabled,
      mfa_enabled_type: typeof user.mfa_enabled,
      mfa_secret: user.mfa_secret ? 'exists' : 'null'
    });

    if ((user.role === 'admin' || user.role === 'teacher') && user.mfa_enabled === 1) {
      // Generate temporary token
      const tempToken = generateTempToken(user.id);
      console.log('MFA is enabled, returning mfaRequired response');

      // Store pending login (expires in 5 minutes)
      pendingMfaLogins.set(tempToken, {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      // Clean up expired logins
      setTimeout(() => {
        const pending = pendingMfaLogins.get(tempToken);
        if (pending && Date.now() > pending.expiresAt) {
          pendingMfaLogins.delete(tempToken);
        }
      }, 5 * 60 * 1000);

      return res.json({
        mfaRequired: true,
        tempToken
      });
    }

    // No MFA required (student or MFA not enabled)
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      mfaVerified: false // Not required for students
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        mfaEnabled: Boolean(user.mfa_enabled)
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Login (Step 2: MFA Verification)
router.post('/login/mfa', async (req, res) => {
  try {
    const { tempToken, code, isBackupCode } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Temporary token and code are required' });
    }

    // Verify temp token
    const userId = verifyTempToken(tempToken);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired temporary token' });
    }

    const pending = pendingMfaLogins.get(tempToken);

    if (!pending) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    if (Date.now() > pending.expiresAt) {
      pendingMfaLogins.delete(tempToken);
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    // Get user to verify MFA
    const user = await getUserById(userId);

    if (!user || !user.mfa_enabled) {
      pendingMfaLogins.delete(tempToken);
      return res.status(400).json({ error: 'MFA not enabled' });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      const hashedCodes = JSON.parse(user.mfa_backup_codes || '[]');
      const matchedIndex = await verifyBackupCode(code, hashedCodes);

      if (matchedIndex !== null) {
        isValid = true;

        // Remove used backup code
        hashedCodes.splice(matchedIndex, 1);
        await updateUser(userId, {
          mfa_backup_codes: JSON.stringify(hashedCodes)
        });
      }
    } else {
      // Verify TOTP token
      isValid = verifyMfaToken(user.mfa_secret, code);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // MFA verified - issue final JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      mfaVerified: true
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Clean up pending login
    pendingMfaLogins.delete(tempToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        mfaEnabled: true
      },
      token
    });
  } catch (error) {
    console.error('MFA login error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const backupCodesCount = user.mfa_backup_codes
      ? JSON.parse(user.mfa_backup_codes).length
      : 0;

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      mfaEnabled: Boolean(user.mfa_enabled),
      backupCodesRemaining: backupCodesCount
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
