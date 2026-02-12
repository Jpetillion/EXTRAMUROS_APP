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
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

export const getAllUsers = async (role = null) => {
  const sql = role
    ? 'SELECT id, email, role, first_name, last_name, created_at FROM users WHERE role = ? ORDER BY created_at DESC'
    : 'SELECT id, email, role, first_name, last_name, created_at FROM users ORDER BY created_at DESC';
  const result = role
    ? await db.execute({ sql, args: [role] })
    : await db.execute(sql);
  return result.rows;
};

export const updateUser = async (id, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case for database columns
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    args
  });
};

export const deleteUser = async (id) => {
  await db.execute({
    sql: 'DELETE FROM users WHERE id = ?',
    args: [id]
  });
};

// Trips (simplified - removed destination, dates)
export const createTrip = async (title, description, createdBy, coverImageBlob = null, coverImageMimeType = null) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trips (id, title, description, cover_image_blob, cover_image_mime_type, created_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, title, description, coverImageBlob, coverImageMimeType, createdBy]
  });
  return id;
};

export const getAllTrips = async (publishedOnly = false) => {
  const sql = publishedOnly
    ? 'SELECT * FROM trips WHERE published = 1 ORDER BY created_at DESC'
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

export const unpublishTrip = async (id) => {
  await db.execute({
    sql: `UPDATE trips SET published = 0, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args: [id]
  });
};

// Trip Events (renamed from trip_stops)
export const createTripEvent = async (tripId, eventData) => {
  const id = randomUUID();
  const {
    title,
    category = null,
    durationMinutes = null,
    textContent = null,
    lat = null,
    lng = null,
    address = null,
    imageBlob = null,
    imageMimeType = null,
    audioBlob = null,
    audioMimeType = null,
    videoUrl = null,
    orderIndex = 0,
    metadata = null,
    dayId = null
  } = eventData;

  await db.execute({
    sql: `INSERT INTO trip_events
          (id, trip_id, day_id, title, category, duration_minutes, text_content, lat, lng, address,
           image_blob, image_mime_type, audio_blob, audio_mime_type, video_url, order_index, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, tripId, dayId, title, category, durationMinutes, textContent, lat, lng, address,
      imageBlob, imageMimeType, audioBlob, audioMimeType, videoUrl, orderIndex, metadata
    ]
  });
  return id;
};

export const getTripEventsByTripId = async (tripId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_events WHERE trip_id = ? ORDER BY order_index ASC',
    args: [tripId]
  });
  return result.rows;
};

export const getTripEventById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_events WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

export const updateTripEvent = async (id, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case for database columns
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE trip_events SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTripEvent = async (id) => {
  await db.execute({
    sql: 'DELETE FROM trip_events WHERE id = ?',
    args: [id]
  });
};

// Classes
export const createClass = async (name, schoolYear, createdBy) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO classes (id, name, school_year, created_by)
          VALUES (?, ?, ?, ?)`,
    args: [id, name, schoolYear, createdBy]
  });
  return id;
};

export const getAllClasses = async () => {
  const result = await db.execute({
    sql: 'SELECT * FROM classes ORDER BY name ASC',
    args: []
  });
  return result.rows;
};

export const getClassById = async (id) => {
  const result = await db.execute({
    sql: 'SELECT * FROM classes WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
};

export const updateClass = async (id, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE classes SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteClass = async (id) => {
  await db.execute({
    sql: 'DELETE FROM classes WHERE id = ?',
    args: [id]
  });
};

// Trip-Class Associations
export const assignTripToClass = async (tripId, classId) => {
  const id = randomUUID();
  try {
    await db.execute({
      sql: `INSERT INTO trip_classes (id, trip_id, class_id)
            VALUES (?, ?, ?)`,
      args: [id, tripId, classId]
    });
    return id;
  } catch (error) {
    // Handle duplicate assignment (UNIQUE constraint)
    if (error.message && error.message.includes('UNIQUE')) {
      return null; // Already assigned
    }
    throw error;
  }
};

export const removeTripFromClass = async (tripId, classId) => {
  await db.execute({
    sql: 'DELETE FROM trip_classes WHERE trip_id = ? AND class_id = ?',
    args: [tripId, classId]
  });
};

export const getClassesByTripId = async (tripId) => {
  const result = await db.execute({
    sql: `SELECT c.* FROM classes c
          INNER JOIN trip_classes tc ON c.id = tc.class_id
          WHERE tc.trip_id = ?
          ORDER BY c.name ASC`,
    args: [tripId]
  });
  return result.rows;
};

export const getTripsByClassId = async (classId, publishedOnly = false) => {
  const sql = publishedOnly
    ? `SELECT t.* FROM trips t
       INNER JOIN trip_classes tc ON t.id = tc.trip_id
       WHERE tc.class_id = ? AND t.published = 1
       ORDER BY t.created_at DESC`
    : `SELECT t.* FROM trips t
       INNER JOIN trip_classes tc ON t.id = tc.trip_id
       WHERE tc.class_id = ?
       ORDER BY t.created_at DESC`;

  const result = await db.execute({
    sql,
    args: [classId]
  });
  return result.rows;
};

// Get trip with full nested content (events only, no modules)
export const getTripWithFullContent = async (tripId) => {
  // Get trip
  const trip = await getTripById(tripId);
  if (!trip) return null;

  // Get events
  const events = await getTripEventsByTripId(tripId);

  // Get assigned classes
  const classes = await getClassesByTripId(tripId);

  return {
    ...trip,
    events,
    classes
  };
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

// Student Progress (email-based, no authentication)
export const saveStudentProgress = async (email, tripId, eventId, classId, completed, progressData = null) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO student_progress (id, email, trip_id, event_id, class_id, completed, progress_data)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
          completed = ?,
          progress_data = ?,
          last_accessed_at = strftime('%s', 'now')`,
    args: [id, email, tripId, eventId, classId, completed, progressData, completed, progressData]
  });
  return id;
};

export const getStudentProgress = async (email, tripId = null) => {
  const sql = tripId
    ? 'SELECT * FROM student_progress WHERE email = ? AND trip_id = ? ORDER BY last_accessed_at DESC'
    : 'SELECT * FROM student_progress WHERE email = ? ORDER BY last_accessed_at DESC';

  const args = tripId ? [email, tripId] : [email];
  const result = await db.execute({ sql, args });
  return result.rows;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const safeCount = async (sql) => {
    try {
      const result = await db.execute({ sql, args: [] });
      return Number(result.rows?.[0]?.n ?? 0);
    } catch {
      return 0;
    }
  };

  const totalTrips = await safeCount('SELECT COUNT(*) AS n FROM trips');
  const publishedTrips = await safeCount('SELECT COUNT(*) AS n FROM trips WHERE published = 1');
  const draftTrips = await safeCount('SELECT COUNT(*) AS n FROM trips WHERE published = 0');
  const totalEvents = await safeCount('SELECT COUNT(*) AS n FROM trip_events');
  const totalClasses = await safeCount('SELECT COUNT(*) AS n FROM classes');

  return {
    totalTrips,
    publishedTrips,
    draftTrips,
    totalModules: totalEvents, // Events are the new modules
    totalContent: totalEvents, // Same as modules for now
    totalClasses,
  };
};

// Trip Progress Report
export const getTripProgressReport = async (tripId) => {
  // Get trip details
  const trip = await getTripById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Get all events for the trip
  const events = await getTripEventsByTripId(tripId);

  // Get all unique students who have accessed this trip
  const studentsResult = await db.execute({
    sql: `
      SELECT DISTINCT email
      FROM student_progress
      WHERE trip_id = ?
      ORDER BY email
    `,
    args: [tripId]
  });

  const students = studentsResult.rows || [];

  // Get progress for each student
  const studentProgress = await Promise.all(
    students.map(async (student) => {
      const progressResult = await db.execute({
        sql: `
          SELECT event_id, completed, last_accessed_at
          FROM student_progress
          WHERE trip_id = ? AND email = ? AND event_id IS NOT NULL
        `,
        args: [tripId, student.email]
      });

      const progress = progressResult.rows || [];
      const completedCount = progress.filter(p => p.completed === 1).length;

      return {
        email: student.email,
        totalEvents: events.length,
        completedEvents: completedCount,
        progressPercentage: events.length > 0 ? Math.round((completedCount / events.length) * 100) : 0,
        lastAccessed: progress.length > 0
          ? Math.max(...progress.map(p => p.last_accessed_at))
          : null,
        eventProgress: progress.map(p => ({
          eventId: p.event_id,
          completed: p.completed === 1,
          lastAccessed: p.last_accessed_at
        }))
      };
    })
  );

  // Calculate overall stats
  const totalStudents = students.length;
  const avgCompletion = totalStudents > 0
    ? Math.round(studentProgress.reduce((sum, s) => sum + s.progressPercentage, 0) / totalStudents)
    : 0;

  // Count how many students completed each event
  const eventStats = events.map(event => {
    const completedCount = studentProgress.filter(s =>
      s.eventProgress.some(ep => ep.eventId === event.id && ep.completed)
    ).length;

    return {
      eventId: event.id,
      eventTitle: event.title,
      studentsCompleted: completedCount,
      completionPercentage: totalStudents > 0
        ? Math.round((completedCount / totalStudents) * 100)
        : 0
    };
  });

  return {
    trip: {
      id: trip.id,
      title: trip.title
    },
    totalEvents: events.length,
    totalStudents,
    averageCompletion: avgCompletion,
    eventStats,
    studentProgress: studentProgress.sort((a, b) => b.progressPercentage - a.progressPercentage)
  };
};

// Trip Teachers
export const assignTeacherToTrip = async (tripId, userId, showPhone = false, showEmail = false, orderIndex = 0) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trip_teachers (id, trip_id, user_id, show_phone, show_email, order_index)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, tripId, userId, showPhone ? 1 : 0, showEmail ? 1 : 0, orderIndex]
  });
  return id;
};

export const removeTeacherFromTrip = async (tripId, userId) => {
  await db.execute({
    sql: 'DELETE FROM trip_teachers WHERE trip_id = ? AND user_id = ?',
    args: [tripId, userId]
  });
};

export const updateTripTeacherVisibility = async (tripId, userId, showPhone, showEmail) => {
  await db.execute({
    sql: `UPDATE trip_teachers 
          SET show_phone = ?, show_email = ? 
          WHERE trip_id = ? AND user_id = ?`,
    args: [showPhone ? 1 : 0, showEmail ? 1 : 0, tripId, userId]
  });
};

export const updateTripTeacherOrder = async (tripId, userId, orderIndex) => {
  await db.execute({
    sql: 'UPDATE trip_teachers SET order_index = ? WHERE trip_id = ? AND user_id = ?',
    args: [orderIndex, tripId, userId]
  });
};

export const getTripTeachers = async (tripId) => {
  const result = await db.execute({
    sql: `SELECT 
            tt.id,
            tt.trip_id,
            tt.user_id,
            tt.show_phone,
            tt.show_email,
            tt.order_index,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number
          FROM trip_teachers tt
          JOIN users u ON tt.user_id = u.id
          WHERE tt.trip_id = ?
          ORDER BY tt.order_index ASC, u.last_name ASC, u.first_name ASC`,
    args: [tripId]
  });
  return result.rows;
};

export const getTripTeachersForStudent = async (tripId) => {
  const result = await db.execute({
    sql: `SELECT 
            u.first_name,
            u.last_name,
            CASE WHEN tt.show_email = 1 THEN u.email ELSE NULL END as email,
            CASE WHEN tt.show_phone = 1 THEN u.phone_number ELSE NULL END as phone_number,
            tt.order_index
          FROM trip_teachers tt
          JOIN users u ON tt.user_id = u.id
          WHERE tt.trip_id = ?
          ORDER BY tt.order_index ASC, u.last_name ASC, u.first_name ASC`,
    args: [tripId]
  });
  return result.rows;
};

export const getTeacherTrips = async (userId) => {
  const result = await db.execute({
    sql: `SELECT 
            t.id,
            t.title,
            t.description,
            t.published,
            t.created_at,
            t.updated_at
          FROM trips t
          JOIN trip_teachers tt ON t.id = tt.trip_id
          WHERE tt.user_id = ?
          ORDER BY t.created_at DESC`,
    args: [userId]
  });
  return result.rows;
};

export const getAllTeachers = async () => {
  const result = await db.execute({
    sql: `SELECT id, email, first_name, last_name, phone_number, created_at 
          FROM users 
          WHERE role = 'teacher' OR role = 'admin'
          ORDER BY last_name ASC, first_name ASC`,
    args: []
  });
  return result.rows;
};

export const updateUserPhoneNumber = async (userId, phoneNumber) => {
  await db.execute({
    sql: 'UPDATE users SET phone_number = ? WHERE id = ?',
    args: [phoneNumber, userId]
  });
};

// ========================================
// TRIP DAYS (nieuwe hiërarchie laag)
// ========================================

export const createTripDay = async (tripId, { title, description = null, dayNumber, orderIndex = 0 }) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trip_days (id, trip_id, title, description, day_number, order_index)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, tripId, title, description, dayNumber, orderIndex]
  });
  return id;
};

export const getTripDaysByTripId = async (tripId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_days WHERE trip_id = ? ORDER BY order_index ASC, day_number ASC',
    args: [tripId]
  });
  return result.rows;
};

export const getTripDayById = async (dayId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_days WHERE id = ?',
    args: [dayId]
  });
  return result.rows[0] || null;
};

export const updateTripDay = async (dayId, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(dayId);
  await db.execute({
    sql: `UPDATE trip_days SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTripDay = async (dayId) => {
  await db.execute({
    sql: 'DELETE FROM trip_days WHERE id = ?',
    args: [dayId]
  });
};

export const reorderTripDays = async (tripId, dayIds) => {
  // dayIds is an array of day IDs in the new order
  for (let i = 0; i < dayIds.length; i++) {
    await db.execute({
      sql: 'UPDATE trip_days SET order_index = ? WHERE id = ? AND trip_id = ?',
      args: [i, dayIds[i], tripId]
    });
  }
};

// ========================================
// MEDIA GALLERIES - PHOTOS
// ========================================

export const addTripPhoto = async (eventId, { title, imageBlob, mimeType, orderIndex = 0 }) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trip_photos (id, event_id, title, image_blob, image_mime_type, order_index)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, eventId, title, imageBlob, mimeType, orderIndex]
  });
  return id;
};

export const getTripPhotos = async (eventId) => {
  const result = await db.execute({
    sql: 'SELECT id, event_id, title, image_mime_type, order_index, created_at, updated_at FROM trip_photos WHERE event_id = ? ORDER BY order_index ASC',
    args: [eventId]
  });
  return result.rows;
};

export const getTripPhotoById = async (photoId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_photos WHERE id = ?',
    args: [photoId]
  });
  return result.rows[0] || null;
};

export const updateTripPhoto = async (photoId, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(photoId);
  await db.execute({
    sql: `UPDATE trip_photos SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTripPhoto = async (photoId) => {
  await db.execute({
    sql: 'DELETE FROM trip_photos WHERE id = ?',
    args: [photoId]
  });
};

// ========================================
// MEDIA GALLERIES - AUDIO
// ========================================

export const addTripAudio = async (eventId, { title, audioBlob, mimeType, duration = null, orderIndex = 0 }) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trip_audio (id, event_id, title, audio_blob, audio_mime_type, duration_seconds, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, eventId, title, audioBlob, mimeType, duration, orderIndex]
  });
  return id;
};

export const getTripAudio = async (eventId) => {
  const result = await db.execute({
    sql: 'SELECT id, event_id, title, audio_mime_type, duration_seconds, order_index, created_at, updated_at FROM trip_audio WHERE event_id = ? ORDER BY order_index ASC',
    args: [eventId]
  });
  return result.rows;
};

export const getTripAudioById = async (audioId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_audio WHERE id = ?',
    args: [audioId]
  });
  return result.rows[0] || null;
};

export const updateTripAudio = async (audioId, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(audioId);
  await db.execute({
    sql: `UPDATE trip_audio SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTripAudio = async (audioId) => {
  await db.execute({
    sql: 'DELETE FROM trip_audio WHERE id = ?',
    args: [audioId]
  });
};

// ========================================
// MEDIA GALLERIES - VIDEOS
// ========================================

export const addTripVideo = async (eventId, { title, videoUrl, thumbnailUrl = null, orderIndex = 0 }) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trip_videos (id, event_id, title, video_url, thumbnail_url, order_index)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, eventId, title, videoUrl, thumbnailUrl, orderIndex]
  });
  return id;
};

export const getTripVideos = async (eventId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_videos WHERE event_id = ? ORDER BY order_index ASC',
    args: [eventId]
  });
  return result.rows;
};

export const getTripVideoById = async (videoId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_videos WHERE id = ?',
    args: [videoId]
  });
  return result.rows[0] || null;
};

export const updateTripVideo = async (videoId, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(videoId);
  await db.execute({
    sql: `UPDATE trip_videos SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTripVideo = async (videoId) => {
  await db.execute({
    sql: 'DELETE FROM trip_videos WHERE id = ?',
    args: [videoId]
  });
};

// ========================================
// TRIP DOCUMENTS (private docs for teachers)
// ========================================

export const addTripDocument = async (tripId, { filename, title = null, documentBlob, mimeType, fileSize, description = null, uploadedBy, orderIndex = 0 }) => {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO trip_documents (id, trip_id, filename, title, document_blob, mime_type, file_size, description, uploaded_by, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, tripId, filename, title, documentBlob, mimeType, fileSize, description, uploadedBy, orderIndex]
  });
  return id;
};

export const getTripDocuments = async (tripId) => {
  const result = await db.execute({
    sql: `SELECT id, trip_id, filename, title, mime_type, file_size, description, order_index, uploaded_by, created_at, updated_at
          FROM trip_documents
          WHERE trip_id = ?
          ORDER BY order_index ASC, created_at DESC`,
    args: [tripId]
  });
  return result.rows;
};

export const getTripDocumentById = async (docId) => {
  const result = await db.execute({
    sql: 'SELECT * FROM trip_documents WHERE id = ?',
    args: [docId]
  });
  return result.rows[0] || null;
};

export const updateTripDocument = async (docId, updates) => {
  const fields = [];
  const args = [];

  for (const [key, value] of Object.entries(updates)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${snakeKey} = ?`);
    args.push(value);
  }

  if (fields.length === 0) return;

  args.push(docId);
  await db.execute({
    sql: `UPDATE trip_documents SET ${fields.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`,
    args
  });
};

export const deleteTripDocument = async (docId) => {
  await db.execute({
    sql: 'DELETE FROM trip_documents WHERE id = ?',
    args: [docId]
  });
};

// ========================================
// CHECK-IN TRACKING (GPS-based)
// ========================================

export const recordCheckIn = async ({ email, eventId, lat, lng, accuracy, timestamp = null }) => {
  const id = randomUUID();
  const checkInTime = timestamp || Math.floor(Date.now() / 1000);

  // First get the trip_id for this event
  const event = await getTripEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  await db.execute({
    sql: `INSERT INTO student_progress
          (id, email, trip_id, event_id, completed, check_in_lat, check_in_lng, check_in_accuracy, check_in_timestamp, last_accessed_at)
          VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
          completed = 1,
          check_in_lat = ?,
          check_in_lng = ?,
          check_in_accuracy = ?,
          check_in_timestamp = ?,
          last_accessed_at = ?`,
    args: [
      id, email, event.trip_id, eventId, lat, lng, accuracy, checkInTime, checkInTime,
      lat, lng, accuracy, checkInTime, checkInTime
    ]
  });
  return id;
};

export const getCheckIns = async (tripId, eventId = null) => {
  const sql = eventId
    ? `SELECT
        sp.email,
        sp.event_id,
        te.title as event_title,
        sp.check_in_lat,
        sp.check_in_lng,
        sp.check_in_accuracy,
        sp.check_in_timestamp,
        sp.last_accessed_at
      FROM student_progress sp
      JOIN trip_events te ON sp.event_id = te.id
      WHERE sp.trip_id = ? AND sp.event_id = ? AND sp.check_in_timestamp IS NOT NULL
      ORDER BY sp.check_in_timestamp DESC`
    : `SELECT
        sp.email,
        sp.event_id,
        te.title as event_title,
        sp.check_in_lat,
        sp.check_in_lng,
        sp.check_in_accuracy,
        sp.check_in_timestamp,
        sp.last_accessed_at
      FROM student_progress sp
      JOIN trip_events te ON sp.event_id = te.id
      WHERE sp.trip_id = ? AND sp.check_in_timestamp IS NOT NULL
      ORDER BY sp.check_in_timestamp DESC`;

  const args = eventId ? [tripId, eventId] : [tripId];
  const result = await db.execute({ sql, args });
  return result.rows;
};

// ========================================
// STUDENT LOCATION TRACKING (Automatic/Continuous)
// ========================================

export const updateStudentLocation = async ({ tripId, studentUsername, lat, lng, accuracy }) => {
  const id = randomUUID();
  const now = Math.floor(Date.now() / 1000);

  // Upsert: insert or replace existing location
  await db.execute({
    sql: `INSERT INTO student_locations (id, trip_id, student_username, lat, lng, accuracy, last_updated)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(trip_id, student_username)
          DO UPDATE SET
            lat = excluded.lat,
            lng = excluded.lng,
            accuracy = excluded.accuracy,
            last_updated = excluded.last_updated`,
    args: [id, tripId, studentUsername, lat, lng, accuracy || null, now]
  });
};

export const getCurrentStudentLocations = async (tripId, maxAgeSeconds = 300) => {
  // Only return locations updated in the last 5 minutes (default)
  const cutoffTime = Math.floor(Date.now() / 1000) - maxAgeSeconds;

  const result = await db.execute({
    sql: `SELECT
            student_username,
            lat,
            lng,
            accuracy,
            last_updated
          FROM student_locations
          WHERE trip_id = ? AND last_updated > ?
          ORDER BY last_updated DESC`,
    args: [tripId, cutoffTime]
  });

  return result.rows;
};

export const removeStudentLocation = async (tripId, studentUsername) => {
  await db.execute({
    sql: 'DELETE FROM student_locations WHERE trip_id = ? AND student_username = ?',
    args: [tripId, studentUsername]
  });
};

export const cleanupStaleLocations = async (maxAgeSeconds = 600) => {
  // Remove locations older than 10 minutes (default)
  const cutoffTime = Math.floor(Date.now() / 1000) - maxAgeSeconds;

  await db.execute({
    sql: 'DELETE FROM student_locations WHERE last_updated < ?',
    args: [cutoffTime]
  });
};
