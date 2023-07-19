import React, { useEffect } from 'react';
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
    liff.init({
      liffId: `your LIFF ID here`
    })
    .then(() => {
      // ここで LIFF API を使って何かをすることができます。
      // たとえば、ユーザーのプロフィール情報を取得するなど。

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const existingUserId = localStorage.getItem('userId');

    if (existingUserId) {
      axios.get(`http://localhost:3001/auth/check?userId=${existingUserId}`)
        .then(response => {
          if (response.status !== 200) {
            startLoginFlow();
          }
        })
        .catch(error => {
          console.error(error);
        });
    } else if (code) {
      axios.get(`http://localhost:3001/auth/line?code=${code}`)
        .then(response => {
          const userId = response.data.userId;
          localStorage.setItem('userId', userId);
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      startLoginFlow();
    }
  });
  }, [location]);

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
