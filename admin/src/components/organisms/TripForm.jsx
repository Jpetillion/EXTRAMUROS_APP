import { useState, useEffect } from 'react';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import styles from './TripForm.module.css';

const TripForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    country: '',
    duration: '',
    difficulty: 'medium',
    category: '',
    status: 'draft',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        location: initialData.location || '',
        city: initialData.city || '',
        country: initialData.country || '',
        duration: initialData.duration || '',
        difficulty: initialData.difficulty || 'medium',
        category: initialData.category || '',
        status: initialData.status || 'draft',
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

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
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

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
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
        rows={4}
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Enter trip description"
      />

      <div className={styles.row}>
        <FormField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.location}
          required
          placeholder="e.g., Eiffel Tower"
        />

        <FormField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          required
          placeholder="e.g., Paris"
        />
      </div>

      <div className={styles.row}>
        <FormField
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          error={errors.country}
          required
          placeholder="e.g., France"
        />

        <FormField
          label="Duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          error={errors.duration}
          placeholder="e.g., 2 hours"
        />
      </div>

      <div className={styles.row}>
        <FormField
          label="Difficulty"
          name="difficulty"
          type="select"
          value={formData.difficulty}
          onChange={handleChange}
          options={difficultyOptions}
          placeholder="Select difficulty"
        />

        <FormField
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Cultural, Adventure"
        />
      </div>

      <FormField
        label="Status"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleChange}
        options={statusOptions}
        placeholder="Select status"
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
