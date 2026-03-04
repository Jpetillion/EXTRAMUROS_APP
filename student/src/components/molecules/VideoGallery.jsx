import { Icon } from '../atoms/Icon';
import './VideoGallery.css';

export function VideoGallery({ videos }) {
  if (!videos || videos.length === 0) {
    return null;
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube (watch, embed, youtu.be, shorts)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('embed')) {
      return url;
    }

    return null;
  };

  return (
    <div className="video-gallery">
      <div className="video-gallery__header">
        <Icon name="video" size="small" />
        <h4 className="video-gallery__title">Videos ({videos.length})</h4>
      </div>

      <div className="video-gallery__grid">
        {videos.map((video, index) => {
          const embedUrl = getEmbedUrl(video.video_url || video.videoUrl || video.url);

          return (
            <div key={video.id || index} className="video-gallery__item">
              {video.title && (
                <div className="video-gallery__item-title">{video.title}</div>
              )}

              {embedUrl ? (
                <div className="video-gallery__embed">
                  <iframe
                    src={embedUrl}
                    title={video.title || `Video ${index + 1}`}
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="video-gallery__error">
                  <Icon name="warning" size="medium" />
                  <p>Video niet beschikbaar</p>
                  {video.video_url && (
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-gallery__link"
                    >
                      Open in nieuw venster
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
