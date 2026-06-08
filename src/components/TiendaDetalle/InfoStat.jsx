import React from "react";

const InfoStat = ({ title, icono, mensaje }) => {
  return (
    <div className="stat place-items-center bg-surface-container-low ">
      <div className="stat-value text-primary">{icono}</div>
      <div className="stat-title text-black font-bold">{title}</div>
      <div className="stat-desc text-black text-xl">{mensaje}</div>
    </div>
  );
};

export default InfoStat;
