import { api } from './api.js';
import { saveTrip, saveModule, saveContent, saveAsset } from './storage.js';

export class DownloadManager {
  constructor() {
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }

  async downloadTrip(tripId) {
    try {
      let totalItems = 0;
      let completedItems = 0;

      const updateProgress = (message, step) => {
        if (this.onProgress) {
          this.onProgress({
            completed: completedItems,
            total: totalItems,
            percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
            message,
            step
          });
        }
      };

      // Step 1: Fetch trip data
      updateProgress('Fetching trip data...', 'trip');
      const tripResponse = await api.getTripWithContent(tripId);
      const tripData = tripResponse.data;

      // Count total items (trip + modules + contents + assets)
      totalItems = 1; // trip itself
      totalItems += tripData.modules?.length || 0;

      tripData.modules?.forEach(module => {
        totalItems += module.contents?.length || 0;

        module.contents?.forEach(content => {
          if (content.type === 'image' && content.imageUrl) totalItems++;
          if (content.type === 'audio' && content.audioUrl) totalItems++;
        });
      });

      // Step 2: Save trip
      updateProgress('Saving trip data...', 'trip');
      await saveTrip(tripData);
      completedItems++;
      updateProgress('Trip data saved', 'trip');

      // Step 3: Download modules
      if (tripData.modules && tripData.modules.length > 0) {
        for (const module of tripData.modules) {
          updateProgress(`Saving module: ${module.title}`, 'module');
          await saveModule({
            ...module,
            tripId: tripData.id
          });
          completedItems++;
          updateProgress(`Module saved: ${module.title}`, 'module');

          // Step 4: Download contents
          if (module.contents && module.contents.length > 0) {
            for (const content of module.contents) {
              updateProgress(`Saving content: ${content.title}`, 'content');
              await saveContent({
                ...content,
                moduleId: module.id
              });
              completedItems++;
              updateProgress(`Content saved: ${content.title}`, 'content');

              // Step 5: Download assets
              if (content.type === 'image' && content.imageUrl) {
                updateProgress(`Downloading image: ${content.title}`, 'asset');
                await this.downloadAsset(content.imageUrl, content.id, 'image');
                completedItems++;
                updateProgress(`Image downloaded: ${content.title}`, 'asset');
              }

              if (content.type === 'audio' && content.audioUrl) {
                updateProgress(`Downloading audio: ${content.title}`, 'asset');
                await this.downloadAsset(content.audioUrl, content.id, 'audio');
                completedItems++;
                updateProgress(`Audio downloaded: ${content.title}`, 'asset');
              }
            }
          }
        }
      }

      updateProgress('Download complete!', 'complete');

      if (this.onComplete) {
        this.onComplete(tripData);
      }

      return tripData;
    } catch (error) {
      console.error('Download failed:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  async downloadAsset(url, contentId, type) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download asset: ${response.statusText}`);
      }

      const blob = await response.blob();
      await saveAsset(url, blob, contentId, type);

      return blob;
    } catch (error) {
      console.error('Asset download failed:', url, error);
      throw error;
    }
  }

  async downloadMultipleTrips(tripIds) {
    const results = [];

    for (let i = 0; i < tripIds.length; i++) {
      const tripId = tripIds[i];

      try {
        const result = await this.downloadTrip(tripId);
        results.push({ tripId, success: true, data: result });
      } catch (error) {
        results.push({ tripId, success: false, error: error.message });
      }
    }

    return results;
  }
}

export async function estimateDownloadSize(tripId) {
  try {
    const response = await api.getTripWithContent(tripId);
    const tripData = response.data;

    let estimatedSize = 0;
    let itemCount = 0;

    // Rough estimates
    estimatedSize += 50 * 1024; // 50KB for trip data
    itemCount += 1;

    if (tripData.modules) {
      tripData.modules.forEach(module => {
        estimatedSize += 20 * 1024; // 20KB per module
        itemCount += 1;

        if (module.contents) {
          module.contents.forEach(content => {
            estimatedSize += 10 * 1024; // 10KB per content
            itemCount += 1;

            // Asset estimates
            if (content.type === 'image') {
              estimatedSize += 500 * 1024; // 500KB per image
              itemCount += 1;
            }
            if (content.type === 'audio') {
              estimatedSize += 2 * 1024 * 1024; // 2MB per audio file
              itemCount += 1;
            }
          });
        }
      });
    }

    return {
      size: estimatedSize,
      sizeFormatted: formatBytes(estimatedSize),
      itemCount
    };
  } catch (error) {
    console.error('Failed to estimate download size:', error);
    return {
      size: 0,
      sizeFormatted: '0 B',
      itemCount: 0
    };
  }
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
