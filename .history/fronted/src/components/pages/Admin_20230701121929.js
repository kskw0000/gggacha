import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [availableWins, setAvailableWins] = useState(0);
  const [availableRolls, setAvailableRolls] = useState(0);
  const [winProbability, setWinProbability] = useState(0);  // 当たりの確率

  const handleSave = async () => {
    try {
      await axios.post('/admin/update-gacha', { wins: availableWins, rolls: availableRolls, winProbability });  // Endpointとフィールド名を変更
      alert('Settings saved successfully.');
    } catch (error) {
      console.error('Error during save gacha settings:', error);
      alert('An error occurred.');
    }
  };

  const getGachaInfo = async () => {
    try {
      const response = await axios.get('/admin/gacha-info');
      const { availableWins, availableRolls, winProbability } = response.data;
      setAvailableWins(availableWins);
      setAvailableRolls(availableRolls);
      setWinProbability(winProbability);  // 当たりの確率を設定
    } catch (error) {
      console.error('Error during the get gacha info:', error);
    }
  };

  useEffect(() => {
    getGachaInfo();
  }, []);

  return (
    <div>
      <h1>Admin Page</h1>
      <input type="number" value={availableWins} onChange={(e) => setAvailableWins(e.target.value)} placeholder="Available wins" />
      <input type="number" value={availableRolls} onChange={(e) => setAvailableRolls(e.target.value)} placeholder="Available rolls" />
      <input type="number" value={winProbability} onChange={(e) => setWinProbability(e.target.value)} placeholder="Win probability" min="0" max="100" step="0.01"/>  
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default Admin;
