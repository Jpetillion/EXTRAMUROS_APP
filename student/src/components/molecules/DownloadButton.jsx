import { Button } from '../atoms/Button.jsx';
import { Icon } from '../atoms/Icon.jsx';
import { ProgressBar } from '../atoms/ProgressBar.jsx';
import { Spinner } from '../atoms/Spinner.jsx';
import './DownloadButton.css';

export function DownloadButton({
  tripId,
  isDownloading,
  downloadProgress,
  onDownload,
  onCancel
}) {
  if (isDownloading && downloadProgress) {
    return (
      <div className="download-button">
        <div className="download-button__progress">
          <ProgressBar
            value={downloadProgress.percentage}
            max={100}
            variant="primary"
            showLabel={true}
            label={`${Math.round(downloadProgress.percentage)}%`}
          />
          <p className="download-button__message">{downloadProgress.message}</p>
          <div className="download-button__details">
            <span>{downloadProgress.completed} / {downloadProgress.total} items</span>
          </div>
        </div>
        {onCancel && (
          <Button
            variant="secondary"
            size="small"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    );
  }

  if (isDownloading) {
    return (
      <div className="download-button">
        <Button
          variant="primary"
          disabled={true}
          icon={<Spinner size="small" variant="white" />}
        >
          Downloading...
        </Button>
      </div>
    );
  }

  return (
    <div className="download-button">
      <Button
        variant="primary"
        onClick={() => onDownload(tripId)}
      >
        <Icon name="download" size="medium" />
        {' '}
        Download Trip
      </Button>
    </div>
  );
}
