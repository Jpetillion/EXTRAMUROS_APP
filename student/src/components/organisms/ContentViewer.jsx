import { AudioPlayer } from '../molecules/AudioPlayer.jsx';
import { MapView } from './MapView.jsx';
import { Badge } from '../atoms/Badge.jsx';
import { formatDateTime } from '../../utils/helpers.js';
import './ContentViewer.css';

export function ContentViewer({ content, assetUrl }) {
  const renderContent = () => {
    switch (content.type) {
      case 'text':
        return (
          <div className="content-viewer__text">
            <p>{content.text}</p>
          </div>
        );

      case 'image':
        return (
          <div className="content-viewer__image">
            <img
              src={assetUrl || content.imageUrl}
              alt={content.title}
            />
            {content.caption && (
              <p className="content-viewer__caption">{content.caption}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="content-viewer__audio">
            <AudioPlayer
              src={assetUrl || content.audioUrl}
              title={content.title}
            />
            {content.transcript && (
              <div className="content-viewer__transcript">
                <h4>Transcript</h4>
                <p>{content.transcript}</p>
              </div>
            )}
          </div>
        );

      case 'location':
        return (
          <div className="content-viewer__location">
            {content.latitude && content.longitude && (
              <MapView
                latitude={content.latitude}
                longitude={content.longitude}
                title={content.title}
                description={content.locationDescription}
              />
            )}
            {content.locationDescription && (
              <div className="content-viewer__location-info">
                <p>{content.locationDescription}</p>
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="content-viewer__schedule">
            <div className="content-viewer__schedule-header">
              <Badge variant="info">Schedule</Badge>
              {content.scheduleDate && (
                <span className="content-viewer__schedule-date">
                  {formatDateTime(content.scheduleDate)}
                </span>
              )}
            </div>
            {content.scheduleItems && content.scheduleItems.length > 0 && (
              <ul className="content-viewer__schedule-list">
                {content.scheduleItems.map((item, index) => (
                  <li key={index} className="content-viewer__schedule-item">
                    <span className="content-viewer__schedule-time">
                      {item.time}
                    </span>
                    <span className="content-viewer__schedule-activity">
                      {item.activity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {content.notes && (
              <p className="content-viewer__schedule-notes">{content.notes}</p>
            )}
          </div>
        );

      case 'activity':
        return (
          <div className="content-viewer__activity">
            <Badge variant="primary">Activity</Badge>
            {content.instructions && (
              <div className="content-viewer__instructions">
                <h4>Instructions</h4>
                <p>{content.instructions}</p>
              </div>
            )}
            {content.tasks && content.tasks.length > 0 && (
              <div className="content-viewer__tasks">
                <h4>Tasks</h4>
                <ul>
                  {content.tasks.map((task, index) => (
                    <li key={index}>{task}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="content-viewer__unknown">
            <p>Content type not supported: {content.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="content-viewer">
      <div className="content-viewer__header">
        <h2 className="content-viewer__title">{content.title}</h2>
        {content.description && (
          <p className="content-viewer__description">{content.description}</p>
        )}
      </div>

      <div className="content-viewer__content">
        {renderContent()}
      </div>
    </div>
  );
}
