import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './components/parts/Header';
import Footer from './components/parts/Footer';
import Gacha from './components/pages/Gacha';
import WinnerPage from './components/pages/WinnerPage';  // WinnerPageをインポート
import { Link } from "react-router-dom";

const GachaCard = ({ title, id }) => (
  <Link to={`/gacha/${id}`}>
    <div className="gacha-card">
      <h2>{title}</h2>
      {/* ここにガチャの画像などを追加することもできます */}
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


function App() {
  // ここは後でAPIから取得するように変更する予定です
  const gachaData = [
    {
      rowTitle: '人気のガチャ',
      gachas: [
        { id: 1, title: 'ガチャ1' },
        { id: 2, title: 'ガチャ2' },
        // 必要なだけガチャを追加
      ],
    },
    {
      rowTitle: '新着のガチャ',
      gachas: [
        { id: 3, title: 'ガチャ3' },
        { id: 4, title: 'ガチャ4' },
        // 必要なだけガチャを追加
      ],
    },
  ];

  return (
    <Router>
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
    </Router>
  );
}

export default App;
