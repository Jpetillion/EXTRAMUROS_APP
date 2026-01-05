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

  // Trips table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      destination TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      cover_image_url TEXT,
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

  // Modules table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      icon TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_modules_trip_id ON modules(trip_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(trip_id, order_index)`);

  // Content items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('text', 'image', 'audio', 'video', 'location', 'activity', 'schedule')),
      title TEXT NOT NULL,
      body TEXT,
      media_url TEXT,
      thumbnail_url TEXT,
      metadata TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_items_trip_id ON content_items(trip_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_items_module_id ON content_items(module_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_items_published ON content_items(published)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_items_order ON content_items(module_id, order_index)`);

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

  // Student downloads table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS student_downloads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      trip_id TEXT NOT NULL,
      manifest_version INTEGER NOT NULL,
      downloaded_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      last_accessed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_downloads_user_id ON student_downloads(user_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_downloads_trip_id ON student_downloads(trip_id)`);
  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_student_downloads_user_trip ON student_downloads(user_id, trip_id)`);

  console.log('✅ Database tables created successfully!');
};

createTables().catch((error) => {
  console.error('❌ Error creating tables:', error);
  process.exit(1);
});
