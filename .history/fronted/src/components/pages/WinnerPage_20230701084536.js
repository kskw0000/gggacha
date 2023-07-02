import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Add this line if not already present in your file

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
    <div>
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
        <button onClick={handleCopyCode}>コピーする</button>
      </div>

      <div>
        {/* LINEへのリンクボタン */}
        <a href="https://lin.ee/jNGfEaS" target="_blank" rel="noreferrer" className="btn btn-primary" style={{marginRight: '10px'}}>
          LINEに進む
        </a>

        {/* ホームに戻るボタン */}
        <Link to="/" className="btn btn-secondary">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
};

export default WinnerPage;
