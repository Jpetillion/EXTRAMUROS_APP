import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { formatDate } from '../utils/helpers';
import { usersAPI } from '../utils/api';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import ConfirmModal from '../components/molecules/ConfirmModal';
import FormField from '../components/molecules/FormField';
import styles from './Users.module.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { success, error: showError } = useToast();
  const { confirm, confirmState, handleClose } = useConfirm();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({ role: 'teacher' });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showError(err.response?.data?.error || err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (!isAdmin) {
      showError('Only admins can create teacher accounts');
      return;
    }
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      await usersAPI.create(formData);
      success('Teacher account created successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      showError(err.response?.data?.error || err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin) {
      showError('Only admins can delete teacher accounts');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Teacher Account',
      message: 'Are you sure you want to delete this teacher account? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await usersAPI.delete(userId);
      success('Teacher account deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      showError(err.response?.data?.error || err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.users}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage teacher accounts</p>
        </div>
        {isAdmin && <Button onClick={handleOpenModal}>Add Teacher</Button>}
      </div>

      {!isAdmin && (
        <Card className={styles.infoCard}>
          <p>You can view teachers but only admins can create or delete teacher accounts.</p>
        </Card>
      )}

      {users.length === 0 ? (
        <Card>
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3>No teachers yet</h3>
            <p>Get started by creating your first teacher account</p>
            {isAdmin && <Button onClick={handleOpenModal}>Add Teacher</Button>}
          </div>
        </Card>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={styles.tableRow}>
                  <td className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge variant="info">{user.role}</Badge>
                  </td>
                  <td className={styles.date}>
                    {formatDate(user.createdAt, 'short')}
                  </td>
                  {isAdmin && (
                    <td className={styles.actions}>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Teacher Account"
        size="small"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="teacher@school.be"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            placeholder="Min. 8 characters"
          />

          <FormField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
            placeholder="John"
          />

          <FormField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
            placeholder="Doe"
          />

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </div>
  );
};

export default Users;
