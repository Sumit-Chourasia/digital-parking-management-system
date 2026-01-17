// migrate.js - safe DB migration for demo
// Place this in C:\Users\sumit\Desktop\digital-parking\backend and run `node migrate.js`

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error('Failed to open DB:', err);
    process.exit(1);
  }
  console.log('Opened DB:', dbPath);
});

function hasColumn(table, column) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) return reject(err);
      const found = rows && rows.some(r => r.name === column);
      resolve(found);
    });
  });
}

function runSql(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function migrate() {
  try {
    // 1) Ensure users table exists (should exist)
    await runSql(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      locked_until TEXT DEFAULT NULL
    )`);

    // 2) Add locked_until column if missing
    const lockedExists = await hasColumn('users', 'locked_until');
    if (!lockedExists) {
      console.log('Adding locked_until column to users table...');
      await runSql(`ALTER TABLE users ADD COLUMN locked_until TEXT DEFAULT NULL`);
    } else {
      console.log('users.locked_until already exists');
    }

    // 3) Ensure login_attempts table exists
    await runSql(`CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      attempt_time TEXT DEFAULT (datetime('now')),
      success INTEGER
    )`);
    console.log('Ensured login_attempts table exists');

    // 4) Ensure slots table exists and has status column
    await runSql(`CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      location TEXT,
      status TEXT DEFAULT 'available',
      booked_by TEXT,
      booked_until TEXT
    )`);
    const statusExists = await hasColumn('slots', 'status');
    if (!statusExists) {
      console.log('Adding status column to slots table...');
      await runSql(`ALTER TABLE slots ADD COLUMN status TEXT DEFAULT 'available'`);
    } else {
      console.log('slots.status exists');
    }

    // 5) Ensure bookings and receipts tables
    await runSql(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER,
      username TEXT,
      amount REAL,
      receipt_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    console.log('Ensured bookings table exists');

    await runSql(`CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id TEXT,
      username TEXT,
      slot_id INTEGER,
      amount REAL,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    console.log('Ensured receipts table exists');

    // 6) Ensure violations table exists (preserves existing)
    await runSql(`CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter TEXT,
      slot_id INTEGER,
      image_path TEXT,
      location TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    console.log('Ensured violations table exists');

    // 7) Seed default users if not present
    // This uses INSERT OR IGNORE so it will not duplicate existing users.
    await runSql(`INSERT OR IGNORE INTO users (username, password, role) VALUES
      ('admin','adminpass','admin'),
      ('traffic','trafficpass','traffic'),
      ('user1','user1pass','user')
    `);
    console.log('Seeded demo users (if missing)');

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    db.close();
  }
}

migrate();
