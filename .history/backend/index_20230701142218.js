const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const creds = require('./your-servie-key.json');
const doc = new GoogleSpreadsheet('1neGERQ0bYIeQcU1yBiAhPVzyYFlIIZg1EdTntcdr_2A');

async function writeToSheet(winCode) {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow({ 'Win Code': winCode });
}

app.get('/gacha', async (req, res) => {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const settingsRow = rows[0];

  const availableRolls = Number(settingsRow.availableRolls);
  const availableWins = Number(settingsRow.availableWins);
  const winProbability = Number(settingsRow.winProbability) / 100;

  if (availableRolls <= 0) {
    return res.status(400).json({ message: 'No more rolls available for today' });
  }

  settingsRow.availableRolls = String(availableRolls - 1);

  let isWin = Math.random() < winProbability && availableWins > 0;
  let winCode = '';
  if (isWin) {
    settingsRow.availableWins = String(availableWins - 1);
    winCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    await writeToSheet(winCode);
  }

  await settingsRow.save();
  res.json({ isWin, winCode, availableWins: Number(settingsRow.availableWins), availableRolls: Number(settingsRow.availableRolls) });
});

app.get('/admin/gacha-info', async (req, res) => {
  try {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const settingsRow = rows[0];
    res.json({ availableWins: Number(settingsRow.availableWins), availableRolls: Number(settingsRow.availableRolls), winProbability: Number(settingsRow.winProbability) });
  } catch (error) {
    console.error('Error during get gacha info:', error);
    res.status(500).send('An error occurred.');
  }
});

app.post('/admin/update-gacha', async (req, res) => {
  const { wins, rolls, winProbability } = req.body;

  if (typeof wins !== 'number' || typeof rolls !== 'number' || typeof winProbability !== 'number') {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const settingsRow = rows[0];
  settingsRow.availableWins = String(wins);
  settingsRow.availableRolls = String(rolls);
  settingsRow.winProbability = String(winProbability);
  await settingsRow.save();

  res.json({ message: 'Gacha updated successfully.' });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
