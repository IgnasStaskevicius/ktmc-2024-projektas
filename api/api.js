const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const cors = require('cors');

// Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'final',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected');
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// JWT
const JWT_SECRET = 'your_jwt_secret';

// Middleware for Authentication
function authenticate(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Access denied');
  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}


// GET logged-in user details ("/users/me")
app.get('/users/me', authenticate, (req, res) => {
  const userId = req.user.id;
  
  db.query('SELECT id, username, email FROM vartotojai WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database query failed');
    }
    
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    res.json(results[0]);  // Send the user's details
  });
});



// GET renginiai
app.get('/renginiai', (req, res) => {
  db.query('SELECT * FROM renginiai', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// GET renginiai by ID
app.get('/renginiai/:id', (req, res) => {
  db.query('SELECT * FROM renginiai WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

// CREATE new renginiai
app.post('/renginiai', authenticate, (req, res) => {
  const { vartotojai_id, pavadinimas, time, kategorija, img, vieta } = req.body;
  db.query(
    'INSERT INTO renginiai (vartotojai_id, pavadinimas, time, kategorija, img, vieta) VALUES (?, ?, ?, ?, ?, ?)',
    [ vartotojai_id, pavadinimas, time, kategorija, img, vieta],
    (err, results) => {
      if (err) throw err;
      res.json({ id: results.insertId });
    }
  );
});

// UPDATE renginiai
app.put('/renginiai/:id', (req, res) => {
  const { pavadinimas, time, kategorija, img, vieta } = req.body;
  db.query(
    'UPDATE renginiai SET pavadinimas = ?, time = ?, kategorija = ?, img = ?, vieta = ? WHERE id = ?',
    [pavadinimas, time, kategorija, img, vieta, req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json({ updated: true });
    }
  );
});

// DELETE renginiai
app.delete('/renginiai/:id', (req, res) => {
  db.query('DELETE FROM renginiai WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.json({ deleted: true });
  });
});


// GET all vartotojai
app.get('/users', (req, res) => {
  db.query('SELECT * FROM vartotojai', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// GET vartotojai by ID
app.get('/users/:id', (req, res) => {
  db.query('SELECT * FROM vartotojai WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

// CREATE vartotojai
app.post('/users', async (req, res) => {
  const { username, password, email, roles_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query(
    'INSERT INTO vartotojai (username, password, email, roles_id, block) VALUES (?, ?, ?, ?, 0)',
    [username, hashedPassword, email, roles_id],
    (err, results) => {
      if (err) throw err;
      res.json({ id: results.insertId });
    }
  );
});

// UPDATE vartotojai
app.put('/users/:id', (req, res) => {
  const { username, email, roles_id, block } = req.body;
  db.query(
    'UPDATE vartotojai SET username = ?, email = ?, roles_id = ?, block = ? WHERE id = ?',
    [username, email, roles_id, block, req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json({ updated: true });
    }
  );
});

// DELETE vartotojai
app.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM vartotojai WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.json({ deleted: true });
  });
});

// LOGIN vartotojai
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM vartotojai WHERE username = ?', [username], async (err, results) => {
    if (err) throw err;

    if (results.length && (await bcrypt.compare(password, results[0].password))) {
      const token = jwt.sign(
        { id: results[0].id, username: results[0].username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: {
          id: results[0].id,
          username: results[0].username,
          email: results[0].email,
          roles_id: results[0].roles_id,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});



// GET all roles
app.get('/roles', (req, res) => {
  db.query('SELECT * FROM roles', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


// GET all vertinimai
app.get('/vertinimas', (req, res) => {
  db.query('SELECT * FROM vertinimas', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// GET vertinimai for a specific renginiai
app.get('/vertinimas/renginys/:renginiai_id', (req, res) => {
  db.query(
    'SELECT * FROM vertinimas WHERE renginiai_id = ?',
    [req.params.renginiai_id],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});

// Endpoint for fetching events with average vertinimai
app.get('/events_with_ratings', (req, res) => {
  const { category, startTime, endTime, minRating } = req.query;

  let query = `
    SELECT renginiai.id, renginiai.pavadinimas, renginiai.kategorija, renginiai.time, 
           renginiai.vieta, renginiai.img, 
           IFNULL(AVG(vertinimas.rating), 0) AS average_rating
    FROM renginiai
    LEFT JOIN vertinimas ON renginiai.id = vertinimas.renginiai_id
  `;

  const conditions = [];
  if (category) {
    conditions.push(`renginiai.kategorija = '${category}'`);
  }
  if (startTime) {
    conditions.push(`renginiai.time >= '${startTime}'`);
  }
  if (endTime) {
    conditions.push(`renginiai.time <= '${endTime}'`);
  }
  if (minRating) {
    conditions.push(`AVG(vertinimas.rating) >= ${minRating}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY renginiai.id';

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});


// CREATE a new verinimas

app.post('/vertinimas', authenticate, (req, res) => {
  const { vartotojai_id, renginiai_id, rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).send('Rating must be between 1 and 5');
  }

  db.query(
    'SELECT * FROM vertinimas WHERE vartotojai_id = ? AND renginiai_id = ?',
    [vartotojai_id, renginiai_id],
    (err, results) => {
      if (err) {
        return res.status(500).send('Database error');
      }

      if (results.length > 0) {
        return res.status(400).send('You have already rated this event');
      }

      const query = 'INSERT INTO vertinimas (vartotojai_id, renginiai_id, rating) VALUES (?, ?, ?)';
      db.query(query, [vartotojai_id, renginiai_id, rating], (err, result) => {
        if (err) {
          return res.status(500).send('Failed to insert rating');
        }

        res.status(201).send('Rating added successfully');
      });
    }
  );
});


// UPDATE a verinimas
app.put('/vertinimas/:id', authenticate, (req, res) => {
  const { rating } = req.body;
  if (rating < 1 || rating > 5) {
    return res.status(400).send('Rating must be between 1 and 5');
  }
  db.query(
    'UPDATE vertinimas SET rating = ? WHERE id = ?',
    [rating, req.params.id],
    (err, results) => {
      if (err) throw err;
      res.json({ updated: true });
    }
  );
});

// DELETE a vertinimas
app.delete('/vertinimas/:id', authenticate, (req, res) => {
  db.query('DELETE FROM vertinimas WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.json({ deleted: true });
  });
});



// ___________________________________________________________________

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
