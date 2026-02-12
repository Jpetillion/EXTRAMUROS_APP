import { useState, useEffect } from 'react';
import { documentsAPI } from '../../utils/api';
import Button from '../atoms/Button';
import Card from '../molecules/Card';
import FormField from '../molecules/FormField';
import styles from './DocumentManager.module.css';

const DocumentManager = ({ tripId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, [tripId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsAPI.getAll(tripId);
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm((prev) => ({ ...prev, title: file.name }));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await documentsAPI.upload(tripId, selectedFile, uploadForm.title, uploadForm.description);
      setSelectedFile(null);
      setUploadForm({ title: '', description: '' });
      await fetchDocuments();
      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError(err.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentsAPI.getById(tripId, doc.id);
      const blob = new Blob([response.data], { type: doc.mime_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
      setError('Failed to download document');
    }
  };

  const handleDelete = async (docId, filename) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        setError(null);
        await documentsAPI.delete(tripId, docId);
        await fetchDocuments();
      } catch (err) {
        console.error('Failed to delete document:', err);
        setError(err.data?.error || 'Failed to delete document');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('text')) return '📃';
    return '📎';
  };

  if (loading) {
    return (
      <Card title="Private Documents">
        <div className={styles.loading}>Loading documents...</div>
      </Card>
    );
  }

  return (
    <Card
      title="Private Documents"
      subtitle="Only visible to teachers - Upload medical info, emergency contacts, etc."
    >
      {error && <div className={styles.error}>{error}</div>}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className={styles.uploadForm}>
        <div className={styles.fileInput}>
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            className={styles.hiddenInput}
          />
          <label htmlFor="file-input" className={styles.fileLabel}>
            <span className={styles.fileIcon}>📎</span>
            {selectedFile ? selectedFile.name : 'Choose file...'}
          </label>
          <span className={styles.fileHint}>PDF, DOC, DOCX, XLS, XLSX, TXT (max 50MB)</span>
        </div>

        {selectedFile && (
          <>
            <FormField
              label="Title (optional)"
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Document title..."
            />
            <FormField
              label="Description (optional)"
              type="textarea"
              value={uploadForm.description}
              onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add notes about this document..."
              rows={2}
            />
            <div className={styles.uploadActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadForm({ title: '', description: '' });
                  document.getElementById('file-input').value = '';
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={uploading}>
                Upload Document
              </Button>
            </div>
          </>
        )}
      </form>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📁</div>
          <h3>No documents yet</h3>
          <p>Upload private documents that are only visible to teachers.</p>
        </div>
      ) : (
        <div className={styles.documentsList}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.document}>
              <div className={styles.docIcon}>{getFileIcon(doc.mime_type)}</div>
              <div className={styles.docInfo}>
                <h4 className={styles.docTitle}>{doc.title || doc.filename}</h4>
                {doc.description && <p className={styles.docDescription}>{doc.description}</p>}
                <div className={styles.docMeta}>
                  <span>{doc.filename}</span>
                  <span>•</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at * 1000).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={styles.docActions}>
                <Button variant="secondary" size="sm" onClick={() => handleDownload(doc)}>
                  Download
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(doc.id, doc.title || doc.filename)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DocumentManager;
