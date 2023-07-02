import React from 'react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* ここに著作権情報やリンクなどを配置します */}
      <Link to="/admin">
        <button>管理画面へ</button>
      </Link>
      <p>&copy; 2023 ProReach. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
