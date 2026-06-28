import React from "react";
import { MdOutlineStorefront } from "react-icons/md";

const SinResultados = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
        <MdOutlineStorefront className="text-2xl text-on-primary-container" />
      </div>
      <div>
        <p className="font-medium text-on-surface/60 text-sm">Sin resultados</p>
        <p className="text-xs text-on-surface/40 mt-0.5">
          Intenta con otros filtros
        </p>
      </div>
    </div>
  );
};

export default SinResultados;
