import { useState, useEffect } from 'react';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import styles from './ModuleForm.module.css';

const ModuleForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        order: initialData.order || 0,
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    }));
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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormField
        label="Module Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Enter module title"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        rows={3}
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Enter module description"
      />

      <FormField
        label="Order"
        name="order"
        type="number"
        value={formData.order}
        onChange={handleChange}
        helperText="Display order of this module"
        placeholder="0"
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Module' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};

export default ModuleForm;
