import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  // Link componentをインポート

const Admin = () => {
  // ... 省略 ...

  return (
    <div>
      <h1>管理ページ</h1>
      <input type="number" value={availableWins} onChange={(e) => setAvailableWins(e.target.value)} placeholder="当たりの数" />
      <input type="number" value={availableRolls} onChange={(e) => setAvailableRolls(e.target.value)} placeholder="全体の数" />
      <input type="number" value={winProbability} onChange={(e) => setWinProbability(e.target.value)} placeholder="確率" min="0" max="100" step="0.01"/>  
      <button onClick={handleSave}>Save Settings</button>
      
      {/* ホームへのリンクを追加 */}
      <Link to="/">ホームへ戻る</Link>
    </div>
  );
};

export default Admin;
