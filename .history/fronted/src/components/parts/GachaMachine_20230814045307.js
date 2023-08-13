import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';  
import '../css/GachaMachine.css';

const GachaMachine = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableWins, setAvailableWins] = useState(0);
  const [availableRolls, setAvailableRolls] = useState(0);
  const [winProbability, setWinProbability] = useState(0);  
  const navigate = useNavigate(); 

  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const { transform } = useSpring({
    loop: loading,
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
    config: { duration: 2000 },
  });

  const fadeIn = useSpring({
    opacity: result ? 1 : 0,
    config: { duration: 1000 },
  });

  const handleGacha = async () => {
    // この部分は変更なし
    // ...  (残りのhandleGachaのコード)
  };

  const getGachaInfo = async () => {
    // この部分は変更なし
    // ...  (残りのgetGachaInfoのコード)
  };

  useEffect(() => {
    console.log('https://gggacha.onrender.com/:', process.env.REACT_APP_SERVER_URL);
    getGachaInfo();
  }, []);

  return (
    <div>
      <button onClick={handleGacha} disabled={loading || availableWins === 0 || availableRolls === 0}>
        {loading ? 'Rolling...' : 'ガラポンを回す'}
      </button>
      <animated.div style={transform}>
        {/* ここにガチャマシンの画像を表示するコード */}
      </animated.div>
      <p>残りの当たりの数: {availableWins}</p>
      <p>残りのガチャを回すことのできる回数: {availableRolls}</p>
      <p>当たりの確率: {winProbability}%</p>  
      {error && <p className="error">{error}</p>}
      <animated.div style={fadeIn}>
        {result && <p>{result}</p>}
      </animated.div>
      <Link to="/">ガチャ選択へ戻る</Link>
      {(availableWins === 0 || availableRolls === 0) && 
        <div className="popup">
          <p>本日のガチャは終了しました。日付が変わりましたらまたいらしてください。</p>
          <p>当たり: {availableWins}回</p>
          <p>ハズレ: {availableRolls}回</p>
          <Link to="/">戻る</Link>
        </div>
      }
    </div>
  );
};

export default GachaMachine;
