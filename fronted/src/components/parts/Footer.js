import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  
  const handleAdminAccess = () => {
    const password = prompt("パスワードを入力してください:");
    if(password === "0000"){  // あなたのパスワードに置き換えてください
      navigate("/admin");
    } else {
      alert("不正なパスワードです。");
    }
  }

  return (
    <footer className="footer">
      {/* ここに著作権情報やリンクなどを配置します */}
      <p>&copy; 2023 ProReach. All rights reserved.</p>
      <button onClick={handleAdminAccess}>管理画面へ</button>
    </footer>
  );
}

export default Footer;
