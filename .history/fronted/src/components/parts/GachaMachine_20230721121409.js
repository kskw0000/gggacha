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
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`${serverUrl}/gacha`);
      const { isWin, winCode, availableWins, availableRolls } = response.data;
      setResult(isWin ? "当たり！赤い玉が出ました！" : "ハズレ...白い玉が出ました");
      setAvailableWins(availableWins);
      setAvailableRolls(availableRolls);
      if (isWin) {
        localStorage.setItem('winCode', winCode);
        navigate('/winner');  
      }
    } catch (error) {
      console.error('Error during the gacha roll:', error.response || error);
      setError('ガチャの抽選中にエラーが発生しました。しばらくしてから再度試してください。');
    }
    
    setLoading(false);
  };

  const getGachaInfo = async () => {
    try {
      const existingUserId = localStorage.getItem('userId');
      const response = await axios.get(`${serverUrl}/gacha/info?userId=${existingUserId}`);
      const { availableWins, availableRolls, winProbability } = response.data;
      setAvailableWins(availableWins);
      setAvailableRolls(availableRolls);
      setWinProbability(winProbability);  
    } catch (error) {
      console.error('Error during the get gacha info:', error);
      setError('ガチャの情報取得中にエラーが発生しました。しばらくしてから再度試してください。');
    }
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
