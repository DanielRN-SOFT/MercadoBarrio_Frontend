// HeaderLista.jsx
import React from "react";
import { MdOutlineStorefront } from "react-icons/md";

const HeaderLista = ({ loading, tiendas }) => {
  return (
    <div className="relative px-4 py-3.5 border-b border-outline-variant bg-secondary-container shrink-0 flex items-center justify-between overflow-hidden">
      {/* Franja de marca */}
      <span className="absolute top-0 left-0 right-0 h-0.75 bg-primary" />

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
          <MdOutlineStorefront className="text-lg text-on-primary" />
        </div>

        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded bg-outline-variant/40 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-primary leading-none">
              {tiendas.length}
            </span>
            <span className="text-xs text-on-surface/50 leading-none">
              {tiendas.length === 1
                ? "tienda encontrada"
                : "tiendas encontradas"}
            </span>
          </div>
        )}
      </div>

      {loading && (
        <span className="loading loading-dots loading-xs text-primary" />
      )}
    </div>
  );
};

export default HeaderLista;
