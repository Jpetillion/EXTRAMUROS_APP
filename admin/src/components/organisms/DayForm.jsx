import { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import styles from './DayForm.module.css';

const DayForm = ({ day, onSave, onCancel, isLoading, dayNumber }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dayNumber: dayNumber || 1,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (day) {
      setFormData({
        title: day.title || '',
        description: day.description || '',
        dayNumber: day.day_number || day.dayNumber || 1,
      });
    } else if (dayNumber) {
      setFormData((prev) => ({
        ...prev,
        title: `Dag ${dayNumber}`,
        dayNumber,
      }));
    }
  }, [day, dayNumber]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.dayNumber || formData.dayNumber < 1) {
      newErrors.dayNumber = 'Day number must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fields}>
        <FormField
          label="Day Number"
          type="number"
          value={formData.dayNumber}
          onChange={(e) => handleChange('dayNumber', parseInt(e.target.value))}
          error={errors.dayNumber}
          required
          min="1"
        />

        <FormField
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="e.g., Dag 1, Woensdag, Aankomst"
          required
        />

        <FormField
          label="Description (optional)"
          type="textarea"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Beschrijving van deze dag..."
          rows={3}
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {day ? 'Update Day' : 'Create Day'}
        </Button>
      </div>
    </form>
  );
};

export default DayForm;
