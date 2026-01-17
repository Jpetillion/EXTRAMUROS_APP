import express from 'express';
import { getUserById, updateUser } from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  generateMfaSecret,
  verifyMfaToken,
  hashBackupCodes,
  verifyBackupCode
} from '../utils/mfa.js';

const router = express.Router();

// Temporary storage for pending MFA setups (in production, use Redis)
const pendingSetups = new Map();

// ============= MFA SETUP ROUTES =============

// Generate MFA secret and QR code (admin/teacher only)
router.post('/setup/generate', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is already enabled' });
    }

    // Generate secret and QR code
    const { secret, otpAuthUrl, backupCodes } = await generateMfaSecret(user.email);

    // Store temporarily (expires in 10 minutes)
    pendingSetups.set(req.user.id, {
      secret,
      backupCodes,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Clean up expired setups
    setTimeout(() => {
      const setup = pendingSetups.get(req.user.id);
      if (setup && Date.now() > setup.expiresAt) {
        pendingSetups.delete(req.user.id);
      }
    }, 10 * 60 * 1000);

    res.json({
      otpAuthUrl,
      secret, // Also return as text for manual entry
      backupCodes // Show once, user must save them
    });
  } catch (error) {
    console.error('Generate MFA secret error:', error);
    res.status(500).json({ error: 'Failed to generate MFA secret' });
  }
});

// Verify setup and enable MFA
router.post('/setup/verify', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || token.length !== 6) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const setup = pendingSetups.get(req.user.id);

    if (!setup) {
      return res.status(400).json({ error: 'No pending MFA setup found. Please generate a new secret.' });
    }

    if (Date.now() > setup.expiresAt) {
      pendingSetups.delete(req.user.id);
      return res.status(400).json({ error: 'Setup expired. Please start again.' });
    }

    // Verify the token
    const isValid = verifyMfaToken(setup.secret, token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Hash backup codes
    const hashedBackupCodes = await hashBackupCodes(setup.backupCodes);

    // Enable MFA for user
    await updateUser(req.user.id, {
      mfa_enabled: 1,
      mfa_secret: setup.secret, // In production, encrypt this
      mfa_backup_codes: JSON.stringify(hashedBackupCodes)
    });

    // Clean up pending setup
    pendingSetups.delete(req.user.id);

    res.json({
      message: 'MFA enabled successfully',
      mfaEnabled: true
    });
  } catch (error) {
    console.error('Verify MFA setup error:', error);
    res.status(500).json({ error: 'Failed to enable MFA' });
  }
});

// ============= MFA VERIFICATION ROUTES (during login) =============

// Verify MFA token during login (handled in auth.js login route)
// This is just a utility endpoint for testing
router.post('/verify', async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token are required' });
    }

    const user = await getUserById(userId);

    if (!user || !user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA not enabled for this user' });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      const hashedCodes = JSON.parse(user.mfa_backup_codes || '[]');
      const matchedIndex = await verifyBackupCode(token, hashedCodes);

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
      isValid = verifyMfaToken(user.mfa_secret, token);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify MFA token error:', error);
    res.status(500).json({ error: 'Failed to verify MFA token' });
  }
});

// ============= MFA MANAGEMENT ROUTES =============

// Disable MFA (requires password confirmation)
router.post('/disable', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to disable MFA' });
    }

    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is not enabled' });
    }

    // Verify password
    const bcrypt = await import('bcrypt');
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Disable MFA
    await updateUser(req.user.id, {
      mfa_enabled: 0,
      mfa_secret: null,
      mfa_backup_codes: null
    });

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

// Get MFA status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const backupCodesCount = user.mfa_backup_codes
      ? JSON.parse(user.mfa_backup_codes).length
      : 0;

    res.json({
      enabled: Boolean(user.mfa_enabled),
      backupCodesRemaining: backupCodesCount
    });
  } catch (error) {
    console.error('Get MFA status error:', error);
    res.status(500).json({ error: 'Failed to get MFA status' });
  }
});

// Regenerate backup codes (requires MFA verification)
router.post('/backup-codes/regenerate', authMiddleware, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'MFA token required' });
    }

    const user = await getUserById(req.user.id);

    if (!user || !user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA not enabled' });
    }

    // Verify current MFA token
    const isValid = verifyMfaToken(user.mfa_secret, token);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 8 }, () => {
      return Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 10)
      ).join('');
    });

    // Hash and save
    const hashedBackupCodes = await hashBackupCodes(backupCodes);
    await updateUser(req.user.id, {
      mfa_backup_codes: JSON.stringify(hashedBackupCodes)
    });

    res.json({
      backupCodes // Show once, user must save them
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
});

export default router;
