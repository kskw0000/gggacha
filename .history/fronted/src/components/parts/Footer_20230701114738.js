import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Footer.css';
import Admin from "../pages/Admin";

const Footer = () => {
  return (
    <footer className="footer">
      {/* ここに著作権情報やリンクなどを配置します */}
      <p>&copy; 2023 ProReach. All rights reserved.</p>
      <Link to="/admin">
        <button>管理画面へ</button>
      </Link>
    </footer>
  );
}

export default Footer;