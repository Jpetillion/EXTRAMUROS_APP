import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { ContentViewer } from '../components/organisms/ContentViewer.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { Spinner } from '../components/atoms/Spinner.jsx';
import { getContent, getAsset, saveProgress, getProgress } from '../utils/storage.js';
import { createBlobUrl } from '../utils/helpers.js';
import './ContentView.css';

export function ContentView() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [assetUrl, setAssetUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    loadContent();

    return () => {
      if (assetUrl) {
        URL.revokeObjectURL(assetUrl);
      }
    };
  }, [contentId]);

  const loadContent = async () => {
    try {
      setIsLoading(true);

      const contentData = await getContent(parseInt(contentId));
      if (!contentData) {
        throw new Error('Content not found');
      }

      setContent(contentData);

      // Load asset if needed
      let url = null;
      if (contentData.type === 'image' && contentData.imageUrl) {
        const asset = await getAsset(contentData.imageUrl);
        if (asset && asset.blob) {
          url = createBlobUrl(asset.blob);
          setAssetUrl(url);
        }
      } else if (contentData.type === 'audio' && contentData.audioUrl) {
        const asset = await getAsset(contentData.audioUrl);
        if (asset && asset.blob) {
          url = createBlobUrl(asset.blob);
          setAssetUrl(url);
        }
      }

      // Check if completed
      const progress = await getProgress(parseInt(contentId));
      setIsCompleted(progress?.completed || false);

    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await saveProgress({
        id: `progress-${contentId}`,
        contentId: parseInt(contentId),
        completed: true,
        completedAt: new Date().toISOString(),
        progress: 100
      });

      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to mark as complete:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="content-view">
        <Header title="Loading..." showBack={true} />
        <div className="content-view__loading">
          <Spinner size="large" variant="primary" />
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-view">
        <Header title="Content Not Found" showBack={true} />
        <div className="content-view__error">
          <p>Content not found. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-view">
      <Header title={content.title} showBack={true} />

      <div className="content-view__container">
        <ContentViewer content={content} assetUrl={assetUrl} />

        <div className="content-view__actions">
          {!isCompleted ? (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleMarkComplete}
            >
              <Icon name="check" size="medium" />
              {' '}
              Mark as Complete
            </Button>
          ) : (
            <Button
              variant="success"
              size="large"
              fullWidth
              disabled
            >
              <Icon name="success" size="medium" />
              {' '}
              Completed
            </Button>
          )}

          <Button
            variant="ghost"
            size="medium"
            fullWidth
            onClick={() => navigate(-1)}
          >
            <Icon name="back" size="medium" />
            {' '}
            Back to Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
