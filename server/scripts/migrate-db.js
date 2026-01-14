import 'dotenv/config';
import db from '../config/database.js';

/**
 * Migration script to update Turso database structure
 * This migrates from the old structure (modules/content_items/trip_stops)
 * to the new structure (classes/trip_events)
 */

const migrate = async () => {
  console.log('🔄 Starting database migration...\n');

  try {
    // Step 1: Create new trip_events table (replacing trip_stops)
    console.log('1️⃣  Creating trip_events table...');
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
    console.log('   ✅ trip_events table created\n');

    // Step 2: Migrate data from trip_stops to trip_events (if trip_stops exists)
    console.log('2️⃣  Migrating data from trip_stops to trip_events...');
    try {
      const existingStops = await db.execute('SELECT * FROM trip_stops');
      if (existingStops.rows && existingStops.rows.length > 0) {
        console.log(`   Found ${existingStops.rows.length} trip stops to migrate`);

        for (const stop of existingStops.rows) {
          await db.execute({
            sql: `INSERT INTO trip_events
                  (id, trip_id, title, category, duration_minutes, lat, lng, address,
                   video_url, order_index, metadata, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              stop.id,
              stop.trip_id,
              stop.title,
              stop.category,
              stop.duration_minutes,
              stop.lat,
              stop.lng,
              stop.address,
              stop.video_url,
              stop.order_index,
              stop.metadata,
              stop.created_at,
              stop.updated_at || stop.created_at
            ]
          });
        }
        console.log(`   ✅ Migrated ${existingStops.rows.length} trip stops to trip_events\n`);
      } else {
        console.log('   ℹ️  No trip stops to migrate\n');
      }
    } catch (error) {
      if (error.message && error.message.includes('no such table')) {
        console.log('   ℹ️  trip_stops table does not exist, skipping migration\n');
      } else {
        throw error;
      }
    }

    // Step 3: Create classes table
    console.log('3️⃣  Creating classes table...');
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
    console.log('   ✅ classes table created\n');

    // Step 4: Create trip_classes association table
    console.log('4️⃣  Creating trip_classes table...');
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
    console.log('   ✅ trip_classes table created\n');

    // Step 5: Create student_progress table (email-based tracking)
    console.log('5️⃣  Creating student_progress table...');
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
    console.log('   ✅ student_progress table created\n');

    // Step 6: Add new columns to trips table (cover_image_blob, cover_image_mime_type)
    console.log('6️⃣  Updating trips table with new columns...');
    try {
      await db.execute(`ALTER TABLE trips ADD COLUMN cover_image_blob BLOB`);
      console.log('   ✅ Added cover_image_blob column');
    } catch (error) {
      if (error.message && error.message.includes('duplicate column')) {
        console.log('   ℹ️  cover_image_blob column already exists');
      } else {
        throw error;
      }
    }

    try {
      await db.execute(`ALTER TABLE trips ADD COLUMN cover_image_mime_type TEXT`);
      console.log('   ✅ Added cover_image_mime_type column\n');
    } catch (error) {
      if (error.message && error.message.includes('duplicate column')) {
        console.log('   ℹ️  cover_image_mime_type column already exists\n');
      } else {
        throw error;
      }
    }

    console.log('✅ Migration completed successfully!\n');

    // Show summary
    console.log('📊 Database Summary:');
    const tables = await db.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `);
    console.log('   Tables:', tables.rows.map(t => t.name).join(', '));
    console.log('');

    console.log('⚠️  OPTIONAL: Drop old tables');
    console.log('   If you want to remove the old tables (modules, content_items, trip_stops, student_downloads, manifests),');
    console.log('   run the following SQL commands in Turso:');
    console.log('   - DROP TABLE IF EXISTS content_items;');
    console.log('   - DROP TABLE IF EXISTS modules;');
    console.log('   - DROP TABLE IF EXISTS trip_stops;');
    console.log('   - DROP TABLE IF EXISTS student_downloads;');
    console.log('   - DROP TABLE IF EXISTS manifests;');
    console.log('');
    console.log('   Note: destination, start_date, end_date columns in trips table cannot be removed in SQLite.');
    console.log('   They will remain but will not be used by the application.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

migrate()
  .then(() => {
    console.log('🎉 Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
