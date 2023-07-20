import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from './components/parts/Header';
import Footer from './components/parts/Footer';
import Gacha from './components/pages/Gacha';
import WinnerPage from './components/pages/WinnerPage'; 
import Admin from './components/pages/Admin';  
import { Link } from "react-router-dom";
import axios from 'axios'; 
import liff from '@line/liff';

const GachaCard = ({ title, id }) => (
  <Link to={`/gacha/${id}`}>
    <div className="gacha-card">
      <h2>{title}</h2>
    </div>
  </Link>
);

const GachaRow = ({ title, gachas }) => (
  <div className="gacha-row">
    <h1>{title}</h1>
    <div className="gacha-row-content">
      {gachas.map((gacha, index) => (
        <GachaCard key={index} title={gacha.title} id={gacha.id} />
      ))}
    </div>
  </div>
);

const AppContent = () => {
    // 以下に、ユーザーの名前を保持するための状態を追加します
    const [userName, setUserName] = useState(''); // 初期値は空文字列です

  const gachaData = [
    {
      rowTitle: '人気のガチャ',
      gachas: [
        { id: 1, title: 'ガチャ1' },
        { id: 2, title: 'ガチャ2' },
      ],
    },
    {
      rowTitle: '新着のガチャ',
      gachas: [
        { id: 3, title: 'ガチャ3' },
        { id: 4, title: 'ガチャ4' },
      ],
    },
  ];

  const location = useLocation();

  useEffect(() => {
    // ここで非同期自己実行関数を定義しています。
    // 非同期関数をその場で定義してすぐに実行します（Immediately Invoked Function Expression, IIFE）
    (async () => {
  
      // LIFFを初期化します。LIFF IDを指定します。
      // LIFF APIの関数は非同期であり、処理が完了するまで待つためには'await'を使います。
      await liff.init({ liffId: `2000154484-elnvPWP0` });
      
      // ユーザーがログインしているかどうかを確認します。
      if (!liff.isLoggedIn()) {
  
        // ユーザーがログインしていない場合、ログインを試みます。
        liff.login();
  
      } else {
        // ユーザーがログインしている場合、そのユーザーのプロフィールを取得します。
        const profile = await liff.getProfile();
        const accessToken = liff.getAccessToken();
        const name = profile.displayName;

        // ユーザー名の状態を更新します
        setUserName(name);
  
        // URLパラメータを解析します。
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const existingUserId = localStorage.getItem('userId');
  
        // ローカルストレージからユーザーIDを取得します。ユーザーIDが存在するかどうかを確認します。
        if (existingUserId) {
          // ユーザーIDが存在する場合、そのユーザーIDをサーバーに送り、そのユーザーが有効な状態であることを確認します。
          axios.get(`http://localhost:3001/auth/check?userId=${existingUserId}`)
            .then(response => {
              // サーバーからのレスポンスが200（正常）でない場合、再度ログインを試みます。
              if (response.status !== 200) {
                liff.login();
              }
            })
            .catch(error => {
              // エラーが発生した場合は、コンソールにエラーメッセージを表示します。
              console.error(error);
            });
  
        } else if (code) {
          // URLパラメータに'code'が含まれている場合、その'code'を使用してサーバーからユーザーIDを取得します。
          axios.get(`http://localhost:3001/auth/line?code=${code}`)
            .then(response => {
              // ユーザーIDを取得したら、それをローカルストレージに保存します。
              const userId = response.data.userId;
              localStorage.setItem('userId', userId);
            })
            .catch(error => {
              // エラーが発生した場合は、コンソールにエラーメッセージを表示します。
              console.error(error);
            });
        } else {
          // 上記の条件に当てはまらない場合、ユーザーにログインを試みさせます。
          liff.login();
        }
      }
    })();
  }, [location]); // ここで指定した依存性が変更されたときに、上記の処理を再実行します。この場合、'location'が変更されたときに再実行します。
  
  

  const startLoginFlow = () => {
    const YOUR_LINE_CHANNEL_ID = process.env.YOUR_LINE_CHANNEL_ID;
    const YOUR_REDIRECT_URI = process.env.YOUR_REDIRECT_URI;
    const SOME_RANDOM_STRING = process.env.SOME_RANDOM_STRING;

    const LINE_AUTH_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${YOUR_LINE_CHANNEL_ID}&redirect_uri=${YOUR_REDIRECT_URI}&state=${SOME_RANDOM_STRING}&scope=profile`;
    window.location.href = LINE_AUTH_URL;
  };

  return (
    <div className="App">
      <Header />
      <h2>{userName && `Welcome, ${userName}!`}</h2> {/* ユーザー名が設定されている場合に表示します */}
      <Routes>
        <Route path="/" element={
          <>
            {gachaData.map((row, index) => (
              <GachaRow key={index} title={row.rowTitle} gachas={row.gachas} />
            ))}
          </>
        } />
        <Route path="/gacha/:id" element={<Gacha />} />
        <Route path="/winner" element={<WinnerPage />} />  
        <Route path="/admin" element={<Admin />} />  
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
