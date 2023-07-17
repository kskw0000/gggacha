const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3001;

// YOUR_LINE_CHANNEL_ID, YOUR_LINE_CHANNEL_SECRET, YOUR_REDIRECT_URI を適切な値に書き換えてください
const CLIENT_ID = '2000154484';
const CLIENT_SECRET = '3c1a517865462a8f94fa9f53609dd6ee';
const REDIRECT_URI = 'https://gggacha.vercel.app/';

app.use(cors({
  origin: ["http://localhost:3000", "https://gggacha.vercel.app"], 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));

app.use(express.json());

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
      issuedAt TEXT,
      userId TEXT
    )`, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
    // user_tokens テーブルを作成
    db.run(`CREATE TABLE IF NOT EXISTS user_tokens (
      userId TEXT PRIMARY KEY,
      accessToken TEXT
    )`, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }
});


function writeToDb(winCode, userId) {
  const issuedAt = new Date().toISOString();
  db.run(`INSERT INTO win_codes (winCode, issuedAt, userId) VALUES (?, ?, ?)`, [winCode, issuedAt, userId], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

app.get('/auth/line', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://api.line.me/oauth2/v2.1/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = response.data.access_token;

    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userId = profileResponse.data.userId;

    // 保存: ユーザーIDとアクセストークン
    db.run(`INSERT OR REPLACE INTO user_tokens (userId, accessToken) VALUES (?, ?)`, [userId, accessToken], (err) => {
      if (err) {
        console.error(err.message);
      }
    });

    res.json({ message: 'Authentication successful', userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred during authentication.');
  }
});

app.get('/gacha', async (req, res) => {
  const userId = req.query.userId;

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
        writeToDb(winCode, userId);
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
