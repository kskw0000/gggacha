

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
