const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = 3001;

app.use(cors());

let availableWins = 5;
let availableRolls = 100;
let resetTime = Date.now() + 24*60*60*1000;

function generateRandomCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
    keyFilename: './keys/your-service-account-key.json', // Service Accountのキーファイルへのパスを更新
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function writeToSheet(winCode) {
    const authClient = await auth.getClient();

    const request = {
        spreadsheetId: '1neGERQ0bYIeQcU1yBiAhPVzyYFlIIZg1EdTntcdr_2A', // スプレッドシートIDを更新
        range: 'Sheet1!A:A', // 範囲を更新
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[winCode]],
        },
        auth: authClient,
    };

    await sheets.spreadsheets.values.append(request);
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
