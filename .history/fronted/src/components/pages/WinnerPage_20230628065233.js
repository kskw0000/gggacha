import React, { useState, useEffect } from 'react';

const WinnerPage = () => {
  const [winCode, setWinCode] = useState('');

  useEffect(() => {
    // Get the win code from local storage
    const savedCode = localStorage.getItem('winCode');
    if (savedCode) {
      setWinCode(savedCode);
    }
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(randomCode);
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
    </div>
  );
};

export default WinnerPage;
