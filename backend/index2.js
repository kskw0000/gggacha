require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

const { PrismaClient } = require('@prisma/client');

app.use(
  cors({
    // origin: ['http://localhost:3000', 'https://gggacha.vercel.app'],
    origin: 'https://gggacha.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.use(express.json());
const prisma = new PrismaClient();

app.get('/', async (req, res) => {
  res.json({ message: 'Test' });
});

app.get('/auth/line', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data.access_token;

    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userId = profileResponse.data.userId;

    // 保存: ユーザーIDとアクセストークン
    await prisma.userToken.upsert({
      where: { userId: userId },
      update: { accessToken: accessToken },
      create: { userId: userId, accessToken: accessToken },
    });

    res.json({ message: 'Authentication successful', userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred during authentication.');
  }
});

app.get('/gacha', async (req, res) => {
  const userId = req.query.userId;

  const gachaSettings = await prisma.gachaSetting.findUnique({
    where: { id: 1 },
  });

  if (!gachaSettings) {
    res.status(500).send('An error occurred.');
    return;
  }

  if (gachaSettings.rolls <= 0) {
    return res
      .status(400)
      .json({ message: 'No more rolls available for today' });
  }

  let isWin =
    Math.random() < gachaSettings.winProbability && gachaSettings.wins > 0;
  let winCode = '';
  if (isWin) {
    winCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    await prisma.winCode.create({
      data: {
        winCode: winCode,
        issuedAt: new Date().toISOString(),
        userId: userId,
      },
    });
    gachaSettings.wins -= 1;
  }

  gachaSettings.rolls -= 1;

  await prisma.gachaSetting.update({
    where: { id: 1 },
    data: { wins: gachaSettings.wins, rolls: gachaSettings.rolls },
  });

  res.json({
    isWin,
    winCode,
    availableWins: gachaSettings.wins,
    availableRolls: gachaSettings.rolls,
  });
});

app.get('/gacha/info', async (req, res) => {
  const gachaSettings = await prisma.gachaSetting.findUnique({
    where: { id: 1 },
  });

  if (!gachaSettings) {
    res.status(500).send('An error occurred.');
    return;
  }

  res.json({
    availableWins: gachaSettings.wins,
    availableRolls: gachaSettings.rolls,
    winProbability: gachaSettings.winProbability,
  });
});

app.post('/admin/update-gacha', async (req, res) => {
  const { wins, rolls, winProbability } = req.body;

  if (
    typeof wins !== 'number' ||
    typeof rolls !== 'number' ||
    typeof winProbability !== 'number'
  ) {
    return res.status(400).json({ message: 'Invalid data provided.' });
  }

  await prisma.gachaSetting.upsert({
    where: { id: 1 },
    update: { wins: wins, rolls: rolls, winProbability: winProbability },
    create: {
      id: 1,
      wins: wins,
      rolls: rolls,
      winProbability: winProbability,
    },
  });

  res.json({ message: 'Gacha updated successfully.' });
});

app.get('/admin/gacha-info', async (req, res) => {
  const gachaSettings = await prisma.gachaSetting.findUnique({
    where: { id: 1 },
  });

  if (!gachaSettings) {
    res.status(500).send('An error occurred.');
    return;
  }

  res.json({
    availableWins: gachaSettings.wins,
    availableRolls: gachaSettings.rolls,
    winProbability: gachaSettings.winProbability,
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
