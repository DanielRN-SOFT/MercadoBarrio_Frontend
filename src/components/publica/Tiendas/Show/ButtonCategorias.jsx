import React from "react";

const ButtonCategorias = ({ cat, categoriaActiva, setCategoriaActiva }) => {
  return (
    <button
      key={cat.id}
      onClick={() => setCategoriaActiva(cat.id)}
      className={`px-4 py-1.5 rounded-full border whitespace-nowrap text-sm transition-all cursor-pointer ${
        categoriaActiva === cat.id
          ? "border-primary bg-primary text-white"
          : "border-base-300 text-on-surface/60 hover:border-primary hover:text-primary"
      }`}
    >
      {cat.name}
    </button>
  );
};

export default ButtonCategorias;
