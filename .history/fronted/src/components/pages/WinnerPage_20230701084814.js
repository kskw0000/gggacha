import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WinnerPage.css'; // Import the CSS

const WinnerPage = () => {
  // ... 省略 ...

  return (
    <div className="container">
      <h1>おめでとうございます！当たりが出ました！</h1>
      <p>当たりが出た人専用のページです。ギフトの受け取り方が記載されています</p>
      
      <h2>景品の受け取り方</h2>
      <ol>
        <li>確認コードをコピーして下さい</li>
        <li>LINEのトークにて送付して下さい</li>
        <li>ギフトのプレゼントのご案内をさせていただきます</li>
      </ol>

      <div>
        <h3>確認のコード</h3>
        <p>{winCode}</p>
        <button className="button copy" onClick={handleCopyCode}>コピーする</button>
      </div>

      <div className="button-container">
        <Link to="/" className="button home">
          ホームに戻る
        </Link>
        <a href="https://lin.ee/jNGfEaS" target="_blank" rel="noreferrer" className="button line">
          LINEに進む
        </a>
      </div>
    </div>
  );
};

export default WinnerPage;
