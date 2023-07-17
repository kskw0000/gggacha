const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const app = express();
const port = 3001;

app.use(cors({
  origin: ["http://localhost:3000", "https://gggacha.vercel.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));

app.use(express.json());

const SPREADSHEET_ID = '1neGERQ0bYIeQcU1yBiAhPVzyYFlIIZg1EdTntcdr_2A'; // Google Spreadsheet ID
const SETTINGS_SHEET_NAME = 'Settings Sheet Name'; // Name of the Settings Sheet in Google Spreadsheet
const WIN_CODES_SHEET_NAME = 'Win Codes Sheet Name'; // Name of the Win Codes Sheet in Google Spreadsheet
let settingsSheet, winCodesSheet;

async function setupSheetsApi() {
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: '19033603872-compute@developer.gserviceaccount.com',
    private_key: '',
  });

  await doc.loadInfo();

  settingsSheet = doc.sheetsByTitle[SETTINGS_SHEET_NAME]; // or use doc.sheetsById[id] or doc.sheetsByIndex[index]
  winCodesSheet = doc.sheetsByTitle[WIN_CODES_SHEET_NAME];

  // Initialize the sheets if necessary
  const settingsRows = await settingsSheet.getRows();
  if (settingsRows.length === 0) {
    await settingsSheet.setHeaderRow(['id', 'wins', 'rolls', 'winProbability']);
    await settingsSheet.addRow({ id: 1, wins: 0, rolls: 0, winProbability: 0.0 });
  }

  const winCodesRows = await winCodesSheet.getRows();
  if (winCodesRows.length === 0) {
    await winCodesSheet.setHeaderRow(['winCode', 'issuedAt']);
  }
}

// Start setting up the Google Sheets API
setupSheetsApi();

async function writeToDb(winCode) {
  const issuedAt = new Date().toISOString();
  await winCodesSheet.addRow({ winCode, issuedAt });
}

app.get('/gacha', async (req, res) => {
  try {
    const rows = await settingsSheet.getRows();
    const row = rows[0];

    if (row.rolls <= 0) {
      return res.status(400).json({ message: 'No more rolls available for today' });
    }

    let isWin = Math.random() < row.winProbability && row.wins > 0;
    let winCode = '';
    if (isWin) {
      winCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await writeToDb(winCode);
      row.wins -= 1;
    }

    row.rolls -= 1;
    await row.save();

    res.json({ isWin, winCode, availableWins: row.wins, availableRolls: row.rolls });
  } catch (err) {
    console.log("Promiseがエラーを生成しました：", err);
    res.status(500).send('An error occurred.');
  }
});

app.get('/gacha/info', async (req, res) => {
  try {
    const rows = await settingsSheet.getRows();
    const row = rows[0];
    res.json({ availableWins: row.wins, availableRolls: row.rolls, winProbability: row.winProbability });
  } catch (err) {
    console.log("Promiseがエラーを生成しました：", err);
    res.status(500).send('An error occurred.');
  }
});

app.post('/admin/update-gacha', async (req, res) => {
  const { wins, rolls, winProbability } = req.body;

  if (typeof wins !== 'number' || typeof rolls !== 'number' || typeof winProbability !== 'number') {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  try {
    const rows = await settingsSheet.getRows();
    const row = rows[0];

    row.wins = wins;
    row.rolls = rolls;
    row.winProbability = winProbability;
    await row.save();

    res.json({ message: 'Gacha updated successfully.' });
  } catch (err) {
    console.log("Promiseがエラーを生成しました：", err);
    res.status(500).send('An error occurred.');
  }
});

app.get('/admin/gacha-info', async (req, res) => {
  try {
    const rows = await settingsSheet.getRows();
    const row = rows[0];
    res.json({ availableWins: row.wins, availableRolls: row.rolls, winProbability: row.winProbability });
  } catch (err) {
    console.log("Promiseがエラーを生成しました：", err);
    res.status(500).send('An error occurred.');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
