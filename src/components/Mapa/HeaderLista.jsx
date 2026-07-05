// HeaderLista.jsx
import React from "react";
import { MdOutlineStorefront } from "react-icons/md";

const HeaderLista = ({ loading, tiendas }) => {
  return (
    <div className="relative px-4 py-3.5 border-b border-outline-variant bg-secondary-fixed shrink-0 flex items-center justify-between overflow-hidden">
      {/* Franja de marca — degradado sutil en vez de línea plana */}
      <span className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-primary via-primary/70 to-primary" />

      <div className="flex items-center gap-3">
        {/* Icono con leve profundidad en vez de un bloque plano */}
        <div className="relative w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-primary/75 flex items-center justify-center shrink-0 shadow-md shadow-primary/25 ring-1 ring-white/15">
          <MdOutlineStorefront className="text-lg text-on-primary" />
        </div>

        {loading ? (
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-10 rounded-full bg-outline-variant/40 animate-pulse" />
            <div className="h-2.5 w-32 rounded-full bg-outline-variant/30 animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-primary tracking-tight">
                {tiendas.length}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface/35">
                {tiendas.length === 1 ? "resultado" : "resultados"}
              </span>
            </div>
            <span className="text-xs text-on-surface/50 mt-1">
              {tiendas.length === 1
                ? "tienda encontrada"
                : "tiendas encontradas"}
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-1.5 text-primary/70">
          <span className="loading loading-dots loading-xs" />
        </div>
      )}
    </div>
  );
};

export default HeaderLista;
