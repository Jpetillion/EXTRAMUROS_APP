import { useState, useEffect } from 'react';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import styles from './TripForm.module.css';

const TripForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    published: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        published: initialData.published ?? 0,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const statusOptions = [
    { value: 0, label: 'Draft' },
    { value: 1, label: 'Published' },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Enter trip title"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Enter trip description"
        rows={5}
      />

      {/* Only show status dropdown when editing existing trip */}
      {initialData && (
        <FormField
          label="Status"
          name="published"
          type="select"
          value={formData.published}
          onChange={handleChange}
          options={statusOptions}
          required
        />
      )}

      <div className={styles.formActions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
