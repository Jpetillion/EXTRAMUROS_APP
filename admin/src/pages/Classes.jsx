import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { formatDate } from '../utils/helpers';
import { classesAPI } from '../utils/api';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import ConfirmModal from '../components/molecules/ConfirmModal';
import FormField from '../components/molecules/FormField';
import styles from './Classes.module.css';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { confirm, confirmState, handleClose } = useConfirm();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    schoolYear: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      showError('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    setFormData({ name: '', schoolYear: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || '',
      schoolYear: cls.schoolYear || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({ name: '', schoolYear: '' });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
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

      if (editingClass) {
        await classesAPI.update(editingClass.id, formData);
        success('Class updated successfully');
      } else {
        await classesAPI.create(formData);
        success('Class created successfully');
      }

      handleCloseModal();
      fetchClasses();
    } catch (err) {
      console.error('Failed to save class:', err);
      showError(err.response?.data?.error || err.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    const confirmed = await confirm({
      title: 'Delete Class',
      message: 'Are you sure you want to delete this class? This will also remove it from all assigned trips.',
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await classesAPI.delete(classId);
      success('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      console.error('Failed to delete class:', err);
      showError(err.response?.data?.error || err.message || 'Failed to delete class');
    }
  };

  const handleViewClass = (classId) => {
    navigate(`/classes/${classId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className={styles.classes}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Classes</h1>
          <p className={styles.subtitle}>Manage student classes and assign trips</p>
        </div>
        <Button onClick={handleCreateClass}>Create Class</Button>
      </div>

      {classes.length === 0 ? (
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
            <h3>No classes yet</h3>
            <p>Get started by creating your first class</p>
            <Button onClick={handleCreateClass}>Create Class</Button>
          </div>
        </Card>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>School Year</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className={styles.tableRow}>
                  <td className={styles.className}>{cls.name}</td>
                  <td>{cls.schoolYear || '-'}</td>
                  <td className={styles.date}>
                    {formatDate(cls.createdAt, 'short')}
                  </td>
                  <td className={styles.actions}>
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={() => handleViewClass(cls.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={() => handleEditClass(cls)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={() => handleDeleteClass(cls.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClass ? 'Edit Class' : 'Create New Class'}
        size="small"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., 3A, 5B, Grade 6"
          />

          <FormField
            label="School Year"
            name="schoolYear"
            value={formData.schoolYear}
            onChange={handleChange}
            placeholder="e.g., 2025-2026"
          />

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingClass ? 'Update Class' : 'Create Class'}
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

export default Classes;
