const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// use service account creds
const creds = require('./your-service-key.json');
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

  if (availableRolls <= 0) {
    return res.status(400).json({ message: 'No more rolls available for today' });
  }

  settingsRow.availableRolls = availableRolls - 1;

  let isWin = Math.random() < 0.1 && availableWins > 0;
  let winCode = '';
  if (isWin) {
    settingsRow.availableWins = availableWins - 1;
    winCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    await writeToSheet(winCode);
  }

  await settingsRow.save();
  res.json({ isWin, winCode, availableWins: settingsRow.availableWins, availableRolls: settingsRow.availableRolls });
});

app.get('/gacha/info', async (req, res) => {
  try {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const settingsRow = rows[0];
    res.json({ availableWins: settingsRow.availableWins, availableRolls: settingsRow.availableRolls });
  } catch (error) {
    console.error('Error during get gacha info:', error);
    res.status(500).send('An error occurred.');
  }
});

app.post('/gacha/settings', async (req, res) => {
  try {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const settingsRow = rows[0];
    settingsRow.availableWins = req.body.availableWins;
    settingsRow.availableRolls = req.body.availableRolls;
    await settingsRow.save();
    res.send('Settings saved successfully.');
  } catch (error) {
    console.error('Error during save gacha settings:', error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
