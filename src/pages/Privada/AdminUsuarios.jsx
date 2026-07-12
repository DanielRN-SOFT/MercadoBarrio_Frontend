import { useState, useEffect } from "react";
import {
  MdPeopleAlt,
  MdAdd,
  MdEdit,
  MdRestoreFromTrash,
  MdEmail,
  MdPhone,
  MdBadge,
  MdLock,
  MdOutlineFilterAlt,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import SearchInput from "../../components/ui/SearchInput";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import IconButton from "../../components/ui/IconButton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Avatar from "../../components/ui/Avatar";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", roleId: "" };

const AdminUsuarios = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Roles disponibles, para el select del formulario y del filtro
  const [roles, setRoles] = useState([]);

  // Modal de crear/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter) params.set("roleId", roleFilter);
      if (search) params.set("search", search);

      const res = await fetchCliente(`/users?${params.toString()}`);
      setUsers(res.data);
      setMeta(res.meta);
    } catch (err) {
      addToast({ message: "Error al cargar los usuarios", type: "error" });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Ajusta el endpoint si en tu API los roles viven en otra ruta
      const res = await fetchCliente(`/roles?page=1`);
      setRoles(res.data ?? []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    if (page === 1) fetchUsers(1);
    else setPage(1);
  }, [statusFilter, roleFilter, search]);

  // Debounce: espera 400ms desde la última tecla antes de disparar la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleClearFilters = () => {
    setStatusFilter("");
    setRoleFilter("");
    setSearchInput("");
    setSearch("");
  };

  const hasFilters = statusFilter || roleFilter || search;

  // ─── Crear / Editar ─────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      password: "",
      roleId: user.roleId ?? "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setShowFormModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (editingUser) {
      if (!form.name || !form.email || !form.phone) {
        setFormError("Todos los campos son obligatorios");
        return;
      }
    } else if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.roleId
    ) {
      setFormError("Todos los campos son obligatorios");
      return;
    }

    setFormLoading(true);
    try {
      if (editingUser) {
        await fetchCliente(`/users/${editingUser.id}`, {
          method: "PUT",
          body: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
        });
        addToast({
          message: "Usuario actualizado correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/users", {
          method: "POST",
          body: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            roleId: form.roleId,
          },
        });
        addToast({ message: "Usuario creado correctamente", type: "success" });
      }

      setShowFormModal(false);
      setEditingUser(null);
      setForm(EMPTY_FORM);
      fetchUsers(page);
    } catch (err) {
      // El backend puede devolver 409 si el email ya está registrado
      setFormError(err.message ?? "Error al guardar el usuario");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Desactivar / Restaurar ─────────────────────────────────────────────

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await fetchCliente(`/users/delete/${id}`, { method: "PUT" });
      addToast({
        message: "Usuario desactivado correctamente",
        type: "success",
      });
      fetchUsers(page);
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
      await fetchCliente(`/users/restore/${id}`, { method: "PUT" });
      addToast({
        message: "Usuario reactivado correctamente",
        type: "success",
      });
      fetchUsers(page);
    } catch (err) {
      addToast({ message: err.message ?? "Error al reactivar", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const ROLES = {
    Admin: "Administrador",
    Grocer: "Propietario de tienda",
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        <PageHeader
          icon={MdPeopleAlt}
          title="Mis Usuarios"
          subtitle={
            <>
              Administra los usuarios de tu establecimiento
              {meta.total > 0 && (
                <span className="text-on-surface-variant"> · {meta.total} en total</span>
              )}
            </>
          }
          action={{ label: "Nuevo usuario", onClick: openCreateModal, icon: MdAdd }}
        />

        {/* Filtros */}
        <Card bodyClassName="p-4 sm:p-5 gap-3">
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">Filtros</span>
          </div>

          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por nombre, correo o teléfono..."
          />

          <div className="grid grid-cols-2 sm:flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-40 transition-colors"
            >
              <option value="">Todos los estados</option>
              <option value="Active">Activo</option>
              <option value="Inactive">Inactivo</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-48 transition-colors"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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
        ) : users.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState
              icon={MdPeopleAlt}
              title={hasFilters ? "Sin resultados" : "Aún no tienes usuarios"}
              message={
                hasFilters
                  ? "No encontramos usuarios con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer usuario para comenzar."
              }
              action={hasFilters ? undefined : { label: "Agregar usuario", onClick: openCreateModal, icon: MdAdd }}
            />
          </Card>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar text={u.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {u.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-body-sm text-on-surface-variant mt-1 truncate">
                            <MdEmail className="text-sm shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          icon={MdEdit}
                          onClick={() => openEditModal(u)}
                          label="Editar"
                          tone="secondary"
                          showTooltip={false}
                        />
                        {u.status === "Active" ? (
                          <IconButton
                            icon={IoCloseCircle}
                            onClick={() => setConfirmId(u.id)}
                            label="Desactivar"
                            tone="error"
                            showTooltip={false}
                          />
                        ) : (
                          <IconButton
                            icon={MdRestoreFromTrash}
                            onClick={() => handleRestore(u.id)}
                            disabled={actionLoading}
                            label="Reactivar"
                            tone="primary"
                            showTooltip={false}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                        <span className="inline-flex items-center gap-1">
                          <MdPhone className="text-sm" />
                          {u.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MdBadge className="text-sm" />
                          Rol #{u.roleId}
                        </span>
                      </div>
                      <StatusBadge
                        label={u.status === "Active" ? "Activo" : "Inactivo"}
                        tone={u.status === "Active" ? "primary" : "neutral"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de TABLA — escritorio */}
            <Card overflowHidden bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant">
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 first:rounded-tl-2xl">
                        Usuario
                      </th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                        Contacto
                      </th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                        Rol
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
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar text={u.name} size="w-10 h-10" />
                            <span className="font-semibold text-on-surface text-body-md">
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-on-surface text-body-md">
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5">
                              <MdEmail className="text-base text-on-surface-variant" />
                              {u.email}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                              <MdPhone className="text-sm" />
                              {u.phone}
                            </span>
                          </div>
                        </td>
                        <td className="text-on-surface text-body-md">
                          Rol {ROLES[u.role.name]}
                        </td>
                        <td>
                          <StatusBadge
                            label={u.status === "Active" ? "Activo" : "Inactivo"}
                            tone={u.status === "Active" ? "primary" : "neutral"}
                          />
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={MdEdit}
                              onClick={() => openEditModal(u)}
                              label="Editar"
                              tone="secondary"
                            />
                            {u.status === "Active" ? (
                              <IconButton
                                icon={IoCloseCircle}
                                onClick={() => setConfirmId(u.id)}
                                label="Desactivar"
                                tone="error"
                              />
                            ) : (
                              <IconButton
                                icon={MdRestoreFromTrash}
                                onClick={() => handleRestore(u.id)}
                                disabled={actionLoading}
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
          itemLabel="usuarios"
        />
      </div>

      {/* Modal crear/editar usuario */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdPeopleAlt className="text-xl text-on-primary-container" />
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
              {editingUser ? "Editar usuario" : "Nuevo usuario"}
            </h3>
            <p className="text-body-md text-secondary mt-1">
              {editingUser
                ? "Modifica el nombre, correo o teléfono del usuario."
                : "Completa los datos para crear un nuevo usuario."}
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
                  placeholder="Ej: Juan Pérez"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Correo electrónico
                  </span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Teléfono
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Ej: 3001234567"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              {!editingUser && (
                <>
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-label-md font-semibold text-on-surface-variant">
                        Contraseña
                      </span>
                    </label>
                    <div className="relative">
                      <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        placeholder="Mínimo 8 caracteres"
                        className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full pl-10 relative z-0"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-label-md font-semibold text-on-surface-variant">
                        Rol
                      </span>
                    </label>
                    <select
                      value={form.roleId}
                      onChange={(e) =>
                        setForm({ ...form, roleId: e.target.value })
                      }
                      className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                    >
                      <option value="" disabled>
                        Selecciona un rol
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

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
                  ) : editingUser ? (
                    "Guardar cambios"
                  ) : (
                    "Crear usuario"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeFormModal} />
        </dialog>
      )}

      <ConfirmModal
        open={!!confirmId}
        icon={IoCloseCircle}
        tone="error"
        title="¿Desactivar usuario?"
        message="El usuario no podrá acceder al sistema. Puedes reactivarlo en cualquier momento."
        confirmLabel="Desactivar"
        loading={actionLoading}
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminUsuarios;
