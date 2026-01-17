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
    metadata = null
  } = eventData;

  await db.execute({
    sql: `INSERT INTO trip_events
          (id, trip_id, title, category, duration_minutes, text_content, lat, lng, address,
           image_blob, image_mime_type, audio_blob, audio_mime_type, video_url, order_index, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, tripId, title, category, durationMinutes, textContent, lat, lng, address,
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
