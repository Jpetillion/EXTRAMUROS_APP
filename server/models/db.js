import db from '../config/database.js';
import { randomUUID } from 'crypto';

// Users
export const createUser = async (email, passwordHash, role, firstName, lastName) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO users (id, email, password_hash, role, first_name, last_name)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, email, passwordHash, role, firstName, lastName]
  });
  return id;
};

export const getUserByEmail = async (email) => {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  return result.rows[0] || null;
};

export const getUserById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT id, email, role, first_name, last_name, created_at FROM users WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

// Trips
export const createTrip = async (title, description, destination, startDate, endDate, createdBy, coverImageUrl = null) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trips (id, title, description, destination, start_date, end_date, cover_image_url, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, title, description, destination, startDate, endDate, coverImageUrl, createdBy]
  });
  return id;
};

export const getAllTrips = async (publishedOnly = false) => {
  const sql = publishedOnly
    ? 'SELECT * FROM trips WHERE published = 1 ORDER BY start_date DESC'
    : 'SELECT * FROM trips ORDER BY created_at DESC';
  const result = await db.execute(sql);
  return result.rows;
};

export const getTripById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trips WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

export const updateTrip = async (id, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE trips SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTrip = async (id) => {
  await db.execute({
    sql: 'DELETE FROM trips WHERE id = ?',
    args: [id]
  });
};

export const publishTrip = async (id) => {
  await db.execute({
    sql: `UPDATE trips SET published = 1, manifest_version = manifest_version + 1, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args: [id]
  });
};

// Modules
export const createModule = async (tripId, title, description, orderIndex = 0, icon = null) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO modules (id, trip_id, title, description, order_index, icon)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, tripId, title, description, orderIndex, icon]
  });
  return id;
};

export const getModulesByTripId = async (tripId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM modules WHERE trip_id = ? ORDER BY order_index ASC',
    args: [tripId]
  });
  return result.rows;
};

export const getModuleById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT * FROM modules WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

export const updateModule = async (id, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE modules SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteModule = async (id) => {
  await db.execute({
    sql: 'DELETE FROM modules WHERE id = ?',
    args: [id]
  });
};

// Content Items
export const createContentItem = async (tripId, moduleId, type, title, body, mediaUrl, thumbnailUrl, metadata, orderIndex = 0) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO content_items (id, trip_id, module_id, type, title, body, media_url, thumbnail_url, metadata, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, tripId, moduleId, type, title, body, mediaUrl, thumbnailUrl, metadata, orderIndex]
  });
  return id;
};

export const getContentItemsByModuleId = async (moduleId, publishedOnly = false) => {
  const sql = publishedOnly
    ? 'SELECT * FROM content_items WHERE module_id = ? AND published = 1 ORDER BY order_index ASC'
    : 'SELECT * FROM content_items WHERE module_id = ? ORDER BY order_index ASC';
  const result = await db.execute({
    sql,
    args: [moduleId]
  });
  return result.rows;
};

export const getContentItemById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT * FROM content_items WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

export const updateContentItem = async (id, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE content_items SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteContentItem = async (id) => {
  await db.execute({
    sql: 'DELETE FROM content_items WHERE id = ?',
    args: [id]
  });
};

export const publishContentItem = async (id) => {
  await db.execute({
    sql: `UPDATE content_items SET published = 1, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args: [id]
  });
};

export const getPublishedContentByTripId = async (tripId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM content_items WHERE trip_id = ? AND published = 1 ORDER BY module_id, order_index',
    args: [tripId]
  });
  return result.rows;
};

// Manifests
export const createManifest = async (tripId, version, content, assetsCount) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO manifests (id, trip_id, version, content, assets_count)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, tripId, version, content, assetsCount]
  });
  return id;
};

export const getManifestByTripId = async (tripId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM manifests WHERE trip_id = ? ORDER BY version DESC LIMIT 1',
    args: [tripId]
  });
  return result.rows[0] || null;
};

// Student Downloads
export const recordDownload = async (userId, tripId, manifestVersion) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO student_downloads (id, user_id, trip_id, manifest_version)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id, trip_id) DO UPDATE SET
          manifest_version = ?,
          downloaded_at = strftime('%s', 'now')`,
    args: [id, userId, tripId, manifestVersion, manifestVersion]
  });
  return id;
};

export const getDownloadsByUserId = async (userId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM student_downloads WHERE user_id = ? ORDER BY downloaded_at DESC',
    args: [userId]
  });
  return result.rows;
};

// Stats
export const getDashboardStats = async () => {
  const safeCount = async (table) => {
    try {
      const result = await db.execute({ sql: `SELECT COUNT(*) AS n FROM ${table}` });
      return Number(result.rows?.[0]?.n ?? 0);
    } catch {
      return 0; // tabel bestaat niet (of andere fout) → dashboard blijft werken
    }
  };

  return {
    users: await safeCount('users'),
    trips: await safeCount('trips'),
    modules: await safeCount('modules'),
    contentItems: await safeCount('content_items'),
    manifests: await safeCount('manifests'),
    downloads: await safeCount('student_downloads'),
  };
};
