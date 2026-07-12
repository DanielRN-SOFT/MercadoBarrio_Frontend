import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdOutlineFilterAlt,
  MdBadge,
} from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import IconButton from "../../components/ui/IconButton";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";

const EMPTY_FORM = { name: "" };

const AdminRoles = () => {
  const { toasts, addToast, removeToast } = useToast();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Modal de crear/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchRoles = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (search) params.set("search", search);
      const res = await fetchCliente(`/roles?${params.toString()}`);
      setRoles(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(page);
  }, [page]);

  useEffect(() => {
    if (page === 1) fetchRoles(1);
    else setPage(1);
  }, [search]);

  // Debounce: espera 400ms desde la última tecla antes de disparar la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // ─── Crear / Editar ─────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (rol) => {
    setEditingRole(rol);
    setForm({
      name: rol.name || "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setShowFormModal(false);
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleClearFilters = () => {
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
      if (editingRole) {
        await fetchCliente(`/roles/${editingRole.id}`, {
          method: "PUT",
          body: {
            name: form.name,
          },
        });

        addToast({
          message: "Rol actualizado correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/roles", {
          method: "POST",
          body: {
            name: form.name,
          },
        });

        addToast({
          message: "Rol creado correctamente",
          type: "success",
        });
      }

      setShowFormModal(false);
      setEditingRole(null);
      setForm(EMPTY_FORM);
      fetchRoles(page);
    } catch (err) {
      // El backend puede devolver 409 si el nombre ya se encuentra registrado
      setFormError(err.message ?? "Error al guardar el rol");
    } finally {
      setFormLoading(false);
    }
  };

  // El backend elimina el rol físicamente (no hay soft-delete/restore para roles)
  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetchCliente(`/roles/${id}`, {
        method: "DELETE",
      });
      addToast({
        message: res.message,
        type: "success",
      });

      fetchRoles(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al eliminar el rol",
        type: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmId(null);
    }
  };

  const hasFilters = search;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <PageHeader
          icon={MdBadge}
          title="Roles del sistema"
          subtitle={
            <>
              Administra todos los roles del sistema
              {meta.total > 0 && (
                <span className="text-on-surface-variant">
                  {" "}
                  · {meta.total} en total
                </span>
              )}
            </>
          }
          action={{ label: "Nuevo rol", onClick: openCreateModal, icon: MdAdd }}
        />

        {/* Filtros */}
        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">
              Filtros
            </span>
          </div>

          <div className="my-2">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Buscar por nombre de rol..."
            />
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
        ) : roles.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState
              icon={MdBadge}
              title={hasFilters ? "Sin resultados" : "Aún no tienes roles"}
              message={
                hasFilters
                  ? "No encontramos roles con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer rol para comenzar."
              }
              action={
                !hasFilters
                  ? { label: "Agregar rol", onClick: openCreateModal, icon: MdAdd }
                  : undefined
              }
            />
          </Card>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {roles.map((rol) => (
                <div
                  key={rol.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {rol.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          icon={MdEdit}
                          onClick={() => openEditModal(rol)}
                          label="Editar"
                          tone="secondary"
                          showTooltip={false}
                        />
                        <IconButton
                          icon={MdDelete}
                          onClick={() => setConfirmId(rol.id)}
                          label="Eliminar"
                          tone="error"
                          showTooltip={false}
                        />
                      </div>
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
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 text-right last:rounded-tr-2xl">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {roles.map((rol) => (
                      <tr
                        key={rol.id}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-on-surface text-body-md">
                              {rol.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={MdEdit}
                              onClick={() => openEditModal(rol)}
                              label="Editar"
                              tone="secondary"
                            />
                            <IconButton
                              icon={MdDelete}
                              onClick={() => setConfirmId(rol.id)}
                              label="Eliminar"
                              tone="error"
                            />
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
          itemLabel="roles"
        />
      </div>

      {/* Modal crear/editar rol */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdBadge className="text-xl text-on-primary-container" />
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
              {editingRole ? "Editar rol" : "Nuevo rol"}
            </h3>
            <p className="text-body-md text-secondary mt-1">
              {editingRole
                ? "Modifica el nombre de este rol."
                : "Completa los datos para crear un nuevo rol."}
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
                  placeholder="Ej: Vendedor"
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
                  ) : editingRole ? (
                    "Guardar cambios"
                  ) : (
                    "Crear rol"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" />
        </dialog>
      )}

      {/* Modal confirmación eliminar (eliminación permanente, sin restaurar) */}
      <ConfirmModal
        open={!!confirmId}
        icon={MdDelete}
        tone="error"
        title="¿Eliminar este rol?"
        message="Esta acción es permanente y no se puede deshacer. No podrás eliminar un rol que tenga usuarios activos asociados."
        confirmLabel="Eliminar"
        loading={actionLoading}
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminRoles;
