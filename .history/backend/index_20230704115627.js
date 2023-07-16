const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3001;

app.use(cors({
  origin: "http://localhost:3000",  // フロントエンドのURLを設定
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true  // Access-Control-Allow-Credentials: trueをセット
}));

app.use(express.json());

const creds = require('./your-servie-key.json');
const doc = new GoogleSpreadsheet('1neGERQ0bYIeQcU1yBiAhPVzyYFlIIZg1EdTntcdr_2A');

let db = new sqlite3.Database('./gacha.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS gacha_settings (
      id INTEGER PRIMARY KEY,
      wins INTEGER,
      rolls INTEGER,
      winProbability REAL
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        db.get(`SELECT COUNT(id) as count FROM gacha_settings`, (err, row) => {
          if (err) {
            console.error(err.message);
          } else if (row.count === 0) {
            db.run(`INSERT INTO gacha_settings (id, wins, rolls, winProbability) VALUES (1, 0, 0, 0.0)`);
          }
        });
      }
    });
    db.run(`CREATE TABLE IF NOT EXISTS win_codes (
      winCode TEXT PRIMARY KEY,
      issuedAt TEXT
    )`);
  }
});

async function writeToSheet(winCode) {
  await doc.authorizeServiceAccount({
    client_email: creds.client_email,
    private_key: creds.private_key,
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow({ 'Win Code': winCode });
}

function writeToDb(winCode) {
  const issuedAt = new Date().toISOString();
  db.run(`INSERT INTO win_codes (winCode, issuedAt) VALUES (?, ?)`, [winCode, issuedAt], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

app.get('/gacha', async (req, res) => {
  db.get(`SELECT wins, rolls, winProbability FROM gacha_settings WHERE id = 1`, async (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('An error occurred.');
    } else {
      if (row.rolls <= 0) {
        return res.status(400).json({ message: 'No more rolls available for today' });
      }

      let isWin = Math.random() < row.winProbability && row.wins > 0;
      let winCode = '';
      if (isWin) {
        winCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await writeToSheet(winCode);
        writeToDb(winCode);
        row.wins -= 1;
      }
      
      row.rolls -= 1;

      db.run(`UPDATE gacha_settings SET wins = ?, rolls = ? WHERE id = 1`, [row.wins, row.rolls], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('An error occurred.');
        } else {
          res.json({ isWin, winCode, availableWins: row.wins, availableRolls: row.rolls });
        }
      });
    }
  });
});

app.get('/gacha/info', async (req, res) => {
  db.get(`SELECT wins, rolls, winProbability FROM gacha_settings WHERE id = 1`, (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('An error occurred.');
    } else {
      res.json({ availableWins: row.wins, availableRolls: row.rolls, winProbability: row.winProbability });
    }
  });
});

app.post('/admin/update-gacha', async (req, res) => {
  const { wins, rolls, winProbability } = req.body;

  if (typeof wins !== 'number' || typeof rolls !== 'number' || typeof winProbability !== 'number') {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  db.run(`UPDATE gacha_settings SET wins = ?, rolls = ?, winProbability = ? WHERE id = 1`, [wins, rolls, winProbability], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('An error occurred.');
    } else {
      res.json({ message: 'Gacha updated successfully.' });
    }
  });
});

app.get('/admin/gacha-info', async (req, res) => {
  db.get(`SELECT wins, rolls, winProbability FROM gacha_settings WHERE id = 1`, (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('An error occurred.');
    } else {
      res.json({ availableWins: row.wins, availableRolls: row.rolls, winProbability: row.winProbability });
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
