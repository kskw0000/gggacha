require('dotenv').config();
const stripe = require('stripe')('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'); // あなたのStripe Secret Keyを使用
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

const { PrismaClient } = require('@prisma/client');

// コース有効化
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://gggacha.vercel.app'],
    // origin: 'https://gggacha.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

// プリズマインスタンス。データベースとのやりとり
app.use(express.json());
const prisma = new PrismaClient();

// テスト-コンソール
app.get('/', async (req, res) => {
  res.json({ message: 'Test' });
});

//認証についてーーーーーー
// LINEのOAuth認証
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

    console.log(profileResponse.data); // Here we log the profile information to the console

    const userId = profileResponse?.data?.userId
      ? profileResponse.data.userId
      : null;

      const displayName = profileResponse.data.displayName
    ? profileResponse.data.displayName
    : null;

    // 保存: ユーザーIDとアクセストークン
    await prisma.userToken.upsert({
      where: { userId: userId },
      update: { accessToken: accessToken, displayName: displayName },
      create: { userId: userId, accessToken: accessToken, displayName: displayName },
    });
    

    res.json({ message: 'Authentication successful', userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred during authentication.');
  }
});

//ユーザーの認証が有効か？
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
      return res.status(404).json({ message: 'No token found for provided user id.' });
    }

    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${userToken.accessToken}`,
      },
    });

    if (response.status !== 200) {
      return res.status(401).json({ message: 'Token is not valid.' });
    }

    return res.status(200).json({ message: 'Token is valid.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred during token validation.' });
  }
});

// ユーザー情報とアクセストークンを保存
app.post('/auth/save-user', async (req, res) => {
  const { name, accessToken } = req.body;

  if (!name || !accessToken) {
    return res.status(400).json({ message: 'User name and access token are required.' });
  }

  try {
    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userId = response?.data?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid access token.' });
    }

    // 保存: ユーザーID、ユーザー名、アクセストークン
    try {
      await prisma.user.upsert({
        where: { userId: userId },
        update: { name: name, accessToken: accessToken },
        create: { userId: userId, name: name, accessToken: accessToken, points: 300 },
      });
    } catch (error) {
      console.error('Error saving user to the database:', error);
      res.status(500).send('An error occurred while saving user information to the database.');
      return;
    }

    res.json({ message: 'User information saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred during user information saving.');
  }
});


//ガチャについてーーーーー
// ガチャロール。ユーザーのポイントが十分でない場合、またはガチャ設定が取得できない場合、エラーメッセージが返されます。
app.get('/gacha', async (req, res) => {
  const userId = req.query.userId;

  const user = await prisma.user.findUnique({
    where: { userId: userId },
  });

  if (!user || user.points < 120) {
    res.status(400).json({ message: 'Not enough points.' });
    return;
  }

  // Deduct 120 points
  user.points -= 120;

  await prisma.user.update({
    where: { userId: userId },
    data: { points: user.points },
  });

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

// フロント/ガチャ表記
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

// ガチャの管理画面ーーーーーー
// ガチャの設定更新
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

// ガチャの設定情報　管理者むけ
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


//ポイント購入系ーーーーー
// ポイント購入エンドポイント
app.post('/buy-points', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount < 1) {
    res.status(400).json({ message: 'Invalid user id or amount.' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { userId: userId },
  });

  if (!user) {
    res.status(400).json({ message: 'User not found.' });
    return;
  }

  // Add points
  user.points += amount * 1000; // 1000 points for each unit purchased

  await prisma.user.update({
    where: { userId: userId },
    data: { points: user.points },
  });

  res.json({ message: 'Points purchased successfully.' });
});

// ストライプチェックアウトセッション
app.post('/create-checkout-session', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: 'Invalid user id.' });
    return;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: '1000 points',
          },
          unit_amount: 50000, // 50000 = 500.00 JPY
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://your-website.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://your-website.com/cancel',
    metadata: {
      userId: userId
    }
  });

  res.json({ id: session.id });
});

// ストライプウェブフックからのイベント処理
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], whsec_2nkpuiOm0Up2FUtnLnCybfNzzFJlZdT4);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed. ${err.message}`);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      console.log(`⚠️  User not found. userId: ${userId}`);
      return res.sendStatus(400);
    }

    user.points += 1000;

    await prisma.user.update({
      where: { userId: userId },
      data: { points: user.points },
    });

    console.log(`✅ Successfully added points. userId: ${userId}`);
  }

  res.sendStatus(200);
});

// ユーザーの現在のポイント
app.get('/user-points', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ message: 'Invalid user id.' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { userId: userId },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  res.json({ points: user.points });
});

// 
axios.post('${process.env.REACT_APP_API_URL}/auth/validate-token', { token: accessToken })
.then(response => {
  console.log(response);
})
.catch(error => {
  console.error(error);
  if (error.response && error.response.status === 401) {
    liff.login();
  }
});



app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
