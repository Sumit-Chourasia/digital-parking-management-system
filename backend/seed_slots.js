// seed_slots.js — safe, idempotent seed for demo slots
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err);
    process.exit(1);
  }
  console.log('Opened DB:', dbPath);
});

const slots = [
  { name: 'C-301', location: 'Airport - 789 Airport Road', status: 'available', price: 8 },
  { name: 'C-302', location: 'Airport - 789 Airport Road', status: 'maintenance', price: 8 },
  { name: 'A-102', location: 'City Center - 123 Main Street', status: 'available', price: 5 },
  { name: 'A-103', location: 'City Center - 123 Main Street', status: 'occupied', price: 5 },
  { name: 'A-101', location: 'City Center - 123 Main Street', status: 'available', price: 5 },
  { name: 'D-401', location: 'Hospital Zone - 321 Medical Center', status: 'available', price: 3 }
];

db.serialize(() => {
  // ensure table exists (idempotent)
  db.run(`CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    status TEXT DEFAULT 'available',
    booked_by TEXT,
    booked_until TEXT,
    price REAL DEFAULT 5
  )`, (err) => {
    if (err) console.error('create slots table error', err);
  });

  const stmt = db.prepare(`INSERT OR IGNORE INTO slots (id, name, location, status, price) VALUES (?, ?, ?, ?, ?)`);
  // we use fixed ids to avoid duplicates when re-running
  slots.forEach((s, idx) => {
    const id = 100 + idx; // arbitrary id block to avoid collisions
    stmt.run(id, s.name, s.location, s.status, s.price, (err) => {
      if (err) {
        // ignore unique / other errors per row
      }
    });
  });
  stmt.finalize(() => {
    console.log('Seed script finished. Run GET /api/slots to confirm.');
    db.close();
  });
});
