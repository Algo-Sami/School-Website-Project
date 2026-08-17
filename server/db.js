const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'school_gallery.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize schema
function initSchema() {
  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Event Media table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_media (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      media_type TEXT NOT NULL CHECK(media_type IN ('image', 'video')),
      file_url TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      file_name TEXT,
      file_size INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin if none exists
  seedDefaultAdmin();
}

function seedDefaultAdmin() {
  const checkStmt = db.prepare('SELECT COUNT(*) AS cnt FROM admin_users');
  const result = checkStmt.get();
  if (result && result.cnt === 0) {
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'AimpsAdmin2026!';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);
    const now = new Date().toISOString();
    const id = 'admin-' + Date.now();

    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);
    insertAdmin.run(id, defaultUsername, hash, now);
    console.log(`[DB] Default admin user '${defaultUsername}' initialized.`);
  }
}

// Database helper functions
const dbHelpers = {
  // Auth
  findUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?');
    return stmt.get(username);
  },

  findUserById(id) {
    const stmt = db.prepare('SELECT id, username, created_at FROM admin_users WHERE id = ?');
    return stmt.get(id);
  },

  // Stats
  getStats() {
    const eventsCount = db.prepare('SELECT COUNT(*) AS total FROM events').get().total;
    const photosCount = db.prepare("SELECT COUNT(*) AS total FROM event_media WHERE media_type = 'image'").get().total;
    const videosCount = db.prepare("SELECT COUNT(*) AS total FROM event_media WHERE media_type = 'video'").get().total;
    return {
      totalEvents: eventsCount,
      totalPhotos: photosCount,
      totalVideos: videosCount,
    };
  },

  // Events CRUD
  getAllEvents() {
    // Get all events sorted by event_date desc, created_at desc
    const events = db.prepare(`
      SELECT e.*,
        (SELECT COUNT(*) FROM event_media m WHERE m.event_id = e.id AND m.media_type = 'image') AS photoCount,
        (SELECT COUNT(*) FROM event_media m WHERE m.event_id = e.id AND m.media_type = 'video') AS videoCount,
        (SELECT file_url FROM event_media m WHERE m.event_id = e.id AND m.media_type = 'image' ORDER BY m.created_at ASC LIMIT 1) AS coverImage
      FROM events e
      ORDER BY e.event_date DESC, e.created_at DESC
    `).all();
    return events;
  },

  getEventById(id) {
    const event = db.prepare(`
      SELECT e.*,
        (SELECT COUNT(*) FROM event_media m WHERE m.event_id = e.id AND m.media_type = 'image') AS photoCount,
        (SELECT COUNT(*) FROM event_media m WHERE m.event_id = e.id AND m.media_type = 'video') AS videoCount,
        (SELECT file_url FROM event_media m WHERE m.event_id = e.id AND m.media_type = 'image' ORDER BY m.created_at ASC LIMIT 1) AS coverImage
      FROM events e
      WHERE e.id = ?
    `).get(id);

    if (!event) return null;

    const media = db.prepare(`
      SELECT * FROM event_media
      WHERE event_id = ?
      ORDER BY created_at ASC
    `).all(id);

    const photos = media.filter(m => m.media_type === 'image').map(m => ({
      id: m.id,
      src: m.file_url,
      alt: event.title + ' photo',
      fileName: m.file_name,
      fileSize: m.file_size,
      storagePath: m.storage_path,
      createdAt: m.created_at,
    }));

    const videos = media.filter(m => m.media_type === 'video').map(m => ({
      id: m.id,
      fileUrl: m.file_url,
      title: m.file_name || (event.title + ' Video'),
      fileName: m.file_name,
      fileSize: m.file_size,
      storagePath: m.storage_path,
      createdAt: m.created_at,
    }));

    return {
      ...event,
      photos,
      videos,
    };
  },

  createEvent({ id, title, event_date, description }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO events (id, title, event_date, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, event_date, description || '', now, now);
    return this.getEventById(id);
  },

  updateEvent(id, { title, event_date, description }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE events
      SET title = ?, event_date = ?, description = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(title, event_date, description || '', now, id);
    return this.getEventById(id);
  },

  deleteEvent(id) {
    // Get all media for cleanup
    const media = db.prepare('SELECT * FROM event_media WHERE event_id = ?').all(id);
    // Delete event (foreign key cascade handles event_media records)
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return { success: result.changes > 0, media };
  },

  // Media CRUD
  addMedia({ id, event_id, media_type, file_url, storage_path, file_name, file_size }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO event_media (id, event_id, media_type, file_url, storage_path, file_name, file_size, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, event_id, media_type, file_url, storage_path, file_name || '', file_size || 0, now, now);
    return db.prepare('SELECT * FROM event_media WHERE id = ?').get(id);
  },

  getMediaById(id) {
    const stmt = db.prepare('SELECT * FROM event_media WHERE id = ?');
    return stmt.get(id);
  },

  deleteMedia(id) {
    const media = db.prepare('SELECT * FROM event_media WHERE id = ?').get(id);
    if (!media) return null;
    const stmt = db.prepare('DELETE FROM event_media WHERE id = ?');
    stmt.run(id);
    return media;
  },
};

// Initialize schema on load
initSchema();

module.exports = {
  db,
  dbHelpers,
};
