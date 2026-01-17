// server.js (complete) - SQLite demo backend with payments, bookings, slots, violations
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const upload = multer({ dest: UPLOAD_DIR });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const dbFile = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Failed to open DB', err);
  } else {
    console.log('Connected to SQLite DB:', dbFile);
  }
});

// ---- LOGIN with attempts and simple lockout ----
// lock accounts for LOCK_MIN minutes if MAX_FAIL failures within window
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const LOCK_MIN = 10; // minutes
  const MAX_FAIL = 5;

  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  // check locked status
  db.get('SELECT locked_until FROM users WHERE username=?', [username], (err,urow) => {
    if (err) return res.status(500).json({ error: err.message });

    if (urow && urow.locked_until) {
      const until = new Date(urow.locked_until);
      if (until > new Date()) {
        return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
      } else {
        // clear lock if expired
        db.run('UPDATE users SET locked_until=NULL WHERE username=?', [username]);
      }
    }

    // fetch user
    db.get('SELECT username,role,password FROM users WHERE username=?', [username], (err2, userRow) => {
      if (err2) return res.status(500).json({ error: err2.message });

      if (!userRow) {
        // record failed attempt (unknown user still recorded)
        db.run('INSERT INTO login_attempts (username, success) VALUES (?,0)', [username]);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (userRow.password !== password) {
        // bad password -> record and check fail count
        db.run('INSERT INTO login_attempts (username, success) VALUES (?,0)', [username], function () {
          // count fails within window (15 minutes)
          db.get(`SELECT COUNT(*) as fails FROM login_attempts WHERE username=? AND success=0 AND attempt_time > datetime('now','-15 minutes')`, [username], (e,cnt) => {
            if (cnt && cnt.fails >= MAX_FAIL) {
              const lockUntil = new Date(Date.now() + LOCK_MIN * 60000).toISOString();
              db.run('UPDATE users SET locked_until=? WHERE username=?', [lockUntil, username]);
            }
            return res.status(401).json({ error: 'Invalid credentials' });
          });
        });
        return;
      }

      // success
      db.run('INSERT INTO login_attempts (username, success) VALUES (?,1)', [username]);
      // demo token (NOT for production)
      const token = Buffer.from(`${username}:${userRow.role}`).toString('base64');
      return res.json({ username: userRow.username, role: userRow.role, token });
    });
  });
});

// ---- SLOTS endpoints (include status) ----
// List slots
app.get('/api/slots', (req, res) => {
  db.all('SELECT id, name, location, status, booked_by, booked_until FROM slots', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single slot (optional)
app.get('/api/slots/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT id, name, location, status, booked_by, booked_until FROM slots WHERE id=?', [id], (err,row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Slot not found' });
    res.json(row);
  });
});

// Update slot status (admin demo)
app.post('/api/slots/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body; // 'available','booked','occupied','maintenance'
  if (!status) return res.status(400).json({ error: 'Missing status' });
  db.run('UPDATE slots SET status=? WHERE id=?', [status, id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ---- Booking cancel (simple) ----
app.post('/api/slots/:id/cancel', (req,res) => {
  const id = req.params.id;
  db.run('UPDATE slots SET status=?, booked_by=NULL, booked_until=NULL WHERE id=?', ['available', id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ---- Violations (image upload & location) ----
app.post('/api/violations/report', upload.single('image'), (req, res) => {
  const { reporter, slot_id, location } = req.body || {};
  let imagePath = null;
  if (req.file) {
    // rename to preserve extension
    const ext = path.extname(req.file.originalname) || '.jpg';
    const newName = req.file.filename + ext;
    const newPath = path.join(UPLOAD_DIR, newName);
    fs.renameSync(req.file.path, newPath);
    imagePath = '/uploads/' + newName;
  }
  db.run(`INSERT INTO violations (reporter, slot_id, image_path, location) VALUES (?,?,?,?)`,
    [reporter || null, slot_id || null, imagePath, location || null], function(err){
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, violationId: this.lastID });
  });
});

// List violations
app.get('/api/violations', (req, res) => {
  db.all('SELECT * FROM violations ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update violation status
app.post('/api/violations/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });
  db.run('UPDATE violations SET status=? WHERE id=?', [status, id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ---- Mock payment endpoints and booking logic ----
// Create a mock payment session (frontend calls before "payment")
app.post('/api/payment/create', (req, res) => {
  const { amount, username, slotId } = req.body || {};
  if (!amount || !username || !slotId) return res.status(400).json({ error: 'Missing amount, username or slotId' });

  // check slot availability
  db.get('SELECT status FROM slots WHERE id=?', [slotId], (err,row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Slot not found' });
    if (row.status !== 'available') return res.status(409).json({ error: 'Slot not available for booking' });

    const sessionId = 'sess_' + Date.now();
    res.json({ sessionId, paymentUrl: `http://mock-pay.local/pay/${sessionId}` });
  });
});

// Confirm payment (frontend calls after "payment" success)
// For demo: this marks slot booked, creates receipt and booking record
app.post('/api/payment/confirm', (req, res) => {
  const { sessionId, slotId, username, amount } = req.body || {};
  if (!sessionId || !slotId || !username) return res.status(400).json({ error: 'Missing fields' });

  db.get('SELECT status FROM slots WHERE id=?', [slotId], (err,row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Slot not found' });
    if (row.status !== 'available') return res.status(409).json({ error: 'Slot not available' });

    const until = new Date(Date.now() + 60*60*1000).toISOString();
    db.run('UPDATE slots SET status=?, booked_by=?, booked_until=? WHERE id=?', ['booked', username, until, slotId], function(e){
      if (e) return res.status(500).json({ error: e.message });

      const receiptId = 'rcpt_' + Date.now();
      db.run('INSERT INTO receipts (receipt_id, username, slot_id, amount) VALUES (?,?,?,?)', [receiptId, username, slotId, amount || 0], function(err2){
        if (err2) return res.status(500).json({ error: err2.message });
        db.run('INSERT INTO bookings (slot_id, username, amount, receipt_id) VALUES (?,?,?,?)', [slotId, username, amount || 0, receiptId], function(err3){
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ success:true, booked: { slotId, booked_by: username, booked_until: until }, receiptId });
        });
      });
    });
  });
});

// Booking history for a user
app.get('/api/bookings/:username', (req, res) => {
  const username = req.params.username;
  db.all('SELECT b.*, s.name as slot_name, s.location as slot_location FROM bookings b LEFT JOIN slots s ON b.slot_id=s.id WHERE b.username=? ORDER BY b.created_at DESC', [username], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---- Simple slot booking route (deprecated if using payment confirm) ----
// kept for compatibility but booking should normally go through payment confirm
app.post('/api/slots/:id/book', (req, res) => {
  const slotId = req.params.id;
  const { username, until } = req.body || {};
  if (!username) return res.status(400).json({ error: 'Missing username' });

  db.get('SELECT status FROM slots WHERE id=?', [slotId], (err,row)=>{
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Slot not found' });
    if (row.status !== 'available') return res.status(409).json({ error: 'Slot not available' });
    db.run('UPDATE slots SET status=?, booked_by=?, booked_until=? WHERE id=?', ['booked', username, until || new Date(Date.now()+3600*1000).toISOString(), slotId], function(e){
      if (e) return res.status(500).json({ error: e.message });
      res.json({ success: true });
    });
  });
});

// ---- Simple health check ----
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---- Start server ----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
