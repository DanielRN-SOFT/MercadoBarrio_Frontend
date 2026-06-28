import { useState, useEffect, useRef } from "react";
import {
  IoSearchSharp,
  IoCloseSharp,
  IoStorefrontSharp,
} from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { MdAccessTime } from "react-icons/md";
import fetchCliente from "../../../config/fetchCliente";

const FilterBar = ({ onFilter }) => {
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    name: "",
    neighborhood: "",
    storeCategoryId: "",
    openNow: false,
  });
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchCliente("/store-categories")
      .then((res) => setCategorias(res.data))
      .catch(console.error);
  }, []);

  const emitir = (nuevosFiltros, delay = 0) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilter({
        ...nuevosFiltros,
        openNow: nuevosFiltros.openNow ? "true" : "",
      });
    }, delay);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevosFiltros = { ...filtros, [name]: value };
    setFiltros(nuevosFiltros);
    emitir(nuevosFiltros, 400);
  };

  const handleToggle = (e) => {
    const nuevosFiltros = { ...filtros, openNow: e.target.checked };
    setFiltros(nuevosFiltros);
    emitir(nuevosFiltros);
  };

  const handleLimpiar = () => {
    const vacios = {
      name: "",
      neighborhood: "",
      storeCategoryId: "",
      openNow: false,
    };
    setFiltros(vacios);
    emitir(vacios);
  };

  const limpiarCampo = (campo) => {
    const nuevosFiltros = {
      ...filtros,
      [campo]: campo === "openNow" ? false : "",
    };
    setFiltros(nuevosFiltros);
    emitir(nuevosFiltros);
  };

  const filtrosActivos = [
    filtros.name,
    filtros.neighborhood,
    filtros.storeCategoryId,
    filtros.openNow,
  ].filter(Boolean).length;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-base-200">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <IoSearchSharp className="text-primary text-base" />
          </div>
          <span className="font-semibold text-sm text-base-content">
            Buscar tiendas
          </span>
          {filtrosActivos > 0 && (
            <div className="badge badge-primary badge-sm font-medium">
              {filtrosActivos}
            </div>
          )}
        </div>
        {filtrosActivos > 0 && (
          <button
            onClick={handleLimpiar}
            className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10"
          >
            <IoCloseSharp className="text-sm" />
            Limpiar
          </button>
        )}
      </div>

      {/* Campos */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-base-content/50 flex items-center gap-1">
              <IoStorefrontSharp className="text-primary text-xs" />
              Nombre
            </label>
            <label className="input input-bordered input-sm flex items-center gap-2 pr-1">
              <IoSearchSharp className="text-base-content/30 shrink-0" />
              <input
                type="text"
                name="name"
                value={filtros.name}
                onChange={handleChange}
                placeholder="Tienda Don Carlos..."
                className="grow"
              />
              {filtros.name && (
                <button
                  onClick={() => limpiarCampo("name")}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <IoCloseSharp className="text-xs" />
                </button>
              )}
            </label>
          </div>

          {/* Barrio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-base-content/50 flex items-center gap-1">
              <FaLocationDot className="text-primary text-xs" />
              Barrio
            </label>
            <label className="input input-bordered input-sm flex items-center gap-2 pr-1">
              <FaLocationDot className="text-base-content/30 shrink-0" />
              <input
                type="text"
                name="neighborhood"
                value={filtros.neighborhood}
                onChange={handleChange}
                placeholder="La Esperanza..."
                className="grow"
              />
              {filtros.neighborhood && (
                <button
                  onClick={() => limpiarCampo("neighborhood")}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <IoCloseSharp className="text-xs" />
                </button>
              )}
            </label>
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-base-content/50 flex items-center gap-1">
              <IoStorefrontSharp className="text-primary text-xs" />
              Categoría
            </label>
            <select
              name="storeCategoryId"
              value={filtros.storeCategoryId}
              onChange={handleChange}
              className="select select-bordered select-sm w-full"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Abierto ahora */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-base-content/50 flex items-center gap-1">
              <MdAccessTime className="text-primary text-xs" />
              Disponibilidad
            </label>
            <label
              className={`flex items-center justify-between px-3 h-8 rounded-lg border cursor-pointer transition-all duration-200 ${
                filtros.openNow
                  ? "border-primary/40 bg-primary/8 shadow-[inset_0_0_0_1px_oklch(var(--p)/0.15)]"
                  : "border-base-300 bg-base-100 hover:border-base-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                    filtros.openNow ? "bg-success" : "bg-base-300"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    filtros.openNow
                      ? "text-primary font-medium"
                      : "text-base-content/50"
                  }`}
                >
                  Abierto ahora
                </span>
              </div>
              <input
                type="checkbox"
                checked={filtros.openNow}
                onChange={handleToggle}
                className="toggle toggle-primary toggle-xs"
              />
            </label>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {filtrosActivos > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-base-200">
            {filtros.name && (
              <div className="badge badge-outline gap-1 badge-sm">
                <IoStorefrontSharp className="text-xs" />
                {filtros.name}
                <button onClick={() => limpiarCampo("name")} className="ml-0.5">
                  <IoCloseSharp className="text-xs" />
                </button>
              </div>
            )}
            {filtros.neighborhood && (
              <div className="badge badge-outline gap-1 badge-sm">
                <FaLocationDot className="text-xs" />
                {filtros.neighborhood}
                <button
                  onClick={() => limpiarCampo("neighborhood")}
                  className="ml-0.5"
                >
                  <IoCloseSharp className="text-xs" />
                </button>
              </div>
            )}
            {filtros.storeCategoryId && (
              <div className="badge badge-outline gap-1 badge-sm">
                <IoStorefrontSharp className="text-xs" />
                {
                  categorias.find(
                    (c) => String(c.id) === String(filtros.storeCategoryId),
                  )?.name
                }
                <button
                  onClick={() => limpiarCampo("storeCategoryId")}
                  className="ml-0.5"
                >
                  <IoCloseSharp className="text-xs" />
                </button>
              </div>
            )}
            {filtros.openNow && (
              <div className="badge badge-success badge-outline gap-1 badge-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                Abierto ahora
                <button
                  onClick={() => limpiarCampo("openNow")}
                  className="ml-0.5"
                >
                  <IoCloseSharp className="text-xs" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
