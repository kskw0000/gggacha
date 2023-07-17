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

const SPREADSHEET_ID = '1neGERQ0bYIeQcU1yBiAhPVzyYFlIIZg1EdTntcdr_2A'; 
const SETTINGS_SHEET_NAME = 'Settings Sheet Name'; 
const WIN_CODES_SHEET_NAME = 'Win Codes Sheet Name'; 
let settingsSheet, winCodesSheet;

async function setupSheetsApi() {
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: '19033603872-compute@developer.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCr3Gu75VFvz5DJ\nt43ZH2cB2qZ41GKev4zYHdvt4fHb6XPQoAansfH10dpaY56SAO5A84Hd3TEVqbTb\n+2YCVk9PMb++DiDRtYu8khL4okcO3MXxouZtl0mOMRqWwo8zoCBw6ea3Wn6tCxZd\nuX0/CLE+SEpBz2vZRXdLAG1zXCZvG40FbuI27s1+phTOJUsVKeI/sW8oWhykQN6s\nGGhTkw+UMTv5jKhvmzpSQkvqveoFT/g4/1mE2SMyZzm8TDBjSM+KSqeD19cs8laD\n8gxTz9QzDlAMJImhZUmItQQWdMDYBa5lxAx3ZQhKk7XIHsDznF2iXVQEsricNqa5\nuZ/iFz41AgMBAAECggEADnas/HG2slXCJi/T+MdrSF0p8HZTXG/bfx64MSN4Ut0p\nWY/2L2vK5LjGCyBiKoB4jK/RqKXiaSPQrEjSk3THFO+nZuvSeEOyoGqcvR8PIuGS\nqRzgDq4SSyy3w6NZIOujf004FQtBKPgLaFThhQoKvKah1TsLJQxzFzVQgMprE6OX\nH52ZN8fRor2S4+2T4BQtFiZUE6qKskVktJJ3jkTiKi3i9pTZOKNB5yanuKPuMnmV\n9ulqO122UY7fceFsvGQfkd04utZOsVWRSx0JkvxCL7hgFqgoJa1M5hXxJ+eqYYC8\n4vBzB52olBcsdJJ66Trg8SMWIxpQob8uSIiIB3YKwQKBgQDXixcE2rDelZwvl43R\nByBqALQRQaEXbRY/PuLXrg4wIBcgoypqp3YYB9JKytSHFVJ+SbWbYmZmYEYbeuoh\nR2mM064UlM9EyIRtamiCZdoDNdOdMxOMozZyTa8aqRwRGgvUERImWvaNJhufnbuf\nwMHrzteemsUnB23HO4EzRAFJIQKBgQDMHmKv4Sv5g2dwIdiJOaQjjCKC3uto7D/E\nBrHJs9FMMzwxFY0dSs2j9E/79XtMaFSHoI0bXllRJkUuprZXtb5C+BzEUPGGjMxJ\n735SKUkxOx7P8sq5vuwXzHKUnIkDmwUu495Xo2WJhPoFsz5qnesfapPURU8fEsky\nT1+YaPvulQKBgQDN2Ct3m1Lmf4LVgKsTQPcXxOwyvraVpLxmUixZRgSOuVbc+HZ9\nvMfvUyjl/KbTCu3pZYNmjaa1hqPtgokulwCaWV4akbMQQV8XD1QXlCWMg09BBZJZ\n8VUB/GaJ047WVkWNlW/76UskqYwf94dDndaU2Mja03wNNe8FIjLVPtDrgQKBgCxW\nvWEvLHo6zRFSiNLmLn16R1TeT4yvJPrT6XLDGMfQqVaQM+MVCK6At48nt+zVDOeZ\nPI2hZQ13nrePhzRuSjIJ61XJr21m0EmPOIVoannDOeI5/0dx7Z8NziXyCuE5n1qc\nLQQkfj3tINJ0KS7HtvdQE2Sc2Z8KWaIQE9frli4xAoGAPE4Bpukcg5RQBNnuJE5O'
  });

  await doc.loadInfo();

  settingsSheet = doc.sheetsByTitle[SETTINGS_SHEET_NAME];
  winCodesSheet = doc.sheetsByTitle[WIN_CODES_SHEET_NAME];
}

setupSheetsApi();

app.get('/api/settings', async (req, res) => {
  const rows = await settingsSheet.getRows();
  res.send(rows.map(row => row._rawData));
});

app.get('/api/win-codes', async (req, res) => {
  const rows = await winCodesSheet.getRows();
  res.send(rows.map(row => row._rawData));
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
