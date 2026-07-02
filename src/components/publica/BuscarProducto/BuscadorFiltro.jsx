import React from "react";
import { IoCloseSharp, IoSearchSharp } from "react-icons/io5";

const BuscadorFiltro = ({
  query,
  handleChange,
  handleLimpiar,
  productCategoryId,
  handleCategoriaChange,
  categorias,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <label className="input input-bordered flex items-center gap-2 pr-2 flex-1">
        <IoSearchSharp className="text-on-surface/40 text-lg shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Ej: Arroz, Aceite, Jabón..."
          className="grow"
          autoFocus
        />
        {query && (
          <button
            onClick={handleLimpiar}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <IoCloseSharp />
          </button>
        )}
      </label>

      <select
        value={productCategoryId}
        onChange={handleCategoriaChange}
        className="select select-bordered sm:w-56"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BuscadorFiltro;
