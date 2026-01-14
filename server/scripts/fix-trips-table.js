import 'dotenv/config';
import db from '../config/database.js';

/**
 * Fix trips table by removing NOT NULL constraints on old fields
 * SQLite doesn't support ALTER COLUMN, so we need to recreate the table
 */

const fixTripsTable = async () => {
  console.log('🔄 Fixing trips table schema...\n');

  try {
    // Step 1: Check if trips table exists and has data
    console.log('1️⃣  Checking existing trips table...');
    let existingTrips = [];
    try {
      const result = await db.execute('SELECT * FROM trips');
      existingTrips = result.rows || [];
      console.log(`   Found ${existingTrips.length} existing trips\n`);
    } catch (error) {
      console.log('   ℹ️  No existing trips table\n');
    }

    // Step 2: Create backup table
    if (existingTrips.length > 0) {
      console.log('2️⃣  Creating backup...');
      await db.execute('DROP TABLE IF EXISTS trips_backup');
      await db.execute(`
        CREATE TABLE trips_backup AS SELECT * FROM trips
      `);
      console.log('   ✅ Backup created\n');
    }

    // Step 3: Drop old trips table
    console.log('3️⃣  Dropping old trips table...');
    await db.execute('DROP TABLE IF EXISTS trips');
    console.log('   ✅ Old table dropped\n');

    // Step 4: Create new trips table with correct schema
    console.log('4️⃣  Creating new trips table...');
    await db.execute(`
      CREATE TABLE trips (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        destination TEXT,
        start_date INTEGER,
        end_date INTEGER,
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
    await db.execute('CREATE INDEX IF NOT EXISTS idx_trips_published ON trips(published)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by)');
    console.log('   ✅ New table created\n');

    // Step 5: Restore data from backup
    if (existingTrips.length > 0) {
      console.log('5️⃣  Restoring trip data...');
      for (const trip of existingTrips) {
        await db.execute({
          sql: `
            INSERT INTO trips (
              id, title, description, destination, start_date, end_date,
              cover_image_blob, cover_image_mime_type,
              published, manifest_version, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            trip.id,
            trip.title,
            trip.description,
            trip.destination || null,
            trip.start_date || null,
            trip.end_date || null,
            trip.cover_image_blob || null,
            trip.cover_image_mime_type || null,
            trip.published ?? 0,
            trip.manifest_version ?? 1,
            trip.created_by,
            trip.created_at,
            trip.updated_at || trip.created_at
          ]
        });
      }
      console.log(`   ✅ Restored ${existingTrips.length} trips\n`);

      // Drop backup
      await db.execute('DROP TABLE trips_backup');
      console.log('   ✅ Backup removed\n');
    }

    console.log('✅ Trips table fixed successfully!\n');
    console.log('ℹ️  Note: destination, start_date, end_date are now nullable');
    console.log('   These fields are kept for backward compatibility but not required\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

fixTripsTable()
  .then(() => {
    console.log('🎉 Fix script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix script failed:', error);
    process.exit(1);
  });
