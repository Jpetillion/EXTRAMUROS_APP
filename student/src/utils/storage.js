import { openDB } from 'idb';

const DB_NAME = 'extra-muros-db';
const DB_VERSION = 1;

const STORES = {
  TRIPS: 'trips',
  MODULES: 'modules',
  CONTENTS: 'contents',
  ASSETS: 'assets',
  PROGRESS: 'progress',
  SETTINGS: 'settings'
};

let dbInstance = null;

export async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Trips store
      if (!db.objectStoreNames.contains(STORES.TRIPS)) {
        const tripStore = db.createObjectStore(STORES.TRIPS, { keyPath: 'id' });
        tripStore.createIndex('downloadedAt', 'downloadedAt');
        tripStore.createIndex('isDownloaded', 'isDownloaded');
      }

      // Modules store
      if (!db.objectStoreNames.contains(STORES.MODULES)) {
        const moduleStore = db.createObjectStore(STORES.MODULES, { keyPath: 'id' });
        moduleStore.createIndex('tripId', 'tripId');
        moduleStore.createIndex('order', 'order');
      }

      // Contents store
      if (!db.objectStoreNames.contains(STORES.CONTENTS)) {
        const contentStore = db.createObjectStore(STORES.CONTENTS, { keyPath: 'id' });
        contentStore.createIndex('moduleId', 'moduleId');
        contentStore.createIndex('type', 'type');
        contentStore.createIndex('order', 'order');
      }

      // Assets store (images, audio files)
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        const assetStore = db.createObjectStore(STORES.ASSETS, { keyPath: 'url' });
        assetStore.createIndex('contentId', 'contentId');
        assetStore.createIndex('type', 'type');
      }

      // Progress store
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'id' });
        progressStore.createIndex('contentId', 'contentId');
        progressStore.createIndex('completed', 'completed');
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    }
  });

  return dbInstance;
}

export async function getDB() {
  if (!dbInstance) {
    await initDB();
  }
  return dbInstance;
}

// Trip operations
export async function saveTrip(trip) {
  const db = await getDB();
  return db.put(STORES.TRIPS, {
    ...trip,
    isDownloaded: true,
    downloadedAt: new Date().toISOString()
  });
}

export async function getTrip(tripId) {
  const db = await getDB();
  return db.get(STORES.TRIPS, tripId);
}

export async function getAllTrips() {
  const db = await getDB();
  return db.getAll(STORES.TRIPS);
}

export async function deleteTrip(tripId) {
  const db = await getDB();
  const tx = db.transaction([STORES.TRIPS, STORES.MODULES, STORES.CONTENTS, STORES.ASSETS], 'readwrite');

  // Delete trip
  await tx.objectStore(STORES.TRIPS).delete(tripId);

  // Delete related modules
  const moduleIndex = tx.objectStore(STORES.MODULES).index('tripId');
  const modules = await moduleIndex.getAll(tripId);

  for (const module of modules) {
    await tx.objectStore(STORES.MODULES).delete(module.id);

    // Delete related contents
    const contentIndex = tx.objectStore(STORES.CONTENTS).index('moduleId');
    const contents = await contentIndex.getAll(module.id);

    for (const content of contents) {
      await tx.objectStore(STORES.CONTENTS).delete(content.id);

      // Delete related assets
      const assetIndex = tx.objectStore(STORES.ASSETS).index('contentId');
      const assets = await assetIndex.getAll(content.id);

      for (const asset of assets) {
        await tx.objectStore(STORES.ASSETS).delete(asset.url);
      }
    }
  }

  await tx.done;
}

// Module operations
export async function saveModule(module) {
  const db = await getDB();
  return db.put(STORES.MODULES, module);
}

export async function getModule(moduleId) {
  const db = await getDB();
  return db.get(STORES.MODULES, moduleId);
}

export async function getModulesByTrip(tripId) {
  const db = await getDB();
  const index = db.transaction(STORES.MODULES).store.index('tripId');
  return index.getAll(tripId);
}

// Content operations
export async function saveContent(content) {
  const db = await getDB();
  return db.put(STORES.CONTENTS, content);
}

export async function getContent(contentId) {
  const db = await getDB();
  return db.get(STORES.CONTENTS, contentId);
}

export async function getContentsByModule(moduleId) {
  const db = await getDB();
  const index = db.transaction(STORES.CONTENTS).store.index('moduleId');
  return index.getAll(moduleId);
}

// Asset operations
export async function saveAsset(url, blob, contentId, type) {
  const db = await getDB();
  return db.put(STORES.ASSETS, {
    url,
    blob,
    contentId,
    type,
    savedAt: new Date().toISOString()
  });
}

export async function getAsset(url) {
  const db = await getDB();
  return db.get(STORES.ASSETS, url);
}

export async function getAssetsByContent(contentId) {
  const db = await getDB();
  const index = db.transaction(STORES.ASSETS).store.index('contentId');
  return index.getAll(contentId);
}

// Progress operations
export async function saveProgress(progress) {
  const db = await getDB();
  return db.put(STORES.PROGRESS, {
    ...progress,
    updatedAt: new Date().toISOString()
  });
}

export async function getProgress(contentId) {
  const db = await getDB();
  const allProgress = await db.getAll(STORES.PROGRESS);
  return allProgress.find(p => p.contentId === contentId);
}

export async function getAllProgress() {
  const db = await getDB();
  return db.getAll(STORES.PROGRESS);
}

// Settings operations
export async function saveSetting(key, value) {
  const db = await getDB();
  return db.put(STORES.SETTINGS, { key, value });
}

export async function getSetting(key) {
  const db = await getDB();
  const setting = await db.get(STORES.SETTINGS, key);
  return setting?.value;
}

// Utility functions
export async function clearAllData() {
  const db = await getDB();
  const tx = db.transaction(Object.values(STORES), 'readwrite');

  for (const store of Object.values(STORES)) {
    await tx.objectStore(store).clear();
  }

  await tx.done;
}

export async function getStorageSize() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: (estimate.usage / estimate.quota) * 100
    };
  }
  return null;
}
