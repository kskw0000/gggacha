import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  

const Admin = () => {
    const [availableWins, setAvailableWins] = useState('');
    const [availableRolls, setAvailableRolls] = useState('');
    const [winProbability, setWinProbability] = useState('');  
     // 当たりの確率

    const handleSave = async () => {
        try {
          // Parse the values as numbers before sending them
          const wins = parseInt(availableWins, 10);
          const rolls = parseInt(availableRolls, 10);
          const winProb = parseFloat(winProbability);
          
          await axios.post('http://localhost:3001/admin/update-gacha', { wins, rolls, winProbability: winProb });
          alert('Settings saved successfully.');
        } catch (error) {
          console.error('Error during save gacha settings:', error);
          alert('An error occurred.');
        }
      };
      

  const getGachaInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3001/admin/gacha-info');
      const { availableWins, availableRolls, winProbability } = response.data;
        setAvailableWins(availableWins || '');
        setAvailableRolls(availableRolls || '');
        setWinProbability(winProbability || '');  
        // 当たりの確率を設定
    } catch (error) {
      console.error('Error during the get gacha info:', error);
    }
  };

  useEffect(() => {
    getGachaInfo();
  }, []);

  return (
    <div>
      <h1>管理ページ</h1>
      <input type="number" value={availableWins} onChange={(e) => setAvailableWins(e.target.value)} placeholder="当たりの数" />
      <input type="number" value={availableRolls} onChange={(e) => setAvailableRolls(e.target.value)} placeholder="全体の数" />
      <input type="number" value={winProbability} onChange={(e) => setWinProbability(e.target.value)} placeholder="確率" min="0" max="100" step="0.01"/>  
      <button onClick={handleSave}>Save Settings</button>
      
      <Link to="/">ホームへ戻る</Link>
    </div>
  );
};

export default Admin;
