// migrate_price.js - add price column and update some seed prices
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

function hasColumn(table, column) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) return reject(err);
      const found = rows && rows.some(r => r.name === column);
      resolve(found);
    });
  });
}

function runSql(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function migrate() {
  try {
    // Add price column if missing
    const exists = await hasColumn('slots', 'price');
    if (!exists) {
      console.log('Adding price column to slots table...');
      await runSql(`ALTER TABLE slots ADD COLUMN price REAL DEFAULT 5`);
    } else {
      console.log('slots.price already exists');
    }

    // Update seed prices for some rows (safe: will update if those names exist)
    console.log('Updating some slot prices (non-destructive)...');
    await runSql(`UPDATE slots SET price = 8 WHERE name LIKE 'C-%'`);
    await runSql(`UPDATE slots SET price = 5 WHERE name LIKE 'A-%'`);
    await runSql(`UPDATE slots SET price = 3 WHERE name LIKE 'D-%'`);

    console.log('Price migration complete.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    db.close();
  }
}

migrate();
