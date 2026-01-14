import express from 'express';
import bcrypt from 'bcrypt';
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllTeachers,
  updateUserPhoneNumber
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validators.js';

const router = express.Router();

// Get all users (filtered by role)
router.get('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const role = req.query.role || null;

    // Teachers can only view, not create/delete
    const users = await getAllUsers(role);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create teacher account (admins only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const errors = validateRequired(['email', 'password', 'firstName', 'lastName'], req.body);
    if (errors) return res.status(400).json({ errors });

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with teacher role
    const userId = await createUser(email, passwordHash, 'teacher', firstName, lastName);
    const user = await getUserById(userId);

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);

    // Handle duplicate email
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user (admins only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    await deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user (phone number for now)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (phoneNumber !== undefined) {
      await updateUserPhoneNumber(req.params.id, phoneNumber);
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get all teachers (for assigning to trips)
router.get('/teachers/all', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const teachers = await getAllTeachers();
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

export default router;
