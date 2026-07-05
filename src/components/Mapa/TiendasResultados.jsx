// TiendasResultados.jsx
import React from "react";
import { MdLocationOn, MdChevronRight, MdStorefront } from "react-icons/md";

const TiendasResultados = ({
  tienda,
  handleCardClick,
  activa,
  color,
  abierto,
}) => {
  return (
    <div
      onClick={() => handleCardClick(tienda)}
      className={`group relative flex items-center gap-3 p-3 pl-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
        activa
          ? "border-transparent bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-outline-variant/60 bg-surface hover:bg-surface-container-low hover:border-outline hover:-translate-y-0.5 hover:shadow-sm"
      }`}
    >
      {/* Acento de categoría */}
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full transition-opacity"
        style={{ backgroundColor: color, opacity: activa ? 1 : 0 }}
      />

      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-low"
          style={{
            boxShadow: `0 0 0 2px ${abierto ? color : "var(--color-outline-variant, #d9d9d9)"}`,
          }}
        >
          {tienda.logo || tienda.photo ? (
            <img
              src={tienda.logo || tienda.photo}
              alt={tienda.name}
              className={`w-full h-full object-cover ${!abierto ? "grayscale opacity-60" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MdStorefront className="text-xl text-on-surface/20" />
            </div>
          )}
        </div>
        {/* Dot estado */}
        <span className="absolute -bottom-0.5 -right-0.5 flex">
          {abierto && (
            <span className="absolute inline-flex w-3 h-3 rounded-full bg-success opacity-60 animate-ping" />
          )}
          <span
            className={`relative w-3 h-3 rounded-full border-2 border-surface ${
              abierto ? "bg-success" : "bg-outline-variant"
            }`}
          />
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h4
            className={`text-sm font-semibold leading-tight truncate ${
              !abierto ? "text-on-surface/50" : "text-on-surface"
            }`}
          >
            {tienda.name}
          </h4>
          <MdChevronRight
            className={`text-lg shrink-0 transition-all ${
              activa
                ? "text-primary translate-x-0.5 opacity-100"
                : "opacity-0 group-hover:opacity-40"
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {tienda.storeCategory && (
            <span
              className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              {tienda.storeCategory.name}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              abierto
                ? "bg-success/10 text-success"
                : "bg-outline-variant/30 text-on-surface/40"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${abierto ? "bg-success" : "bg-on-surface/30"}`}
            />
            {abierto ? "Abierto" : "Cerrado"}
          </span>
        </div>

        {tienda.neighborhood && (
          <div className="flex items-center gap-0.5 mt-1.5 text-on-surface/40">
            <MdLocationOn className="text-sm shrink-0" />
            <span className="text-[11px] truncate">{tienda.neighborhood}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiendasResultados;
