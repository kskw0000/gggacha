const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
const port = 3001;

app.use(cors({
  origin: ["http://localhost:3000", "https://gggacha.vercel.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));

app.use(express.json());

let db = mysql.createConnection({
  host: '34.146.136.225',
  user: 'root',
  password: 'koshikwa0514',
  database: 'gacha'
});

db.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + db.threadId);

  db.query(`CREATE TABLE IF NOT EXISTS gacha_settings (
    id INT PRIMARY KEY,
    wins INT,
    rolls INT,
    winProbability DECIMAL(10,2)
  )`, (err) => {
    if (err) {
      console.error(err.sqlMessage);
    } else {
      db.query(`SELECT COUNT(id) as count FROM gacha_settings`, (err, results) => {
        if (err) {
          console.error(err.sqlMessage);
        } else if (results[0].count === 0) {
          db.query(`INSERT INTO gacha_settings (id, wins, rolls, winProbability) VALUES (1, 0, 0, 0.0)`);
        }
      });
    }
  });

  db.query(`CREATE TABLE IF NOT EXISTS win_codes (
    winCode VARCHAR(255) PRIMARY KEY,
    issuedAt DATETIME
  )`, (err) => {
    if (err) {
      console.error(err.sqlMessage);
    }
  });
});

function writeToDb(winCode) {
  const issuedAt = new Date().toISOString();
  db.query(`INSERT INTO win_codes (winCode, issuedAt) VALUES (?, ?)`, [winCode, issuedAt], (err) => {
    if (err) {
      console.error(err.sqlMessage);
    }
  });
}

app.get('/gacha', async (req, res) => {
  db.query(`SELECT wins, rolls, winProbability FROM gacha_settings WHERE id = 1`, (err, results) => {
    if (err) {
      console.error(err.sqlMessage);
      res.status(500).send('An error occurred.');
    } else {
      let row = results[0];

      if (row.rolls <= 0) {
        return res.status(400).json({ message: 'No more rolls available for today' });
      }

      let isWin = Math.random() < row.winProbability && row.wins > 0;
      let winCode = '';
      if (isWin) {
        winCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        writeToDb(winCode);
        row.wins -= 1;
      }

      row.rolls -= 1;

      db.query(`UPDATE gacha_settings SET wins = ?, rolls = ? WHERE id = 1`, [row.wins, row.rolls], (err) => {
        if (err) {
          console.error(err.sqlMessage);
          res.status(500).send('An error occurred.');
        } else {
          res.json({ isWin, winCode, availableWins: row.wins, availableRolls: row.rolls });
        }
      });
    }
  });
});

app.get('/gacha/info', async (req, res) => {
  db.query(`SELECT wins, rolls, winProbability FROM gacha_settings WHERE id = 1`, (err, results) => {
    if (err) {
      console.error(err.sqlMessage);
      res.status(500).send('An error occurred.');
    } else {
      let row = results[0];
      res.json({ availableWins: row.wins, availableRolls: row.rolls, winProbability: row.winProbability });
    }
  });
});

app.post('/admin/update-gacha', async (req, res) => {
  const { wins, rolls, winProbability } = req.body;

  if (typeof wins !== 'number' || typeof rolls !== 'number' || typeof winProbability !== 'number') {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  db.query(`UPDATE gacha_settings SET wins = ?, rolls = ?, winProbability = ? WHERE id = 1`, [wins, rolls, winProbability], (err) => {
    if (err) {
      console.error(err.sqlMessage);
      res.status(500).send('An error occurred.');
    } else {
      res.json({ message: 'Gacha updated successfully.' });
    }
  });
});

app.get('/admin/gacha-info', async (req, res) => {
  db.query(`SELECT wins, rolls, winProbability FROM gacha_settings WHERE id = 1`, (err, results) => {
    if (err) {
      console.error(err.sqlMessage);
      res.status(500).send('An error occurred.');
    } else {
      let row = results[0];
      res.json({ availableWins: row.wins, availableRolls: row.rolls, winProbability: row.winProbability });
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
