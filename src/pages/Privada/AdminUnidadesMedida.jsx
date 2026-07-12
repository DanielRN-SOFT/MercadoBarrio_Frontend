import {
  MdEdit,
  MdRestoreFromTrash,
  MdAdd,
  MdOutlineFilterAlt,
  MdOutlineAdUnits,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import useToast from "../../hooks/useToast";
import fetchCliente from "../../config/fetchCliente";
import Paginacion from "../../components/ui/Paginacion";
import ToastContainer from "../../components/ui/ToastContainer";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import IconButton from "../../components/ui/IconButton";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";

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
  const [editingUnidades, setEditingUnidades] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUnidades = async (p = 1) => {
    const params = new URLSearchParams({ page: p });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    setLoading(true);
    try {
      const res = await fetchCliente(`/unit-measures?${params.toString()}`);
      setUnidades(res.data);
      setMeta(res.meta);
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

  const openCreateModal = () => {
    setShowFormModal(true);
    setEditingUnidades(null);
    setFormError("");
    setForm(EMPTY_FORM);
  };

  const openEditModal = (unidad) => {
    setEditingUnidades(unidad);
    setForm({
      name: unidad.name,
    });
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setShowFormModal(false);
    setEditingUnidades(null);
    setFormError("");
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Todos los campos son obligatorios");
      return;
    }

    setFormLoading(true);
    try {
      if (editingUnidades) {
        const res = await fetchCliente(`/unit-measures/${editingUnidades.id}`, {
          method: "PUT",
          body: {
            name: form.name,
          },
        });
        addToast({ message: res.message, type: "success" });
      } else {
        const res = await fetchCliente("/unit-measures", {
          method: "POST",
          body: {
            name: form.name,
          },
        });
        addToast({ message: res.message, type: "success" });
      }

      setShowFormModal(false);
      setForm(EMPTY_FORM);
      setEditingUnidades(null);
      fetchUnidades(page);
    } catch (err) {
      setFormError(err.message ?? "Error al guardar el unidad de medida");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetchCliente(`/unit-measures/delete/${id}`, {
        method: "PUT",
      });
      addToast({ message: res.message, type: "success" });
      fetchUnidades(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al eliminar unidad de medida",
        type: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmId(null);
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetchCliente(`/unit-measures/restore/${id}`, {
        method: "PUT",
      });
      addToast({ message: res.message, type: "success" });
      fetchUnidades(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al restaurar unidad de medida",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const hasFilters = statusFilter || search;
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <PageHeader
          icon={MdOutlineAdUnits}
          title="Unidades de medida"
          subtitle={
            <>
              Administra todas las unidades de medida para los productos del
              sistema
              <span className="text-on-surface-variant">
                {" "}
                · {meta.total} en total
              </span>
            </>
          }
          action={{
            label: "Nueva unidad de medida",
            onClick: openCreateModal,
            icon: MdAdd,
          }}
        />

        {/* Filtros */}
        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">
              Filtros
            </span>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-5">
            <div className="col-span-2 my-2">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Buscar por nombre..."
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
        </Card>

        {/* Estado vacío / carga compartido */}
        {loading ? (
          <Card overflowHidden bodyClassName="p-0">
            <SkeletonList rows={4} />
          </Card>
        ) : unidades.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState
              icon={MdOutlineAdUnits}
              title={
                hasFilters
                  ? "Sin resultados"
                  : "Aún no tienes unidades de medida"
              }
              message={
                hasFilters
                  ? "No encontramos unidades de medida con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer unidad de medida para comenzar."
              }
              action={
                !hasFilters
                  ? {
                      label: "Agregar unidad de medida",
                      onClick: openCreateModal,
                      icon: MdAdd,
                    }
                  : undefined
              }
            />
          </Card>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {unidades.map((unidad) => (
                <div
                  key={unidad.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {unidad.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          icon={MdEdit}
                          onClick={() => openEditModal(unidad)}
                          label="Editar"
                          tone="secondary"
                          showTooltip={false}
                        />
                        {unidad.status === "Active" ? (
                          <IconButton
                            icon={IoCloseCircle}
                            onClick={() => setConfirmId(unidad.id)}
                            label="Desactivar"
                            tone="error"
                            showTooltip={false}
                          />
                        ) : (
                          <IconButton
                            icon={MdRestoreFromTrash}
                            onClick={() => handleRestore(unidad.id)}
                            label="Reactivar"
                            tone="primary"
                            showTooltip={false}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <StatusBadge
                        label={unidad.status === "Active" ? "Activo" : "Inactivo"}
                        tone={unidad.status === "Active" ? "primary" : "neutral"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de TABLA — escritorio */}
            <Card overflowHidden bodyClassName="p-0" className="hidden lg:block">
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
                          <StatusBadge
                            label={unidad.status === "Active" ? "Activo" : "Inactivo"}
                            tone={unidad.status === "Active" ? "primary" : "neutral"}
                          />
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={MdEdit}
                              onClick={() => openEditModal(unidad)}
                              label="Editar"
                              tone="secondary"
                            />
                            {unidad.status === "Active" ? (
                              <IconButton
                                icon={IoCloseCircle}
                                onClick={() => setConfirmId(unidad.id)}
                                label="Desactivar"
                                tone="error"
                              />
                            ) : (
                              <IconButton
                                icon={MdRestoreFromTrash}
                                onClick={() => handleRestore(unidad.id)}
                                label="Reactivar"
                                tone="primary"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Paginación */}
        <Paginacion
          meta={meta}
          onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
          itemLabel="Unidades de medida"
        />
      </div>

      {/* Modal crear/editar unidad de medida */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdOutlineAdUnits className="text-xl text-on-primary-container" />
              </div>
              <button
                onClick={closeFormModal}
                disabled={formLoading}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>
            </div>

            <h3 className="font-bold text-title-md text-on-surface">
              {editingUnidades
                ? "Editar unidad de medida"
                : "Nueva unidad de medida"}
            </h3>
            <p className="text-body-md text-secondary mt-1">
              {editingUnidades
                ? "Modifica el nombre de esta unidad de medida de producto."
                : "Completa los datos para crear una nueva unidad de medida."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Nombre
                  </span>
                </label>
                <input
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  type="text"
                  value={form.name}
                  placeholder="Ej: Kilogramo"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              {formError && (
                <div className="alert bg-error-container border-none rounded-xl py-2.5">
                  <span className="text-body-sm text-on-error-container">
                    {formError}
                  </span>
                </div>
              )}

              <div className="modal-action gap-2 flex-col-reverse sm:flex-row pt-2">
                <button
                  onClick={closeFormModal}
                  type="button"
                  disabled={formLoading}
                  className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container w-full sm:w-auto"
                >
                  {formLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : editingUnidades ? (
                    "Guardar cambios"
                  ) : (
                    "Crear unidad de medida"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" />
        </dialog>
      )}

      {/* Modal confirmación desactivar */}
      <ConfirmModal
        open={!!confirmId}
        icon={IoCloseCircle}
        tone="error"
        title="¿Desactivar unidad de medida?"
        message="Esta unidad de medida quedará inactiva hasta que la restablezcas. Recuerda que no se puede desactivar una unidad de medida que tenga productos activos asociados."
        confirmLabel="Desactivar"
        loading={actionLoading}
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminUnidadesMedida;
