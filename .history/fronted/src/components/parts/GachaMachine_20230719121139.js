import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';  
import '../css/GachaMachine.css';

const GachaMachine = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableWins, setAvailableWins] = useState(0);
  const [availableRolls, setAvailableRolls] = useState(0);
  const [winProbability, setWinProbability] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);  
  const navigate = useNavigate(); 
  const location = useLocation();

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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    if (code) {
      // sendCodeToServer(code);
    }
  }, [location]);

  const handleLineAuth = () => {
    const YOUR_LINE_CHANNEL_ID = process.env.YOUR_LINE_CHANNEL_ID;
    const YOUR_REDIRECT_URI = process.env.YOUR_REDIRECT_URI;
    const SOME_RANDOM_STRING = process.env.SOME_RANDOM_STRING;
  
    const LINE_AUTH_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${YOUR_LINE_CHANNEL_ID}&redirect_uri=${YOUR_REDIRECT_URI}&state=${SOME_RANDOM_STRING}&scope=profile`;
    window.location.href = LINE_AUTH_URL;
  };

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
      const response = await axios.get(`${serverUrl}/gacha/info`);
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
      {!authenticated && <button onClick={handleLineAuth}>LINEで認証</button>}
      <button onClick={handleGacha} disabled={loading || availableWins === 0 || availableRolls === 0 || !authenticated}>
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
