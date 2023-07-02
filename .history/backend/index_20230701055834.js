const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const app = express();
const port = 3001;

app.use(cors());

let availableWins = 5;
let availableRolls = 100;
let resetTime = Date.now() + 24*60*60*1000;

function generateRandomCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// use service account creds
const creds = require('./keys/your-service-key.json'); // サービスアカウントキーファイルへのパスを更新

const doc = new GoogleSpreadsheet('1neGERQ0bYIeQcU1yBiAhPVzyYFlIIZg1EdTntcdr_2A', {
    email: creds.client_email,
    key: creds.private_key,
});

async function writeToSheet(winCode) {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // index is sheet order in the spreadsheet

    await sheet.addRow({ 'Win Code': winCode }); // カラム名'Win Code'はあなたのスプレッドシートの設定に応じて変更してください。
}

app.get('/gacha', async (req, res) => {
  if (availableRolls <= 0) {
    return res.status(400).json({ message: 'No more rolls available for today' });
  }

  if (Date.now() >= resetTime) {
    availableWins = 5;
    availableRolls = 100;
    resetTime = Date.now() + 24*60*60*1000;
  }

  availableRolls -= 1;

  let isWin = Math.random() < 0.1 && availableWins > 0;
  let winCode = '';
  if (isWin) {
    availableWins -= 1;
    winCode = generateRandomCode();
    await writeToSheet(winCode);
  }

  res.json({ isWin, winCode, availableWins, availableRolls });
});

app.get('/gacha/info', (req, res) => {
    res.json({ availableWins, availableRolls });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
