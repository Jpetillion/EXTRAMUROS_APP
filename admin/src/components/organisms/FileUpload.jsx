import { useState, useRef } from 'react';
import { uploadsAPI } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import { formatFileSize } from '../../utils/helpers';
import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';
import styles from './FileUpload.module.css';

const FileUpload = ({ label, type = 'image', onUploadSuccess, currentUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const fileInputRef = useRef(null);
  const { success, error } = useToast();

  const acceptedTypes = {
    image: '.jpg,.jpeg,.png,.gif,.webp',
    audio: '.mp3,.wav,.ogg,.m4a',
  };

  const maxSizes = {
    image: 5 * 1024 * 1024, // 5MB
    audio: 10 * 1024 * 1024, // 10MB
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizes[type]) {
      error(`File size must be less than ${formatFileSize(maxSizes[type])}`);
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setProgress(0);

      let response;
      if (type === 'image') {
        response = await uploadsAPI.uploadImage(file, (progressValue) => {
          setProgress(progressValue);
        });
      } else {
        response = await uploadsAPI.uploadAudio(file, (progressValue) => {
          setProgress(progressValue);
        });
      }

      const { url } = response.data;
      setPreviewUrl(url);
      onUploadSuccess(url);
      success(`${type === 'image' ? 'Image' : 'Audio'} uploaded successfully`);
    } catch (err) {
      console.error('Upload error:', err);
      error(err?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.fileUpload}>
      {label && <label className={styles.label}>{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes[type]}
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={uploading}
      />

      {!previewUrl && !uploading && (
        <div className={styles.uploadArea} onClick={handleButtonClick}>
          <div className={styles.uploadIcon}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className={styles.uploadText}>
            Click to upload or drag and drop
          </p>
          <p className={styles.uploadHint}>
            {type === 'image' ? 'JPG, PNG, GIF, WEBP' : 'MP3, WAV, OGG, M4A'} (max {formatFileSize(maxSizes[type])})
          </p>
        </div>
      )}

      {uploading && (
        <div className={styles.uploadingArea}>
          <Spinner size="large" />
          <p className={styles.progressText}>Uploading... {progress}%</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {previewUrl && !uploading && (
        <div className={styles.previewArea}>
          {type === 'image' ? (
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
          ) : (
            <div className={styles.audioPreview}>
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <audio controls src={previewUrl} className={styles.audioPlayer}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <div className={styles.previewActions}>
            <Button variant="danger" size="small" onClick={handleRemove}>
              Remove
            </Button>
            <Button variant="secondary" size="small" onClick={handleButtonClick}>
              Replace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
