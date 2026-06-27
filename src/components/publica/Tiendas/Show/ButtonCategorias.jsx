import React from "react";

const ButtonCategorias = ({cat, categoriaActiva, setCategoriaActiva}) => {
  return (
    <button
      key={cat}
      onClick={() => setCategoriaActiva(cat)}
      className={`px-4 py-1.5 rounded-full border whitespace-nowrap text-sm transition-all cursor-pointer ${
        categoriaActiva === cat
          ? "border-primary bg-primary text-white"
          : "border-base-300 text-on-surface/60 hover:border-primary hover:text-primary"
      }`}
    >
      {cat === "" ? "Todos" : cat}
    </button>
  );
};

export default ButtonCategorias;
