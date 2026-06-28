import React from "react";
import { MdLocationOn } from "react-icons/md";

const TiendasResultados = ({tienda, handleCardClick, activa, color, abierto}) => {
  return (
    <div
      key={tienda.id}
      onClick={() => handleCardClick(tienda)}
      className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
        activa
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-outline-variant bg-surface hover:bg-surface-container-low hover:border-outline hover:shadow-sm"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low">
          {tienda.logo || tienda.photo ? (
            <img
              src={tienda.logo || tienda.photo}
              alt={tienda.name}
              className={`w-full h-full object-cover ${!abierto ? "grayscale opacity-60" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-on-surface/20">
                storefront
              </span>
            </div>
          )}
        </div>
        {/* Dot estado */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${abierto ? "bg-success" : "bg-outline-variant"}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h4
            className={`text-sm font-semibold leading-tight truncate ${!abierto ? "text-on-surface/50" : "text-on-surface"}`}
          >
            {tienda.name}
          </h4>
          {activa && (
            <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
              chevron_right
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {tienda.storeCategory && (
            <span
              className="inline-flex items-center text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: color }}
            >
              {tienda.storeCategory.name}
            </span>
          )}
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              abierto
                ? "bg-success/10 text-success"
                : "bg-outline-variant/30 text-on-surface/40"
            }`}
          >
            {abierto ? "Abierto" : "Cerrado"}
          </span>
        </div>

        {tienda.neighborhood && (
          <div className="flex items-center gap-0.5 mt-1">
            <MdLocationOn className="text-2xl text-on-surface/30" />
            <span className="text-[11px] text-on-surface/40 truncate">
              {tienda.neighborhood}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiendasResultados;
