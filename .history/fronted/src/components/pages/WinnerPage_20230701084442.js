import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WinnerPage = () => {
  const [winCode, setWinCode] = useState('');

  useEffect(() => {
    const savedCode = localStorage.getItem('winCode');
    if (savedCode) {
      setWinCode(savedCode);
    }
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(winCode);
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
        <button className="btn btn-success mb-3" onClick={handleCopyCode}>コピーする</button>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <Link to="/" className="btn btn-secondary">
          ホームに戻る
        </Link>
        <a href="https://lin.ee/jNGfEaS" target="_blank" rel="noreferrer" className="btn btn-primary">
          LINEに進む
        </a>
      </div>
    </div>
  );
};

export default WinnerPage;
