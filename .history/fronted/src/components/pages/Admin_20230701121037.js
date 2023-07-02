import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [availableWins, setAvailableWins] = useState(0);
  const [availableRolls, setAvailableRolls] = useState(0);
  const [winProbability, setWinProbability] = useState(0);  // 当たりの確率

  const handleSave = async () => {
    try {
      await axios.post('/gacha/settings', { availableWins, availableRolls, winProbability });
      alert('Settings saved successfully.');
    } catch (error) {
      console.error('Error during save gacha settings:', error);
      alert('An error occurred.');
    }
  };

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
