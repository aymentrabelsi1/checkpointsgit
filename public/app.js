const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Open (or create) SQLite database file
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE
)`);

// Simple route example
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Create a user (Create)
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
  db.run(sql, [name, email], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, email });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
const form = document.getElementById('userForm');
const usersList = document.getElementById('usersList');

// Fetch and display users from backend
async function fetchUsers() {
  usersList.innerHTML = '<li>Loading users...</li>';
  try {
    const res = await fetch('/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    const users = await res.json();

    if (users.length === 0) {
      usersList.innerHTML = '<li>No users found</li>';
      return;
    }

    usersList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.name} (${user.email})`;
      usersList.appendChild(li);
    });
  } catch (err) {
    usersList.innerHTML = `<li style="color:red;">${err.message}</li>`;
  }
}

// Submit form handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (!name || !email) return;

  try {
    const res = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert('Error: ' + errorData.error);
      return;
    }

    form.reset();
    fetchUsers();
  } catch (err) {
    alert('Request failed: ' + err.message);
  }
});

// Load users when page loads
fetchUsers();
