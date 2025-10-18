import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';

dotenv.config();


const app = express();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
});

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    return res.status(200).json({ message: "working" });
});




app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length > 0)
        return res.status(400).json({ message: 'Email already registered' });

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const insertUser = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertUser, [name, email, hashedPassword], (err2) => {
        if (err2) return res.status(500).json({ message: 'Error inserting user' });
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = results[0];
            // Compare the provided password with the hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.post("/api/rooms/:id/events", (req, res) => {
  const { id } = req.params;
  const { delta_count, source } = req.body;

  // 1) Validate
  if (delta_count === undefined || delta_count === null) {
    return res.status(400).json({ message: "delta_count is required" });
  }
  if (!Number.isInteger(delta_count)) {
    return res.status(400).json({ message: "delta_count must be an integer" });
  }
  if (!source) {
    return res.status(400).json({ message: "source is required" });
  }
  if (!['student', 'admin'].includes(source)) {
    return res.status(400).json({ message: "source must be 'student' or 'admin'" });
  }
  if (source === 'student' && delta_count > 15) {
    return res.status(400).json({ message: "Students can only add up to 15 at once" });
  }
  if (source === 'student' && delta_count < -15) {
    return res.status(400).json({ message: "Students can only remove up to 15 at once" });
  }

  // 2) If student, block when schedule says class now
  const classNowSql = `
    SELECT 1
    FROM regular_class_schedule rcs
    WHERE rcs.room_id = ?
      AND (
        (rcs.day_pattern='MWF'  AND DAYNAME(UTC_TIMESTAMP()) IN ('Monday','Wednesday','Friday')) OR
        (rcs.day_pattern='TT'   AND DAYNAME(UTC_TIMESTAMP()) IN ('Tuesday','Thursday')) OR
        (rcs.day_pattern='Daily') OR
        (rcs.day_pattern='Custom' AND FIND_IN_SET(DAYNAME(UTC_TIMESTAMP()), REPLACE(rcs.custom_days,' ', '')) > 0)
      )
      AND TIME(UTC_TIMESTAMP()) BETWEEN rcs.start_time AND rcs.end_time
    LIMIT 1
  `;
  db.query(classNowSql, [id], (e1, inClassRows) => {
    if (e1) return res.status(500).json({ message: "Database error (schedule check)" });
    if (source === 'student' && inClassRows.length) {
      return res.status(409).json({ message: "Class in progress. Room is not available." });
    }

    // 3) Capacity check
    const occSql = `
      SELECT r.capacity, COALESCE(rs.current_occupancy,0) AS current_occupancy
      FROM rooms r
      LEFT JOIN room_status rs ON rs.room_id = r.id
      WHERE r.id = ?
    `;
    db.query(occSql, [id], (e2, occRows) => {
      if (e2) return res.status(500).json({ message: "Database error (occupancy check)" });
      if (!occRows.length) return res.status(404).json({ message: "Room not found" });

      const { capacity, current_occupancy } = occRows[0];
      const newOcc = current_occupancy + delta_count;
      if (newOcc < 0) return res.status(400).json({ message: "Occupancy cannot be negative" });
      if (newOcc > capacity) return res.status(400).json({ message: "Cannot exceed room capacity" });

      // 4) Insert event; trigger updates room_status.current_occupancy
      const ins = `INSERT INTO occupancy_events (room_id, delta_count, source) VALUES (?, ?, ?)`;
      db.query(ins, [id, delta_count, source], (e3) => {
        if (e3) return res.status(500).json({ message: "Database error (insert event)" });

        // Optionally, reflect status in room_status.status too (free/in-class)
        const syncStatus = `
          UPDATE room_status rs
          SET rs.status = CASE
            WHEN EXISTS (
              SELECT 1 FROM regular_class_schedule rcs
              WHERE rcs.room_id = rs.room_id
                AND (
                  (rcs.day_pattern='MWF'  AND DAYNAME(UTC_TIMESTAMP()) IN ('Monday','Wednesday','Friday')) OR
                  (rcs.day_pattern='TT'   AND DAYNAME(UTC_TIMESTAMP()) IN ('Tuesday','Thursday')) OR
                  (rcs.day_pattern='Daily') OR
                  (rcs.day_pattern='Custom' AND FIND_IN_SET(DAYNAME(UTC_TIMESTAMP()), rcs.custom_days) > 0)
                )
                AND TIME(UTC_TIMESTAMP()) BETWEEN rcs.start_time AND rcs.end_time
            ) THEN 'in-class' ELSE 'free'
          END,
          rs.updated_utc = UTC_TIMESTAMP()
          WHERE rs.room_id = ?
        `;
        db.query(syncStatus, [id], () => {
          // ignore errors here; status is derivable anyway
          const out = `
            SELECT r.id AS room_id, r.name AS room_name, r.capacity,
                   COALESCE(rs.current_occupancy,0) AS current_occupancy,
                   rs.status, rs.updated_utc
            FROM rooms r
            LEFT JOIN room_status rs ON rs.room_id = r.id
            WHERE r.id = ?
          `;
          db.query(out, [id], (e4, rows) => {
            if (e4) return res.status(500).json({ message: "Database error (fetch updated)" });
            res.status(201).json({ message: "OK", room: rows[0] });
          });
        });
      });
    });
  });
});

app.get("/api/status/refresh", (_req, res) => {
  const sql = `
    UPDATE room_status rs
    SET rs.status =
    (
      SELECT CASE
        WHEN EXISTS (
          SELECT 1 FROM regular_class_schedule rcs
          WHERE rcs.room_id = rs.room_id
            AND (
              (rcs.day_pattern='MWF'  AND DAYNAME(UTC_TIMESTAMP()) IN ('Monday','Wednesday','Friday')) OR
              (rcs.day_pattern='TT'   AND DAYNAME(UTC_TIMESTAMP()) IN ('Tuesday','Thursday')) OR
              (rcs.day_pattern='Daily') OR
              (rcs.day_pattern='Custom' AND FIND_IN_SET(DAYNAME(UTC_TIMESTAMP()), rcs.custom_days) > 0)
            )
            AND TIME(UTC_TIMESTAMP()) BETWEEN rcs.start_time AND rcs.end_time
        ) THEN 'in-class' ELSE 'free'
      END
    ),
    rs.updated_utc = UTC_TIMESTAMP()
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ message: "Statuses refreshed", affectedRows: result.affectedRows });
  });
});

app.get("/buildings", (_req,res)=>{
  db.query(`SELECT code, name FROM buildings ORDER BY code`, (err, rows)=>{
    if (err) return res.status(500).json({message:"Database error"});
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No buildings found" });
    }
    res.json(rows);
  });
});

app.get("/room", (req, res) => {
  const sql = `
    SELECT 
      r.id AS room_id,
      b.code AS building,
      r.name AS room_name,
      r.capacity,
      COALESCE(rs.current_occupancy, 0) AS current_occupancy,
      (r.capacity - COALESCE(rs.current_occupancy, 0)) AS available_seats,
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM regular_class_schedule rcs
          WHERE rcs.room_id = r.id
            AND (
              (rcs.day_pattern='MWF'  AND DAYNAME(UTC_TIMESTAMP()) IN ('Monday','Wednesday','Friday')) OR
              (rcs.day_pattern='TT'   AND DAYNAME(UTC_TIMESTAMP()) IN ('Tuesday','Thursday')) OR
              (rcs.day_pattern='Daily') OR
              (rcs.day_pattern='Custom' AND FIND_IN_SET(DAYNAME(UTC_TIMESTAMP()), rcs.custom_days) > 0)
            )
            AND TIME(UTC_TIMESTAMP()) BETWEEN rcs.start_time AND rcs.end_time
        ) THEN 1 ELSE 0
      END AS class_in_progress
    FROM rooms r
    JOIN buildings b ON b.id = r.building_id
    LEFT JOIN room_status rs ON rs.room_id = r.id
    ORDER BY b.code, r.name;
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (!rows?.length) return res.status(404).json({ message: "No rooms found" });

    const inProgress = [];
    const free = [];

    for (const row of rows) {
      if (row.class_in_progress === 1) {
        inProgress.push(row);
      } else if (row.available_seats > 0) {
        free.push(row);
      }
    }
    res.json({ inProgress, free });
  });
});


app.post("/api/regular-classes", (req, res) => {
  const { room_id, class_name, day_pattern, custom_days, start_time, end_time } = req.body;

  // basic validation
  if (!room_id || !class_name || !day_pattern || !start_time || !end_time) {
    return res.status(400).json({ message: "room_id, class_name, day_pattern, start_time, end_time are required" });
  }
  const allowed = ["MWF", "TT", "Daily", "Custom"];
  if (!allowed.includes(day_pattern)) {
    return res.status(400).json({ message: "day_pattern must be one of MWF, TT, Daily, Custom" });
  }
  if (day_pattern === "Custom" && (!custom_days || !custom_days.trim())) {
    return res.status(400).json({ message: "custom_days is required when day_pattern = Custom" });
  }

  const sql = `
    INSERT INTO regular_class_schedule
      (room_id, class_name, day_pattern, custom_days, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [room_id, class_name, day_pattern, custom_days ?? null, start_time, end_time], (err, result) => {
    if (err) {
      console.error("Insert regular_class_schedule error:", err); // helpful log
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "Regular class added", id: result.insertId });
  });
});

app.get("/api/regular-classes", (req, res) => {
  const q = `
    SELECT rcs.*, r.name AS room_name, b.code AS building_code, b.name AS building_name
    FROM regular_class_schedule rcs
    JOIN rooms r ON r.id = rcs.room_id
    JOIN buildings b ON b.id = r.building_id
    ORDER BY b.code, r.name, rcs.start_time
  `;
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(rows);
  });
});

app.delete("/api/regular-classes/:id", (req, res) => {
  db.query("DELETE FROM regular_class_schedule WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  });
});


app.get("/rooms/:id", (req,res)=>{
  const q = `SELECT r.id AS room_id, r.name AS room_name, r.capacity,
           COALESCE(rs.current_occupancy,0) AS current_occupancy, rs.updated_utc,
           /* 1 if a class is currently in progress, else 0 */
           CASE 
             WHEN EXISTS (
               SELECT 1 
               FROM class_blocks cb
               WHERE cb.room_id = r.id
                 AND UTC_TIMESTAMP() >= cb.start_utc
                 AND UTC_TIMESTAMP() <  cb.end_utc
             ) THEN 1 ELSE 0
           END AS class_in_progress,
           /* Get the end time of current class if in progress */
           (
             SELECT cb.end_utc 
             FROM class_blocks cb
             WHERE cb.room_id = r.id
               AND UTC_TIMESTAMP() >= cb.start_utc
               AND UTC_TIMESTAMP() < cb.end_utc
             LIMIT 1
           ) AS class_end_utc,
           /* Get the title of current class if in progress */
           (
             SELECT cb.title 
             FROM class_blocks cb
             WHERE cb.room_id = r.id
               AND UTC_TIMESTAMP() >= cb.start_utc
               AND UTC_TIMESTAMP() < cb.end_utc
             LIMIT 1
           ) AS class_title
    FROM rooms r LEFT JOIN room_status rs ON r.id = rs.room_id
    WHERE r.id = ?`;
  db.query(q, [req.params.id], (err, rows)=> {
    if (err) return res.status(500).json({message:"Database error"});
    if (!rows.length) return res.status(404).json({message:"Not found"});
    res.json(rows[0]);
  });
});



app.get("/update-room-status", (req, res) => {
  const sql = `
    UPDATE room_status rs
    JOIN (
      SELECT rcs.room_id,
             CASE
               WHEN (
                 (rcs.day_pattern = 'MWF' AND DAYNAME(UTC_TIMESTAMP()) IN ('Monday','Wednesday','Friday'))
                 OR (rcs.day_pattern = 'TT' AND DAYNAME(UTC_TIMESTAMP()) IN ('Tuesday','Thursday'))
                 OR (rcs.day_pattern = 'Daily')
                 OR (rcs.day_pattern = 'Custom' AND FIND_IN_SET(DAYNAME(UTC_TIMESTAMP()), rcs.custom_days))
               )
               AND TIME(UTC_TIMESTAMP()) BETWEEN rcs.start_time AND rcs.end_time
               THEN 'in-class'
               ELSE 'free'
             END AS new_status
      FROM regular_class_schedule rcs
    ) AS s
    ON rs.room_id = s.room_id
    SET rs.status = s.new_status,
        rs.updated_utc = UTC_TIMESTAMP();
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ message: "Room statuses updated", affectedRows: result.affectedRows });
  });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
