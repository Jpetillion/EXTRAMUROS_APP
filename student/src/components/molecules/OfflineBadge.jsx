import { Badge } from '../atoms/Badge.jsx';
import { Icon } from '../atoms/Icon.jsx';
import { useOfflineContext } from '../../context/OfflineContext.jsx';
import './OfflineBadge.css';

export function OfflineBadge() {
  const { isOnline, isSyncing } = useOfflineContext();

  if (isOnline && !isSyncing) {
    return null;
  }

  return (
    <div className="offline-badge">
      {isSyncing ? (
        <Badge variant="info" size="small">
          <Icon name="sync" size="small" />
          {' '}
          Syncing...
        </Badge>
      ) : (
        <Badge variant="offline" size="small">
          <Icon name="offline" size="small" />
          {' '}
          Offline
        </Badge>
      )}
    </div>
  );
}
