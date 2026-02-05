import { Badge } from '../atoms/Badge.jsx';
import { Icon } from '../atoms/Icon.jsx';
import { useOfflineContext } from '../../context/OfflineContext.jsx';
import './OfflineBadge.css';

export function OfflineBadge() {
  const { isOnline } = useOfflineContext();

  // Only show badge when offline
  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-badge">
      <Badge variant="offline" size="small">
        <Icon name="offline" size="small" />
        {' '}
        Offline
      </Badge>
    </div>
  );
}
