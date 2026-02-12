import express from 'express';
import bcrypt from 'bcrypt';
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllTeachers,
  updateUser,
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

// Create user account (admins only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const errors = validateRequired(['email', 'password', 'firstName', 'lastName', 'role'], req.body);
    if (errors) return res.status(400).json({ errors });

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Validate role
    if (!['admin', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or teacher' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with specified role
    const userId = await createUser(email, passwordHash, role, firstName, lastName);
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

    // Check if user has created any trips
    const tripsResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM trips WHERE created_by = ?',
      args: [req.params.id]
    });
    const tripCount = tripsResult.rows[0].count;

    if (tripCount > 0) {
      return res.status(400).json({
        error: `Cannot delete user who has created ${tripCount} trip(s). Please reassign or delete their trips first.`
      });
    }

    // Check if user has uploaded any documents
    const docsResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM trip_documents WHERE uploaded_by = ?',
      args: [req.params.id]
    });
    const docCount = docsResult.rows[0].count;

    if (docCount > 0) {
      return res.status(400).json({
        error: `Cannot delete user who has uploaded ${docCount} document(s). Please delete their documents first.`
      });
    }

    await deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);

    // Check if it's a foreign key constraint error
    if (error.message && (error.message.includes('FOREIGN KEY') || error.message.includes('constraint'))) {
      return res.status(400).json({
        error: 'Cannot delete user due to related content. Please contact support.'
      });
    }

    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// Update user (admins only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { phoneNumber, role, firstName, lastName } = req.body;

    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing your own role
    if (role !== undefined && user.id === req.user.id) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    // Validate role if provided
    if (role !== undefined && !['admin', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or teacher' });
    }

    const updates = {};
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (role !== undefined) updates.role = role;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;

    if (Object.keys(updates).length > 0) {
      await updateUser(req.params.id, updates);
    }

    const updatedUser = await getUserById(req.params.id);
    res.json(updatedUser);
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
