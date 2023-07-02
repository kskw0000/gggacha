import { Link } from "react-router-dom";

function GachaList() {
  return (
    <div>
      {/* 他のコード */}
      <Link to="/admin">
        <button>管理画面へ</button>
      </Link>
      {gachas.map((gacha) => (
        <Link to={`/gacha/${gacha.id}`}>
          <div className="gacha-card">
            {/* 他のコード */}
          </div>
        </Link>
      ))}
      {/* 他のコード */}
      
    </div>
  );
}

export default GachaList;
