import { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import { MapPicker } from '../molecules/MapPicker';
import styles from './EventForm.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  try {
    // Remove whitespace
    url = url.trim();

    // If already an embed URL, return it
    if (url.includes('/embed/')) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    let videoId = null;

    // Format: https://www.youtube.com/watch?v=VIDEO_ID or http://youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch') || url.includes('www.youtube.com/watch')) {
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } catch (e) {
        // Try regex as fallback
        const match = url.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
      }
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/')[1];
      if (parts) {
        videoId = parts.split('?')[0].split('&')[0].split('/')[0];
      }
    }
    // Format: https://www.youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      const parts = url.split('/embed/')[1];
      if (parts) {
        videoId = parts.split('?')[0].split('&')[0].split('/')[0];
      }
    }
    // Format: https://www.youtube.com/shorts/VIDEO_ID
    else if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('/shorts/')[1];
      if (parts) {
        videoId = parts.split('?')[0].split('&')[0].split('/')[0];
      }
    }

    // Clean up video ID (remove any remaining special characters)
    if (videoId) {
      videoId = videoId.trim();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
    return null;
  }
};

const EventForm = ({ event, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    durationMinutes: '',
    textContent: '',
    lat: null,
    lng: null,
    address: '',
    videoUrl: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        category: event.category || '',
        durationMinutes: event.durationMinutes || event.duration_minutes || '',
        textContent: event.textContent || event.text_content || '',
        lat: event.lat || null,
        lng: event.lng || null,
        address: event.address || '',
        videoUrl: event.videoUrl || event.video_url || '',
      });

      // Set existing media previews if editing
      // Check multiple possible properties for image/audio existence
      const tripId = event.tripId || event.trip_id;
      if (tripId && (event.hasImage || event.imageBlob || event.image_blob)) {
        setImagePreview(`${API_BASE}/trips/${tripId}/events/${event.id}/image`);
      }
      if (tripId && (event.hasAudio || event.audioBlob || event.audio_blob)) {
        setAudioPreview(`${API_BASE}/trips/${tripId}/events/${event.id}/audio`);
      }
    }
  }, [event]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.durationMinutes && formData.durationMinutes < 0) {
      newErrors.durationMinutes = 'Duration must be positive';
    }

    // Validate image file if provided
    if (imageFile) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(imageFile.type)) {
        newErrors.image = 'Image must be JPEG, PNG, GIF, or WEBP';
      }
      if (imageFile.size > 10 * 1024 * 1024) {
        newErrors.image = 'Image must be less than 10MB';
      }
    }

    // Validate audio file if provided
    if (audioFile) {
      const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/wav'];
      if (!validAudioTypes.includes(audioFile.type)) {
        newErrors.audio = 'Audio must be MP3, M4A, or WAV';
      }
      if (audioFile.size > 20 * 1024 * 1024) {
        newErrors.audio = 'Audio must be less than 20MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLocationChange = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setAudioPreview(url);

      // Clear error
      if (errors.audio) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.audio;
          return newErrors;
        });
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const removeAudio = () => {
    setAudioFile(null);
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // Create FormData for multipart upload
      const submitData = new FormData();

      // Add text fields
      submitData.append('title', formData.title);
      submitData.append('category', formData.category || '');
      submitData.append('durationMinutes', formData.durationMinutes || '');
      submitData.append('textContent', formData.textContent || '');
      submitData.append('lat', formData.lat !== null ? formData.lat : '');
      submitData.append('lng', formData.lng !== null ? formData.lng : '');
      submitData.append('address', formData.address || '');
      submitData.append('videoUrl', formData.videoUrl || '');

      // Add file fields
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      if (audioFile) {
        submitData.append('audio', audioFile);
      }

      onSave(submitData);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select category' },
    { value: 'Museum', label: 'Museum' },
    { value: 'Monument', label: 'Monument' },
    { value: 'Park', label: 'Park' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Activity', label: 'Activity' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Section 1: Basic Info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>

        <FormField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          placeholder="e.g., Louvre Museum"
        />

        <div className={styles.row}>
          <FormField
            label="Category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
          />

          <FormField
            label="Duration (minutes)"
            name="durationMinutes"
            type="number"
            value={formData.durationMinutes}
            onChange={handleChange}
            error={errors.durationMinutes}
            placeholder="60"
            min="0"
          />
        </div>

        <FormField
          label="Description"
          name="textContent"
          type="textarea"
          value={formData.textContent}
          onChange={handleChange}
          placeholder="Enter detailed information about this event..."
          rows={5}
        />
      </div>

      {/* Section 2: Location */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Location</h3>

        <div className={styles.mapContainer}>
          <MapPicker
            value={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null}
            onChange={handleLocationChange}
          />
        </div>

        <FormField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Rue de Rivoli, 75001 Paris, France"
        />
      </div>

      {/* Section 3: Media */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Media</h3>

        {/* Image Upload */}
        <div className={styles.mediaField}>
          <label className={styles.label}>Image</label>
          <div className={styles.fileInputContainer}>
            <input
              type="file"
              id="image"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <label htmlFor="image" className={styles.fileLabel}>
              <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose Image
            </label>
            {imageFile && <span className={styles.fileName}>{imageFile.name}</span>}
          </div>
          {errors.image && <span className={styles.errorText}>{errors.image}</span>}
          {imagePreview && (
            <div className={styles.preview}>
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              <button type="button" onClick={removeImage} className={styles.removeButton}>
                Remove
              </button>
            </div>
          )}
          <p className={styles.hint}>JPEG, PNG, GIF, or WEBP (max 10MB)</p>
        </div>

        {/* Audio Upload */}
        <div className={styles.mediaField}>
          <label className={styles.label}>Audio</label>
          <div className={styles.fileInputContainer}>
            <input
              type="file"
              id="audio"
              accept=".mp3,.m4a,.wav"
              onChange={handleAudioChange}
              className={styles.fileInput}
            />
            <label htmlFor="audio" className={styles.fileLabel}>
              <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Choose Audio
            </label>
            {audioFile && <span className={styles.fileName}>{audioFile.name}</span>}
          </div>
          {errors.audio && <span className={styles.errorText}>{errors.audio}</span>}
          {audioPreview && (
            <div className={styles.preview}>
              <audio controls className={styles.audioPreview}>
                <source src={audioPreview} />
                Your browser does not support audio playback.
              </audio>
              <button type="button" onClick={removeAudio} className={styles.removeButton}>
                Remove
              </button>
            </div>
          )}
          <p className={styles.hint}>MP3, M4A, or WAV (max 20MB)</p>
        </div>

        {/* Video URL */}
        <FormField
          label="Video URL (YouTube)"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {formData.videoUrl && getYouTubeEmbedUrl(formData.videoUrl) && (
          <div className={styles.preview}>
            <div className={styles.videoPreview}>
              <iframe
                src={getYouTubeEmbedUrl(formData.videoUrl)}
                title="Video preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className={styles.hint}>Preview will show in students' app</p>
          </div>
        )}
        {formData.videoUrl && !getYouTubeEmbedUrl(formData.videoUrl) && (
          <p className={styles.errorText}>Invalid YouTube URL. Use format: https://www.youtube.com/watch?v=VIDEO_ID</p>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
