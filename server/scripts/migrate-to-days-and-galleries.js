import 'dotenv/config';
import db from '../config/database.js';
import { randomUUID } from 'crypto';

const migrate = async () => {
  console.log('🔄 Starting migration to days and galleries...\n');

  try {
    // ========================================
    // STEP 1: Create trip_days table
    // ========================================
    console.log('1️⃣  Creating trip_days table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trip_days (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        day_number INTEGER NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_days_order ON trip_days(trip_id, order_index)`);
    console.log('   ✅ trip_days table created\n');

    // ========================================
    // STEP 2: Add day_id column to trip_events
    // ========================================
    console.log('2️⃣  Adding day_id column to trip_events...');

    // Check if column already exists
    const tableInfo = await db.execute(`PRAGMA table_info(trip_events)`);
    const hasDay_id = tableInfo.rows.some(row => row.name === 'day_id');

    if (!hasDay_id) {
      await db.execute(`ALTER TABLE trip_events ADD COLUMN day_id TEXT`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_events_day_id ON trip_events(day_id)`);
      console.log('   ✅ day_id column added\n');
    } else {
      console.log('   ℹ️  day_id column already exists\n');
    }

    // ========================================
    // STEP 3: Create media gallery tables
    // ========================================
    console.log('3️⃣  Creating media gallery tables...');

    // Photos table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trip_photos (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        image_blob BLOB NOT NULL,
        image_mime_type TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (event_id) REFERENCES trip_events(id) ON DELETE CASCADE
      )
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_photos_event_id ON trip_photos(event_id)`);

    // Audio table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trip_audio (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        audio_blob BLOB NOT NULL,
        audio_mime_type TEXT NOT NULL,
        duration_seconds INTEGER,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (event_id) REFERENCES trip_events(id) ON DELETE CASCADE
      )
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_audio_event_id ON trip_audio(event_id)`);

    // Videos table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trip_videos (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (event_id) REFERENCES trip_events(id) ON DELETE CASCADE
      )
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_videos_event_id ON trip_videos(event_id)`);

    console.log('   ✅ Media gallery tables created\n');

    // ========================================
    // STEP 4: Create trip_documents table
    // ========================================
    console.log('4️⃣  Creating trip_documents table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trip_documents (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        title TEXT,
        document_blob BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        description TEXT,
        is_private INTEGER NOT NULL DEFAULT 1,
        order_index INTEGER NOT NULL DEFAULT 0,
        uploaded_by TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_trip_documents_trip_id ON trip_documents(trip_id)`);
    console.log('   ✅ trip_documents table created\n');

    // ========================================
    // STEP 5: Add check-in columns to student_progress
    // ========================================
    console.log('5️⃣  Adding check-in columns to student_progress...');

    const progressInfo = await db.execute(`PRAGMA table_info(student_progress)`);
    const hasCheckInLat = progressInfo.rows.some(row => row.name === 'check_in_lat');

    if (!hasCheckInLat) {
      await db.execute(`ALTER TABLE student_progress ADD COLUMN check_in_lat REAL`);
      await db.execute(`ALTER TABLE student_progress ADD COLUMN check_in_lng REAL`);
      await db.execute(`ALTER TABLE student_progress ADD COLUMN check_in_accuracy REAL`);
      await db.execute(`ALTER TABLE student_progress ADD COLUMN check_in_timestamp INTEGER`);
      console.log('   ✅ Check-in columns added\n');
    } else {
      console.log('   ℹ️  Check-in columns already exist\n');
    }

    // ========================================
    // STEP 6: Migrate existing trips to use days
    // ========================================
    console.log('6️⃣  Migrating existing trips...');

    // Get all trips
    const tripsResult = await db.execute('SELECT id, title FROM trips');
    const trips = tripsResult.rows;

    if (trips.length === 0) {
      console.log('   ℹ️  No trips found to migrate\n');
    } else {
      console.log(`   Found ${trips.length} trip(s) to migrate`);

      for (const trip of trips) {
        // Check if this trip already has days
        const existingDaysResult = await db.execute(
          'SELECT id FROM trip_days WHERE trip_id = ?',
          [trip.id]
        );

        if (existingDaysResult.rows.length > 0) {
          console.log(`   ⏩ Trip "${trip.title}" already has days, skipping`);
          continue;
        }

        // Create default "Day 1" for this trip
        const dayId = randomUUID();
        await db.execute(
          `INSERT INTO trip_days (id, trip_id, title, description, day_number, order_index)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [dayId, trip.id, 'Dag 1', 'Default dag aangemaakt tijdens migratie', 1, 0]
        );

        // Link all events of this trip to the new day
        await db.execute(
          'UPDATE trip_events SET day_id = ? WHERE trip_id = ? AND day_id IS NULL',
          [dayId, trip.id]
        );

        // Count linked events
        const eventsResult = await db.execute(
          'SELECT COUNT(*) as count FROM trip_events WHERE day_id = ?',
          [dayId]
        );
        const eventCount = eventsResult.rows[0].count;

        console.log(`   ✅ Trip "${trip.title}": created "Dag 1" with ${eventCount} event(s)`);
      }
      console.log('');
    }

    // ========================================
    // STEP 7: Summary
    // ========================================
    console.log('📊 Migration Summary:');
    console.log('   ✅ trip_days table created');
    console.log('   ✅ trip_photos table created');
    console.log('   ✅ trip_audio table created');
    console.log('   ✅ trip_videos table created');
    console.log('   ✅ trip_documents table created');
    console.log('   ✅ trip_events.day_id column added');
    console.log('   ✅ student_progress check-in columns added');
    console.log(`   ✅ ${trips.length} trip(s) migrated with default days`);
    console.log('');
    console.log('✨ Migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Update server/models/db.js with new CRUD functions');
    console.log('   2. Create API routes (days.js, media.js)');
    console.log('   3. Update admin UI components');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration
migrate()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
