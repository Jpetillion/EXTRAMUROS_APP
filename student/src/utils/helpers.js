export function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';

  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + '...';
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function createBlobUrl(blob) {
  return URL.createObjectURL(blob);
}

export function revokeBlobUrl(url) {
  URL.revokeObjectURL(url);
}

export function downloadFile(blob, filename) {
  const url = createBlobUrl(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  revokeBlobUrl(url);
}

export function getFileExtension(filename) {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
}

export function getContentTypeLabel(type) {
  const labels = {
    text: 'Text',
    image: 'Image',
    audio: 'Audio',
    location: 'Location',
    schedule: 'Schedule',
    activity: 'Activity'
  };

  return labels[type] || type;
}

export function getContentTypeIcon(type) {
  const icons = {
    text: '📝',
    image: '🖼️',
    audio: '🎵',
    location: '📍',
    schedule: '📅',
    activity: '✓'
  };

  return icons[type] || '📄';
}

export function sortByOrder(items) {
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

export function calculateProgress(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();

    if (!isPersisted) {
      const result = await navigator.storage.persist();
      console.log(`Persistent storage granted: ${result}`);
      return result;
    }

    return true;
  }

  return false;
}

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
}
