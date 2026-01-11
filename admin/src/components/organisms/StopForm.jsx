import { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import styles from './StopForm.module.css';

const StopForm = ({ stop, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    durationMinutes: '',
    difficulty: '',
    category: '',
    lat: '',
    lng: '',
    address: '',
    pictureUrl: '',
    audioUrl: '',
    videoUrl: '',
    ...stop,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (stop) {
      setFormData({
        title: stop.title || '',
        durationMinutes: stop.durationMinutes || '',
        difficulty: stop.difficulty || '',
        category: stop.category || '',
        lat: stop.lat || '',
        lng: stop.lng || '',
        address: stop.address || '',
        pictureUrl: stop.pictureUrl || '',
        audioUrl: stop.audioUrl || '',
        videoUrl: stop.videoUrl || '',
      });
    }
  }, [stop]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.lat && (formData.lat < -90 || formData.lat > 90)) {
      newErrors.lat = 'Latitude must be between -90 and 90';
    }

    if (formData.lng && (formData.lng < -180 || formData.lng > 180)) {
      newErrors.lng = 'Longitude must be between -180 and 180';
    }

    if (formData.durationMinutes && formData.durationMinutes < 0) {
      newErrors.durationMinutes = 'Duration must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Convert numeric fields
      const dataToSave = {
        ...formData,
        durationMinutes: formData.durationMinutes ? parseFloat(formData.durationMinutes) : null,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
      };
      onSave(dataToSave);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>

        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.input} ${errors.title ? styles.error : ''}`}
            placeholder="e.g., Louvre Museum"
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select category</option>
              <option value="Museum">Museum</option>
              <option value="Monument">Monument</option>
              <option value="Park">Park</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Hotel">Hotel</option>
              <option value="Activity">Activity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="difficulty" className={styles.label}>
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="durationMinutes" className={styles.label}>
              Duration (minutes)
            </label>
            <input
              type="number"
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              className={`${styles.input} ${errors.durationMinutes ? styles.error : ''}`}
              placeholder="60"
              min="0"
            />
            {errors.durationMinutes && (
              <span className={styles.errorText}>{errors.durationMinutes}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Location</h3>

        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={styles.input}
            placeholder="Rue de Rivoli, 75001 Paris, France"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="lat" className={styles.label}>
              Latitude
            </label>
            <input
              type="number"
              id="lat"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              className={`${styles.input} ${errors.lat ? styles.error : ''}`}
              placeholder="48.8606"
              step="any"
            />
            {errors.lat && <span className={styles.errorText}>{errors.lat}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lng" className={styles.label}>
              Longitude
            </label>
            <input
              type="number"
              id="lng"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              className={`${styles.input} ${errors.lng ? styles.error : ''}`}
              placeholder="2.3376"
              step="any"
            />
            {errors.lng && <span className={styles.errorText}>{errors.lng}</span>}
          </div>
        </div>

        <p className={styles.hint}>
          💡 Tip: Use <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer">latlong.net</a> to find coordinates
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Media URLs</h3>

        <div className={styles.formGroup}>
          <label htmlFor="pictureUrl" className={styles.label}>
            Picture URL
          </label>
          <input
            type="url"
            id="pictureUrl"
            name="pictureUrl"
            value={formData.pictureUrl}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="audioUrl" className={styles.label}>
            Audio URL
          </label>
          <input
            type="url"
            id="audioUrl"
            name="audioUrl"
            value={formData.audioUrl}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="videoUrl" className={styles.label}>
            Video URL
          </label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://..."
          />
        </div>

        <p className={styles.hint}>
          💡 Upload files first in the Upload section, then paste the URLs here
        </p>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {stop ? 'Update Stop' : 'Create Stop'}
        </Button>
      </div>
    </form>
  );
};

export default StopForm;
