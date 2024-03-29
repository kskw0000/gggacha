import React from 'react';
import { useParams, Link } from 'react-router-dom';
import GachaMachine from "../parts/GachaMachine";
import Admin from "./Admin";


function Gacha() {
  const { id } = useParams(); // URLパラメータからガチャのIDを取得します

  // これは仮のデータです。後でAPIからデータを取得するように変更する予定です
  const gachaData = {
    title: 'ガチャ' + id,
    description: 'これはガチャ' + id + 'の説明です',
  };

  return (
    <div>
      <h1>{gachaData.title}</h1>
      <p>{gachaData.description}</p>
      <GachaMachine />
    </div>
  );
}

export default Gacha;
