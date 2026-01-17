// init_db.js (overwrite)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  // users table (simple mocked users)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    locked_until TEXT DEFAULT NULL
  )`);

  // login attempts (for lockout demo)
  db.run(`CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    attempt_time TEXT DEFAULT (datetime('now')),
    success INTEGER
  )`);

  // parking slots with status: available, booked, occupied, maintenance
  db.run(`CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    status TEXT DEFAULT 'available',
    booked_by TEXT,
    booked_until TEXT
  )`);

  // booking history
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_id INTEGER,
    username TEXT,
    amount REAL,
    receipt_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // receipts (simple record)
  db.run(`CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id TEXT,
    username TEXT,
    slot_id INTEGER,
    amount REAL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // violations
  db.run(`CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter TEXT,
    slot_id INTEGER,
    image_path TEXT,
    location TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // seed users (ignore if exists)
  db.run(`INSERT OR IGNORE INTO users (username,password,role) VALUES
    ('admin','adminpass','admin'),
    ('traffic','trafficpass','traffic'),
    ('user1','user1pass','user')
  `);

  // seed slots only if none exist
  db.get("SELECT COUNT(*) as cnt FROM slots", (err, row) => {
    if (err) { console.error(err); return; }
    if (row.cnt === 0) {
      const slots = [
        ['Slot A1','Near Mall - Zone 1'],
        ['Slot A2','Near Mall - Zone 1'],
        ['Slot B1','Station Road - Zone 2'],
        ['Slot C1','City Park - Zone 3']
      ];
      const stmt = db.prepare("INSERT INTO slots (name,location) VALUES (?,?)");
      slots.forEach(s => stmt.run(s[0], s[1]));
      stmt.finalize();
      console.log('Seeded slots.');
    } else {
      console.log('Slots already seeded.');
    }
  });

  console.log('Database initialized.');
});

db.close();
