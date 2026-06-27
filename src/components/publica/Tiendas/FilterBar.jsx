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
    emitir(nuevosFiltros, 400); // debounce solo en texto
  };

  const handleToggle = (e) => {
    const nuevosFiltros = { ...filtros, openNow: e.target.checked };
    setFiltros(nuevosFiltros);
    emitir(nuevosFiltros); // inmediato
  };

  const handleLimpiar = () => {
    const vacios = {
      name: "",
      neighborhood: "",
      storeCategoryId: "",
      openNow: false,
    };
    setFiltros(vacios);
    emitir(vacios); // inmediato
  };

  const limpiarCampo = (campo) => {
    const nuevosFiltros = { ...filtros, [campo]: "" };
    setFiltros(nuevosFiltros);
    emitir(nuevosFiltros); // inmediato
  };

  const filtrosActivos = [
    filtros.name,
    filtros.neighborhood,
    filtros.storeCategoryId,
    filtros.openNow,
  ].filter(Boolean).length;

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm w-full">
      <div className="bg-primary/5 border-b border-base-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IoSearchSharp className="text-primary text-xl" />
          <span className="font-semibold text-on-surface">Buscar tiendas</span>
          {filtrosActivos > 0 && (
            <span className="badge badge-primary badge-sm">
              {filtrosActivos} activos
            </span>
          )}
        </div>
        {filtrosActivos > 0 && (
          <button
            onClick={handleLimpiar}
            className="btn btn-ghost btn-xs gap-1 text-error"
          >
            <IoCloseSharp />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-on-surface/60 flex items-center gap-1">
              <IoStorefrontSharp className="text-primary" />
              Nombre
            </label>
            <label className="input w-full">
              <IoSearchSharp className="text-on-surface/30" />
              <input
                type="text"
                name="name"
                value={filtros.name}
                onChange={handleChange}
                placeholder="Tienda Don Carlos..."
              />
              {filtros.name && (
                <button
                  onClick={() => limpiarCampo("name")}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <IoCloseSharp />
                </button>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-on-surface/60 flex items-center gap-1">
              <FaLocationDot className="text-primary" />
              Barrio
            </label>
            <label className="input w-full">
              <FaLocationDot className="text-on-surface/30" />
              <input
                type="text"
                name="neighborhood"
                value={filtros.neighborhood}
                onChange={handleChange}
                placeholder="La Esperanza..."
              />
              {filtros.neighborhood && (
                <button
                  onClick={() => limpiarCampo("neighborhood")}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <IoCloseSharp />
                </button>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-on-surface/60 flex items-center gap-1">
              <IoStorefrontSharp className="text-primary" />
              Categoría
            </label>
            <select
              name="storeCategoryId"
              value={filtros.storeCategoryId}
              onChange={handleChange}
              className="select w-full"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-on-surface/60 flex items-center gap-1">
              <MdAccessTime className="text-primary" />
              Disponibilidad
            </label>
            <label
              className={`flex items-center justify-between px-4 h-12 rounded-lg border cursor-pointer transition-colors ${
                filtros.openNow
                  ? "border-primary bg-primary/5"
                  : "border-base-300 bg-base-100"
              }`}
            >
              <span
                className={`text-sm ${filtros.openNow ? "text-primary font-medium" : "text-on-surface/60"}`}
              >
                Abierto ahora
              </span>
              <input
                type="checkbox"
                checked={filtros.openNow}
                onChange={handleToggle}
                className="toggle toggle-primary toggle-sm"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
