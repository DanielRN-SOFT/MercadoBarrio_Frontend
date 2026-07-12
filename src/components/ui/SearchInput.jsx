import { IoSearchSharp, IoCloseSharp } from "react-icons/io5";

/**
 * SearchInput — campo de búsqueda redondeado con ícono de lupa y botón de
 * limpiar cuando hay texto. Reemplaza el `<label className="input ...">`
 * repetido en los filtros de cada listado.
 *
 * Props:
 * - value: string
 * - onChange: (value: string) => void   → recibe el string directo, no el evento
 * - placeholder: string
 * - className: string                    → clases extra para el contenedor (ej. "flex-1")
 */
const SearchInput = ({ value, onChange, placeholder = "Buscar...", className = "" }) => (
  <label
    className={`input input-bordered flex items-center gap-2 rounded-full bg-surface-container-low border-outline-variant focus-within:border-primary transition-colors ${className}`}
  >
    <IoSearchSharp className="text-on-surface-variant text-lg shrink-0" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="grow bg-transparent min-w-0"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        type="button"
        className="btn btn-ghost btn-xs btn-circle shrink-0"
      >
        <IoCloseSharp />
      </button>
    )}
  </label>
);

export default SearchInput;
