import 'dotenv/config';
import db from '../config/database.js';

const createTables = async () => {
  console.log('🗄️  Creating database tables...');

  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'admin', 'student')),
      first_name TEXT,
      last_name TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);

  // Trips table - simplified (removed destination, start_date, end_date)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cover_image_blob BLOB,
      cover_image_mime_type TEXT,
      published INTEGER NOT NULL DEFAULT 0,
      manifest_version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_trips_published ON trips(published)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by)`);

  // Trip events table (renamed from trip_stops, updated fields)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trip_events (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      duration_minutes INTEGER,
      text_content TEXT,
      lat REAL,
      lng REAL,
      address TEXT,
      image_blob BLOB,
      image_mime_type TEXT,
      audio_blob BLOB,
      audio_mime_type TEXT,
      video_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_events_trip_id ON trip_events(trip_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_events_order ON trip_events(trip_id, order_index)`);

  // Classes table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      school_year TEXT,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_classes_created_by ON classes(created_by)`);

  // Trip-Class association table (many-to-many)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trip_classes (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      assigned_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      UNIQUE(trip_id, class_id)
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_classes_trip_id ON trip_classes(trip_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_classes_class_id ON trip_classes(class_id)`);

  // Manifests table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS manifests (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      assets_count INTEGER NOT NULL DEFAULT 0,
      published_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_manifests_trip_id ON manifests(trip_id)`);
  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_manifests_trip_version ON manifests(trip_id, version)`);

  // Student progress table (tracks email + trip/event completion)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS student_progress (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      trip_id TEXT NOT NULL,
      event_id TEXT,
      class_id TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      progress_data TEXT,
      last_accessed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES trip_events(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_progress_email ON student_progress(email)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_progress_trip_id ON student_progress(trip_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_progress_event_id ON student_progress(event_id)`);

  console.log('✅ Database tables created successfully!');
  console.log('');
  console.log('📝 Note: Old tables (modules, content_items, trip_stops, student_downloads) are not created.');
  console.log('   If you have existing data, you may want to migrate it or drop those tables.');
};

createTables().catch((error) => {
  console.error('❌ Error creating tables:', error);
  process.exit(1);
});
