-- Table for tracking current student locations
CREATE TABLE IF NOT EXISTS student_locations (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  student_username TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  accuracy REAL,
  last_updated INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE(trip_id, student_username)
);

CREATE INDEX IF NOT EXISTS idx_student_locations_trip_id ON student_locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_student_locations_updated ON student_locations(last_updated);
