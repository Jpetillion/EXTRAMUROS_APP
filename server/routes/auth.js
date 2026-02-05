import express from 'express';
console.log('[AUTH ROUTE] Starting auth.js import');

import bcrypt from 'bcryptjs';
console.log('[AUTH ROUTE] Imported bcryptjs successfully');

import { getUserByEmail, getUserById } from '../models/db.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateTempToken, verifyTempToken, verifyMfaToken, verifyBackupCode } from '../utils/mfa.js';
import { updateUser } from '../models/db.js';

const router = express.Router();
console.log('[AUTH ROUTE] Router created');

// Temporary storage for MFA pending logins (in production, use Redis)
const pendingMfaLogins = new Map();

// Login (Step 1: Email + Password)
router.post('/login', async (req, res) => {
  console.log('[AUTH ROUTE /login] Login route hit!');
  try {
    const { email, password } = req.body;
    console.log('[AUTH ROUTE /login] Email:', email);

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
      // Generate temporary token (contains userId and expiry)
      const tempToken = generateTempToken(user.id);
      console.log('MFA is enabled, returning mfaRequired response');

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

    // Get user to verify MFA
    const user = await getUserById(userId);

    if (!user || !user.mfa_enabled) {
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

// Update profile (name)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ error: 'First name is required' });
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ error: 'Last name is required' });
    }

    await updateUser(req.user.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    const updatedUser = await getUserById(req.user.id);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      mfaEnabled: Boolean(updatedUser.mfa_enabled)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Verify current password
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await updateUser(req.user.id, {
      passwordHash: newPasswordHash
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

console.log('[AUTH ROUTE] Exporting router');
export default router;
