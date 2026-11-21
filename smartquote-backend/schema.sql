PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY,
 created_at TEXT NOT NULL,
 name TEXT NOT NULL,
 address TEXT NOT NULL,
 email TEXT NOT NULL,
 service TEXT NOT NULL,
 frequency TEXT NOT NULL,
 notes TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS inquiry_photos (
 inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
 object_key TEXT NOT NULL UNIQUE,
 PRIMARY KEY(inquiry_id,object_key)
);
CREATE TABLE IF NOT EXISTS audit_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
 action TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);
