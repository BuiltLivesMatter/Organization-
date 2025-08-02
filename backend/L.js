
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// Use your Neon DB credentials here
const pool = new Pool({
  connectionString: 'postgres://USERNAME:PASSWORD@HOST/dbname?sslmode=require'
});

app.use(cors());
app.use(bodyParser.json());

// Generate unique Member ID
const generateMemberID = async () => {
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  const count = parseInt(rows[0].count) + 1;
  return `BLM-${String(count).padStart(4, '0')}`;
};

// Sign Up Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const member_id = await generateMemberID();
  await pool.query(
    'INSERT INTO users (name, email, password, member_id) VALUES ($1, $2, $3, $4)',
    [name, email, password, member_id]
  );
  res.json({ message: 'Signup successful', member_id });
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email, password]);
  if (rows.length > 0) {
    res.json({ success: true, user: rows[0] });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Job Application Route
app.post('/apply', async (req, res) => {
  const { name, email, role, message } = req.body;
  await pool.query(
    'INSERT INTO applications (name, email, role, message) VALUES ($1, $2, $3, $4)',
    [name, email, role, message]
  );
  res.json({ message: 'Application submitted successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
