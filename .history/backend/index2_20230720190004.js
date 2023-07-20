require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

const { PrismaClient } = require('@prisma/client');

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://gggacha.vercel.app'],
    // origin: 'https://gggacha.vercel.app',
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
          redirect_uri:"https://gggacha.vercel.app/",
          client_id: "2000154484",
          client_secret: "3c1a517865462a8f94fa9f53609dd6ee",
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

    const userId = profileResponse?.data?.userId
      ? profileResponse.data.userId
      : null;

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
    res.status(500).json({ message: 'Could not retrieve gacha settings.' });
  }

  if (gachaSettings.rolls <= 0) {
    res.status(500).json({ message: 'No more rolls available for today' });
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
        userId: userId ? userId : '-1',
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
    res.status(500).json({ message: 'Could not retrieve gacha settings.' });
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
    res.status(400).json({ message: 'Invalid data provided. Wins, rolls, and win probability should all be numbers.' });
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
    res.status(500).json({ message: 'Could not retrieve gacha settings.' });
  }

  res.json({
    availableWins: gachaSettings.wins,
    availableRolls: gachaSettings.rolls,
    winProbability: gachaSettings.winProbability,
  });
});

app.get('/auth/check', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: 'No user id provided.' });
  }

  try {
    const userToken = await prisma.userToken.findUnique({
      where: { userId: userId },
    });

    if (!userToken) {
      return res.status(404).send('No token found for provided user id.');
    }

    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${userToken.accessToken}`,
      },
    });

    if (response.status !== 200) {
      return res.status(401).send('Token is not valid.');
    }

    return res.status(200).send('Token is valid.');
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred during validation.');
  }
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
