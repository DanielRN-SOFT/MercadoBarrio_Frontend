import {
  MdAdd,
  MdEdit,
  MdRestoreFromTrash,
  MdOutlineFilterAlt,
  MdNewLabel,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import IconButton from "../../components/ui/IconButton";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";

const EMPTY_FORM = { name: "" };

const AdminCategoriasTienda = () => {
  const { toasts, addToast, removeToast } = useToast();

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal de crear/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategoriasTienda = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetchCliente(`/store-categories?${params.toString()}`);
      setCategorias(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriasTienda(page);
  }, [page]);

  useEffect(() => {
    if (page === 1) fetchCategoriasTienda(1);
    else setPage(1);
  }, [statusFilter, search]);

  // Debounce: espera 400ms desde la última tecla antes de disparar la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // ─── Crear / Editar ─────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (categoria) => {
    setEditingCategory(categoria);
    setForm({
      name: categoria.name || "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setShowFormModal(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setSearch("");
    setSearchInput("");
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
      if (editingCategory) {
        await fetchCliente(`/store-categories/${editingCategory.id}`, {
          method: "PUT",
          body: {
            name: form.name,
          },
        });

        addToast({
          message: "Categoria de tienda actualizada correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/store-categories", {
          method: "POST",
          body: {
            name: form.name,
          },
        });

        addToast({
          message: "Categoria de tienda creada correctamente",
          type: "success",
        });
      }

      setShowFormModal(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
      fetchCategoriasTienda(page);
    } catch (err) {
      // El backend puede devolver 409 si el nombre ya se encuentra registrado
      setFormError(err.message ?? "Error al guardar la categoria");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetchCliente(`/store-categories/delete/${id}`, {
        method: "PUT",
      });
      addToast({
        message: res.message,
        type: "success",
      });

      fetchCategoriasTienda(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al desactivar",
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
      const res = await fetchCliente(`/store-categories/restore/${id}`, {
        method: "PUT",
      });
      addToast({
        message: res.message,
        type: "success",
      });

      fetchCategoriasTienda(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al restablecer",
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
          icon={MdNewLabel}
          title="Categorias de tiendas"
          subtitle={
            <>
              Administra todas las categorias de tienda del sistema
              {meta.total > 0 && (
                <span className="text-on-surface-variant">
                  {" "}
                  · {meta.total} en total
                </span>
              )}
            </>
          }
          action={{
            label: "Nueva categoria",
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
                placeholder="Buscar por nombre, correo o teléfono..."
              />
            </div>

            <div className="">
              <select
                onChange={(e) => setStatusFilter(e.target.value)}
                value={statusFilter}
                className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-56 transition-colors my-2"
              >
                <option value="">Todos los estados</option>
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo</option>
              </select>
            </div>
          </div>

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
        ) : categorias.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState
              icon={MdNewLabel}
              title={
                hasFilters ? "Sin resultados" : "Aún no tienes categorias de tiendas"
              }
              message={
                hasFilters
                  ? "No encontramos categorias de tiendas con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer categoria de tienda para comenzar."
              }
              action={
                !hasFilters
                  ? {
                      label: "Agregar categoria",
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
              {categorias.map((cat) => (
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
                        <IconButton
                          icon={MdEdit}
                          onClick={() => openEditModal(cat)}
                          label="Editar"
                          tone="secondary"
                          showTooltip={false}
                        />
                        {cat.status === "Active" ? (
                          <IconButton
                            icon={IoCloseCircle}
                            onClick={() => setConfirmId(cat.id)}
                            label="Desactivar"
                            tone="error"
                            showTooltip={false}
                          />
                        ) : (
                          <IconButton
                            icon={MdRestoreFromTrash}
                            onClick={() => handleRestore(cat.id)}
                            label="Reactivar"
                            tone="primary"
                            showTooltip={false}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <StatusBadge
                        label={cat.status === "Active" ? "Activo" : "Inactivo"}
                        tone={cat.status === "Active" ? "primary" : "neutral"}
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
                    {categorias.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-on-surface text-body-md">
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge
                            label={cat.status === "Active" ? "Activo" : "Inactivo"}
                            tone={cat.status === "Active" ? "primary" : "neutral"}
                          />
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={MdEdit}
                              onClick={() => openEditModal(cat)}
                              label="Editar"
                              tone="secondary"
                            />
                            {cat.status === "Active" ? (
                              <IconButton
                                icon={IoCloseCircle}
                                onClick={() => setConfirmId(cat.id)}
                                label="Desactivar"
                                tone="error"
                              />
                            ) : (
                              <IconButton
                                icon={MdRestoreFromTrash}
                                onClick={() => handleRestore(cat.id)}
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
          itemLabel="categorias"
        />
      </div>

      {/* Modal crear/editar categoria */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdNewLabel className="text-xl text-on-primary-container" />
              </div>
              <button
                onClick={closeFormModal}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>
            </div>

            <h3 className="font-bold text-title-md text-on-surface">
              {editingCategory ? "Editar categoria" : "Nueva categoria"}
            </h3>
            <p className="text-body-md text-secondary mt-1">
              {editingCategory
                ? "Modifica el nombre de esta categoria de tienda."
                : "Completa los datos para crear una nueva categoria."}
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Nombre
                  </span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Tienda de variedades"
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
                  type="button"
                  onClick={closeFormModal}
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
                  ) : editingCategory ? (
                    "Guardar cambios"
                  ) : (
                    "Crear categoria"
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
        title="¿Desactivar categoria de tienda?"
        message="Esta categoria no se podrá utilizar en ninguna otra tienda hasta que vuelvas a restablecerla, recuerda que no puedes eliminar una categoria asociada a una tienda."
        confirmLabel="Desactivar"
        loading={actionLoading}
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminCategoriasTienda;
