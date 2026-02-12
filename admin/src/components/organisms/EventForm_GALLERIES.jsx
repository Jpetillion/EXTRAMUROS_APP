import { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import { MapPicker } from '../molecules/MapPicker';
import { mediaAPI } from '../../utils/api';
import styles from './EventForm.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  try {
    url = url.trim();
    if (url.includes('/embed/')) return url;

    let videoId = null;
    if (url.includes('youtube.com/watch') || url.includes('www.youtube.com/watch')) {
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } catch (e) {
        const match = url.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
      }
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/')[1];
      if (parts) {
        videoId = parts.split('?')[0].split('&')[0].split('/')[0];
      }
    } else if (url.includes('youtube.com/embed/')) {
      const parts = url.split('/embed/')[1];
      if (parts) {
        videoId = parts.split('?')[0].split('&')[0].split('/')[0];
      }
    } else if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('/shorts/')[1];
      if (parts) {
        videoId = parts.split('?')[0].split('&')[0].split('/')[0];
      }
    }

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
    dayId: null,
  });

  // Gallery state
  const [photos, setPhotos] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Legacy single media (for events without gallery support yet)
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
        dayId: event.dayId || event.day_id || null,
      });

      // Load existing media for editing
      if (event.id) {
        loadExistingMedia(event.id);
      }

      // Legacy single media support
      const tripId = event.tripId || event.trip_id;
      if (tripId && (event.hasImage || event.imageBlob || event.image_blob)) {
        setImagePreview(`${API_BASE}/trips/${tripId}/events/${event.id}/image`);
      }
      if (tripId && (event.hasAudio || event.audioBlob || event.audio_blob)) {
        setAudioPreview(`${API_BASE}/trips/${tripId}/events/${event.id}/audio`);
      }
    }
  }, [event]);

  const loadExistingMedia = async (eventId) => {
    try {
      setLoadingMedia(true);

      // Load photos
      const photosRes = await mediaAPI.getPhotos(eventId);
      setPhotos(photosRes.data.map(p => ({
        id: p.id,
        title: p.title,
        preview: `${API_BASE}/events/${eventId}/photos/${p.id}`,
        orderIndex: p.order_index || p.orderIndex || 0,
        existing: true
      })));

      // Load audio
      const audioRes = await mediaAPI.getAudio(eventId);
      setAudioFiles(audioRes.data.map(a => ({
        id: a.id,
        title: a.title,
        preview: `${API_BASE}/events/${eventId}/audio/${a.id}`,
        duration: a.duration_seconds || a.durationSeconds,
        orderIndex: a.order_index || a.orderIndex || 0,
        existing: true
      })));

      // Load videos
      const videosRes = await mediaAPI.getVideos(eventId);
      setVideos(videosRes.data.map(v => ({
        id: v.id,
        title: v.title,
        url: v.video_url || v.videoUrl,
        thumbnail: v.thumbnail_url || v.thumbnailUrl,
        orderIndex: v.order_index || v.orderIndex || 0,
        existing: true
      })));

    } catch (err) {
      console.error('Failed to load existing media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Photo gallery handlers
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file, index) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      preview: URL.createObjectURL(file),
      orderIndex: photos.length + index,
      existing: false
    }));
    setPhotos([...photos, ...newPhotos]);
    e.target.value = ''; // Reset input
  };

  const handlePhotoTitleChange = (index, title) => {
    const updated = [...photos];
    updated[index].title = title;
    setPhotos(updated);
  };

  const handleRemovePhoto = async (index) => {
    const photo = photos[index];
    if (photo.existing && photo.id && event?.id) {
      try {
        await mediaAPI.deletePhoto(event.id, photo.id);
      } catch (err) {
        console.error('Failed to delete photo:', err);
        alert('Failed to delete photo');
        return;
      }
    }
    const updated = [...photos];
    if (updated[index].preview && !updated[index].existing) {
      URL.revokeObjectURL(updated[index].preview);
    }
    updated.splice(index, 1);
    setPhotos(updated);
  };

  // Audio gallery handlers
  const handleAddAudio = (e) => {
    const files = Array.from(e.target.files);
    const newAudio = files.map((file, index) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      preview: URL.createObjectURL(file),
      orderIndex: audioFiles.length + index,
      existing: false
    }));
    setAudioFiles([...audioFiles, ...newAudio]);
    e.target.value = '';
  };

  const handleAudioTitleChange = (index, title) => {
    const updated = [...audioFiles];
    updated[index].title = title;
    setAudioFiles(updated);
  };

  const handleRemoveAudio = async (index) => {
    const audio = audioFiles[index];
    if (audio.existing && audio.id && event?.id) {
      try {
        await mediaAPI.deleteAudio(event.id, audio.id);
      } catch (err) {
        console.error('Failed to delete audio:', err);
        alert('Failed to delete audio');
        return;
      }
    }
    const updated = [...audioFiles];
    if (updated[index].preview && !updated[index].existing) {
      URL.revokeObjectURL(updated[index].preview);
    }
    updated.splice(index, 1);
    setAudioFiles(updated);
  };

  // Video gallery handlers
  const handleAddVideo = () => {
    setVideos([...videos, {
      url: '',
      title: '',
      orderIndex: videos.length,
      existing: false,
      editing: true
    }]);
  };

  const handleVideoChange = (index, field, value) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };

  const handleSaveVideo = async (index) => {
    const video = videos[index];
    if (!video.url || !video.title) {
      alert('Please enter both URL and title');
      return;
    }
    if (!getYouTubeEmbedUrl(video.url)) {
      alert('Invalid YouTube URL');
      return;
    }

    if (event?.id && !video.existing) {
      try {
        const res = await mediaAPI.addVideo(event.id, {
          title: video.title,
          videoUrl: video.url,
          orderIndex: video.orderIndex
        });
        const updated = [...videos];
        updated[index] = { ...video, id: res.data.id, existing: true, editing: false };
        setVideos(updated);
      } catch (err) {
        console.error('Failed to save video:', err);
        alert('Failed to save video');
      }
    } else {
      const updated = [...videos];
      updated[index].editing = false;
      setVideos(updated);
    }
  };

  const handleEditVideo = (index) => {
    const updated = [...videos];
    updated[index].editing = true;
    setVideos(updated);
  };

  const handleRemoveVideo = async (index) => {
    const video = videos[index];
    if (video.existing && video.id && event?.id) {
      try {
        await mediaAPI.deleteVideo(event.id, video.id);
      } catch (err) {
        console.error('Failed to delete video:', err);
        alert('Failed to delete video');
        return;
      }
    }
    const updated = [...videos];
    updated.splice(index, 1);
    setVideos(updated);
  };

  // Legacy handlers for single media
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
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
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
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

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.durationMinutes && formData.durationMinutes < 0) {
      newErrors.durationMinutes = 'Duration must be positive';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Create FormData for basic event info + legacy single media
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('category', formData.category || '');
    submitData.append('durationMinutes', formData.durationMinutes || '');
    submitData.append('textContent', formData.textContent || '');
    submitData.append('lat', formData.lat !== null ? formData.lat : '');
    submitData.append('lng', formData.lng !== null ? formData.lng : '');
    submitData.append('address', formData.address || '');
    if (formData.dayId) {
      submitData.append('dayId', formData.dayId);
    }

    // Legacy single media
    if (imageFile) {
      submitData.append('image', imageFile);
    }
    if (audioFile) {
      submitData.append('audio', audioFile);
    }

    // For new events, we need to save the event first, then upload media
    // For existing events, we can upload media in parallel

    try {
      // Save the basic event
      const savedEvent = await onSave(submitData);
      const eventId = savedEvent?.id || event?.id;

      if (!eventId) {
        console.error('No event ID available for media upload');
        return;
      }

      // Upload new photos
      const photoPromises = photos
        .filter(p => !p.existing && p.file)
        .map((p, index) =>
          mediaAPI.uploadPhoto(eventId, p.file, p.title, p.orderIndex)
        );

      // Upload new audio
      const audioPromises = audioFiles
        .filter(a => !a.existing && a.file)
        .map((a, index) =>
          mediaAPI.uploadAudio(eventId, a.file, a.title, a.orderIndex)
        );

      // Save new videos
      const videoPromises = videos
        .filter(v => !v.existing && v.url && v.title)
        .map(v =>
          mediaAPI.addVideo(eventId, {
            title: v.title,
            videoUrl: v.url,
            orderIndex: v.orderIndex
          })
        );

      // Update titles of existing media if changed
      const updatePromises = [];
      photos.filter(p => p.existing && p.id).forEach(p => {
        updatePromises.push(
          mediaAPI.updatePhoto(eventId, p.id, { title: p.title, orderIndex: p.orderIndex })
        );
      });
      audioFiles.filter(a => a.existing && a.id).forEach(a => {
        updatePromises.push(
          mediaAPI.updateAudio(eventId, a.id, { title: a.title, orderIndex: a.orderIndex })
        );
      });
      videos.filter(v => v.existing && v.id).forEach(v => {
        updatePromises.push(
          mediaAPI.updateVideo(eventId, v.id, { title: v.title, videoUrl: v.url, orderIndex: v.orderIndex })
        );
      });

      await Promise.all([...photoPromises, ...audioPromises, ...videoPromises, ...updatePromises]);

    } catch (err) {
      console.error('Error saving event with media:', err);
      throw err;
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

      {/* Section 3: Media Galleries */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Media Galleries</h3>

        {/* Photo Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.galleryHeader}>
            <label className={styles.label}>Photos</label>
            <input
              type="file"
              id="photos"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              multiple
              onChange={handleAddPhotos}
              style={{ display: 'none' }}
            />
            <label htmlFor="photos" className={styles.addButton}>
              + Add Photos
            </label>
          </div>

          {photos.length > 0 ? (
            <div className={styles.photoGrid}>
              {photos.map((photo, index) => (
                <div key={index} className={styles.photoCard}>
                  <img src={photo.preview} alt={photo.title} className={styles.photoPreview} />
                  <input
                    type="text"
                    value={photo.title}
                    onChange={(e) => handlePhotoTitleChange(index, e.target.value)}
                    placeholder="Photo title..."
                    className={styles.mediaTitle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyGallery}>No photos yet. Click "Add Photos" to upload.</p>
          )}
        </div>

        {/* Audio Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.galleryHeader}>
            <label className={styles.label}>Audio Files</label>
            <input
              type="file"
              id="audio-files"
              accept=".mp3,.m4a,.wav"
              multiple
              onChange={handleAddAudio}
              style={{ display: 'none' }}
            />
            <label htmlFor="audio-files" className={styles.addButton}>
              + Add Audio
            </label>
          </div>

          {audioFiles.length > 0 ? (
            <div className={styles.audioList}>
              {audioFiles.map((audio, index) => (
                <div key={index} className={styles.audioCard}>
                  <audio controls className={styles.audioPlayer}>
                    <source src={audio.preview} />
                  </audio>
                  <input
                    type="text"
                    value={audio.title}
                    onChange={(e) => handleAudioTitleChange(index, e.target.value)}
                    placeholder="Audio title..."
                    className={styles.mediaTitle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAudio(index)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyGallery}>No audio files yet. Click "Add Audio" to upload.</p>
          )}
        </div>

        {/* Video Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.galleryHeader}>
            <label className={styles.label}>Videos (YouTube)</label>
            <button
              type="button"
              onClick={handleAddVideo}
              className={styles.addButton}
            >
              + Add Video
            </button>
          </div>

          {videos.length > 0 ? (
            <div className={styles.videoList}>
              {videos.map((video, index) => (
                <div key={index} className={styles.videoCard}>
                  {video.editing ? (
                    <>
                      <input
                        type="text"
                        value={video.url}
                        onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={styles.videoInput}
                      />
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                        placeholder="Video title..."
                        className={styles.mediaTitle}
                      />
                      <div className={styles.videoActions}>
                        <button
                          type="button"
                          onClick={() => handleSaveVideo(index)}
                          className={styles.saveButton}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(index)}
                          className={styles.deleteButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {getYouTubeEmbedUrl(video.url) && (
                        <div className={styles.videoPreview}>
                          <iframe
                            src={getYouTubeEmbedUrl(video.url)}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <p className={styles.videoTitle}>{video.title}</p>
                      <div className={styles.videoActions}>
                        <button
                          type="button"
                          onClick={() => handleEditVideo(index)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(index)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyGallery}>No videos yet. Click "Add Video" to add YouTube links.</p>
          )}
        </div>
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
