const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // CORSをインポート
const { google } = require('googleapis'); // 追加
const app = express();
const port = 3001;

app.use(cors()); // これで全てのエンドポイントにCORSを適用

let db = new sqlite3.Database('mydb.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

let availableWins = 5;
let availableRolls = 100;
let resetTime = Date.now() + 24*60*60*1000; // 現在時刻から24時間後をリセット時間として設定

function generateRandomCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const sheets = google.sheets('v4'); // 追加
const auth = new google.auth.GoogleAuth({ // 追加
    keyFilename: '/path/to/your/service-account-file.json', // サービスアカウントキーへのパス
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function writeToSheet(winCode) { // 追加
    const authClient = await auth.getClient();

    const request = {
        spreadsheetId: 'my-spreadsheet-id',  // replace with your spreadsheet ID
        range: 'Sheet1!A1',  // update with your sheet name and range
        valueInputOption: 'USER_ENTERED', // values will be parsed as if the user typed them into the UI
        resource: {
            values: [[winCode]],
        },
        auth: authClient,
    };

    await sheets.spreadsheets.values.append(request);
}

app.get('/gacha', async (req, res) => { // 非同期に変更
  if (availableRolls <= 0) {
    return res.status(400).json({ message: 'No more rolls available for today' });
  }

  if (Date.now() >= resetTime) { // リセット時間に達した場合
    availableWins = 5;
    availableRolls = 100;
    resetTime = Date.now() + 24*60*60*1000; // リセット時間を再設定
  }

  availableRolls -= 1;

  // 10%の確率で当たりを出すが、当たりがすでにすべて出た場合は必ずハズレ
  let isWin = Math.random() < 0.1 && availableWins > 0;
  let winCode = '';
  if (isWin) {
    availableWins -= 1;
    winCode = generateRandomCode();
    await writeToSheet(winCode); // 当選した場合にGoogle Sheetsにデータを書き込む
  }

  res.json({ isWin, winCode, availableWins, availableRolls }); // winCodeを追加
});

//...
app.get('/gacha/info', (req, res) => { // 新しいエンドポイントを追加
    // ガチャの情報をJSON形式で返す
    res.json({ availableWins, availableRolls });
  });
//...
  

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
