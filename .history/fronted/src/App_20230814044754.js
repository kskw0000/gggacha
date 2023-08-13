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
    const [userName, setUserName] = useState(''); 
    const [gachaResult, setGachaResult] = useState([]);

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
      (async () => {
        const isLogin = localStorage.getItem('isLogin');

        if (isLogin) {
          setUserName(localStorage.getItem('userName'));
          return;
        }

        await liff.init({ liffId: `2000154484-elnvPWP0` });

        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const profile = await liff.getProfile();
          const name = profile.displayName;
          setUserName(name);

          axios.post(`${process.env.REACT_APP_API_URL}/auth/save-user`, { name })
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.error(error);
          });

          localStorage.setItem('isLogin', 'true');
          localStorage.setItem('userName', name);

          const urlParams = new URLSearchParams(location.search);
          const code = urlParams.get('code');
  
          if (code) {
            axios.get(`${process.env.REACT_APP_API_URL}/auth/line?code=${code}`)
              .catch(error => {
                console.error(error);
              });
          } else {
            liff.login();
          }
        }
      })();
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
        <h2>{userName && `Welcome, ${userName}!`}</h2>
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
