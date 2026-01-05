import { Badge } from '../atoms/Badge.jsx';
import { getContentTypeLabel } from '../../utils/helpers.js';
import './ContentCard.css';

export function ContentCard({
  content,
  onClick,
  completed = false
}) {
  const typeIcon = {
    text: '📝',
    image: '🖼️',
    audio: '🎵',
    location: '📍',
    schedule: '📅',
    activity: '✓'
  };

  return (
    <div
      className={`content-card ${completed ? 'content-card--completed' : ''}`}
      onClick={onClick}
    >
      <div className="content-card__icon">
        {typeIcon[content.type] || '📄'}
      </div>

      <div className="content-card__content">
        <h4 className="content-card__title">{content.title}</h4>
        {content.description && (
          <p className="content-card__description">{content.description}</p>
        )}
        <Badge variant="info" size="small">
          {getContentTypeLabel(content.type)}
        </Badge>
      </div>

      {completed && (
        <div className="content-card__check">✓</div>
      )}
    </div>
  );
}
