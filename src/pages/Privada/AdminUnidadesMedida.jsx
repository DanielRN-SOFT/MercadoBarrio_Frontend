import {
  MdEdit,
  MdRestoreFromTrash,
  MdAdd,
  MdNewLabel,
  MdOutlineFilterAlt,
  MdSearch,
  MdOutlineCategory,
  MdOutlineAdUnits,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import useToast from "../../hooks/useToast";
import fetchCliente from "../../config/fetchCliente";
import Paginacion from "../../components/ui/Paginacion";

// Datos de ejemplo solo para poder visualizar el componente.
// En el original esto venía de fetchCliente() + useState().
const categorias = [
  { id: 1, name: "Lácteos", status: "Active" },
  { id: 2, name: "Bebidas", status: "Inactive" },
];

const meta = { total: 12, totalPages: 3 };
const EMPTY_FORM = { name: "" };

const AdminUnidadesMedida = () => {
  // Gestion
  const { addToast, removeToast, toasts } = useToast();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Mostrar modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUnidades, setEditingUnidades] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUnidades = async (p = 1) => {
    const params = new URLSearchParams({ page: p });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    setLoading(true);
    try {
      const res = await fetchCliente(`/unit-measures?${params}`);
      setUnidades(res.data);
      setMeta(res.meta);
      console.log(res);
    } catch (error) {
      addToast({ message: `Ha ocurrido un error: ${error}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades(page);
  }, [page]);

  useEffect(() => {
    if (page === 1) fetchUnidades(1);
    else setPage(1);
  }, [statusFilter, search]);

  // Debounce: espera 400ms desde la última tecla antes de disparar la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setStatusFilter("");
  };

  const hasFilters = statusFilter || search;
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdOutlineAdUnits className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                Unidades de medida
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Administra todas las unidades de medida para los productos del
                sistema
                <span className="text-on-surface-variant">
                  {" "}
                  · {meta.total} en total
                </span>
              </p>
            </div>
          </div>
          <button className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto">
            <MdAdd className="text-xl" />
            Nueva unidad de medida
          </button>
        </div>

        {/* Filtros */}
        <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
          <div className="card-body p-4 sm:p-5 gap-3">
            <div className="flex items-center gap-2 text-secondary">
              <MdOutlineFilterAlt className="text-base" />
              <span className="text-label-sm uppercase tracking-wide font-semibold">
                Filtros
              </span>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-5">
              <div className="relative col-span-2 my-2">
                <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full pl-10 relative z-0 transition-colors"
                />
              </div>

              <div>
                <select
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-56 transition-colors my-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Se muestra solo cuando hay filtros activos */}
            {hasFilters && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleClearFilters}
                  className="btn btn-ghost btn-sm gap-1 text-secondary hover:text-error font-label-sm rounded-full"
                >
                  <IoCloseSharp className="text-sm" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Estado vacío / carga compartido */}
        {loading ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="space-y-4 p-4 sm:p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded-full" />
                    <div className="skeleton h-3 w-1/4 rounded-full" />
                  </div>
                  <div className="skeleton h-8 w-20 rounded-full hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        ) : unidades.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-center py-16 sm:py-20 px-6 text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <MdOutlineAdUnits className="text-3xl opacity-40" />
              </div>
              <p className="font-semibold text-on-surface text-body-lg">
                {hasFilters
                  ? "Sin resultados"
                  : "Aún no tienes categorias de productos"}
              </p>
              <p className="text-body-md mt-1">
                {hasFilters
                  ? "No encontramos categorias de producto con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer categoria de producto para comenzar."}
              </p>
              {!hasFilters && (
                <button className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container">
                  <MdAdd className="text-xl" /> Agregar unidad de medida
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {unidades.map((cat) => (
                <div
                  key={cat.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {cat.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Editar"
                        >
                          <MdEdit className="text-lg text-secondary" />
                        </button>
                        {cat.status === "Active" ? (
                          <button
                            className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                            aria-label="Desactivar"
                          >
                            <IoCloseCircle className="text-lg text-error" />
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm btn-circle hover:bg-primary-container/20"
                            aria-label="Reactivar"
                          >
                            <MdRestoreFromTrash className="text-lg text-primary" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <span
                        className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                          cat.status === "Active"
                            ? "bg-primary-fixed text-on-primary-fixed-variant"
                            : "bg-surface-container-high text-secondary"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.status === "Active"
                              ? "bg-primary"
                              : "bg-outline"
                          }`}
                        />
                        {cat.status === "Active" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de TABLA — escritorio */}
            <div className="hidden lg:block card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr className="bg-surface-container-high border-b border-outline-variant">
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Nombre
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Estado
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 text-right last:rounded-tr-2xl">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60">
                      {unidades.map((unidad) => (
                        <tr
                          key={unidad.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-on-surface text-body-md">
                                {unidad.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                                unidad.status === "Active"
                                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                                  : "bg-surface-container-high text-secondary"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  unidad.status === "Active"
                                    ? "bg-primary"
                                    : "bg-outline"
                                }`}
                              />
                              {unidad.status === "Active"
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                                data-tip="Editar"
                              >
                                <MdEdit className="text-lg text-secondary" />
                              </button>
                              {unidad.status === "Active" ? (
                                <button
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                                  data-tip="Desactivar"
                                >
                                  <IoCloseCircle className="text-lg text-error" />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-primary-container/20"
                                  data-tip="Reactivar"
                                >
                                  <MdRestoreFromTrash className="text-lg text-primary" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Paginación (placeholder, sin lógica de páginas) */}
        <Paginacion
          meta={meta}
          onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
          itemLabel="Unidades de medida"
        />
      </div>

      {/* Modal crear/editar categoria */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdOutlineCategory className="text-xl text-on-primary-container" />
              </div>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>
            </div>

            <h3 className="font-bold text-title-md text-on-surface">
              Nueva categoria
            </h3>
            <p className="text-body-md text-secondary mt-1">
              Completa los datos para crear una nueva categoria.
            </p>

            <form className="mt-5 space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Nombre
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lácteos"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              {/* Ejemplo de mensaje de error de formulario */}
              {/* <div className="alert bg-error-container border-none rounded-xl py-2.5">
              <span className="text-body-sm text-on-error-container">
                Todos los campos son obligatorios
              </span>
            </div> */}

              <div className="modal-action gap-2 flex-col-reverse sm:flex-row pt-2">
                <button
                  type="button"
                  className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container w-full sm:w-auto"
                >
                  Crear categoria
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" />
        </dialog>
      )}

      {/* Modal confirmación desactivar */}
      {confirmId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center mb-3">
              <IoCloseCircle className="text-xl text-on-error-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Desactivar categoria de producto?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              Esta categoria quedará inactiva hasta que la restablezcas.
              Recuerda que no se puede desactivar una categoria que tenga
              productos activos asociados.
            </p>
            <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
              <button className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto">
                Cancelar
              </button>
              <button className="btn bg-error text-on-error border-none rounded-full font-label-md hover:brightness-95 w-full sm:w-auto">
                Desactivar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" />
        </dialog>
      )}
    </>
  );
};

export default AdminUnidadesMedida;
