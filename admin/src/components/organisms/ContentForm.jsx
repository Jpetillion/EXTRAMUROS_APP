import { useState, useEffect } from 'react';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import FileUpload from './FileUpload';
import styles from './ContentForm.module.css';

const ContentForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    type: 'text',
    title: '',
    content: '',
    mediaUrl: '',
    order: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'text',
        title: initialData.title || '',
        content: initialData.content || '',
        mediaUrl: initialData.mediaUrl || '',
        order: initialData.order || 0,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.type === 'text' && !formData.content.trim()) {
      newErrors.content = 'Content is required for text type';
    }

    if ((formData.type === 'image' || formData.type === 'audio') && !formData.mediaUrl.trim()) {
      newErrors.mediaUrl = `${formData.type === 'image' ? 'Image' : 'Audio'} URL is required`;
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

  const handleFileUpload = (url) => {
    setFormData((prev) => ({ ...prev, mediaUrl: url }));
    if (errors.mediaUrl) {
      setErrors((prev) => ({ ...prev, mediaUrl: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const contentTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' },
    { value: 'audio', label: 'Audio' },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormField
        label="Content Type"
        name="type"
        type="select"
        value={formData.type}
        onChange={handleChange}
        options={contentTypeOptions}
        required
      />

      <FormField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Enter content title"
      />

      {formData.type === 'text' && (
        <FormField
          label="Content"
          name="content"
          type="textarea"
          rows={6}
          value={formData.content}
          onChange={handleChange}
          error={errors.content}
          required
          placeholder="Enter text content"
        />
      )}

      {formData.type === 'image' && (
        <>
          <FileUpload
            label="Upload Image"
            type="image"
            onUploadSuccess={handleFileUpload}
            currentUrl={formData.mediaUrl}
          />
          {errors.mediaUrl && <span className={styles.error}>{errors.mediaUrl}</span>}
        </>
      )}

      {formData.type === 'audio' && (
        <>
          <FileUpload
            label="Upload Audio"
            type="audio"
            onUploadSuccess={handleFileUpload}
            currentUrl={formData.mediaUrl}
          />
          {errors.mediaUrl && <span className={styles.error}>{errors.mediaUrl}</span>}
        </>
      )}

      <FormField
        label="Order"
        name="order"
        type="number"
        value={formData.order}
        onChange={handleChange}
        helperText="Display order of this content"
        placeholder="0"
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Content' : 'Create Content'}
        </Button>
      </div>
    </form>
  );
};

export default ContentForm;
