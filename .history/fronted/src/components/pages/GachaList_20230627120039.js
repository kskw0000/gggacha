import { Link } from "react-router-dom";

function GachaList() {
  return (
    <div>
      {/* 他のコード */}
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
