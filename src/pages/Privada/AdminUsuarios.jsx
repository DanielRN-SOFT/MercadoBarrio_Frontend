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
  MdSearch,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";

// ─── Utilidades ────────────────────────────────────────────────────────────

// Iniciales del nombre para el avatar, ej: "Juan Pérez" -> "JP"
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
};

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", roleId: "" };

// Avatar circular con iniciales, misma línea visual que DayAvatar/ProductAvatar
const UserAvatar = ({
  name,
  size = "w-11 h-11",
  textSize = "text-label-sm",
}) => (
  <div
    className={`${size} rounded-xl bg-primary flex items-center justify-center shrink-0`}
  >
    <span className={`${textSize} font-bold text-on-primary`}>
      {getInitials(name)}
    </span>
  </div>
);

const MisUsuarios = () => {
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdPeopleAlt className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                Mis Usuarios
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Administra los usuarios de tu establecimiento
                {meta.total > 0 && (
                  <span className="text-on-surface-variant">
                    {" "}
                    · {meta.total} en total
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto"
          >
            <MdAdd className="text-xl" />
            Nuevo usuario
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

            <div className="relative">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre, correo o teléfono..."
                className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full pl-10 relative z-0 transition-colors"
              />
            </div>

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
        ) : users.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-center py-16 sm:py-20 px-6 text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <MdPeopleAlt className="text-3xl opacity-40" />
              </div>
              <p className="font-semibold text-on-surface text-body-lg">
                {hasFilters ? "Sin resultados" : "Aún no tienes usuarios"}
              </p>
              <p className="text-body-md mt-1">
                {hasFilters
                  ? "No encontramos usuarios con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer usuario para comenzar."}
              </p>
              {!hasFilters && (
                <button
                  onClick={openCreateModal}
                  className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
                >
                  <MdAdd className="text-xl" /> Agregar usuario
                </button>
              )}
            </div>
          </div>
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
                        <UserAvatar name={u.name} />
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
                        <button
                          onClick={() => openEditModal(u)}
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Editar"
                        >
                          <MdEdit className="text-lg text-secondary" />
                        </button>
                        {u.status === "Active" ? (
                          <button
                            onClick={() => setConfirmId(u.id)}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                            aria-label="Desactivar"
                          >
                            <IoCloseCircle className="text-lg text-error" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(u.id)}
                            disabled={actionLoading}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-primary-container/20"
                            aria-label="Reactivar"
                          >
                            <MdRestoreFromTrash className="text-lg text-primary" />
                          </button>
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
                      <span
                        className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                          u.status === "Active"
                            ? "bg-primary-fixed text-on-primary-fixed-variant"
                            : "bg-surface-container-high text-secondary"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "Active" ? "bg-primary" : "bg-outline"
                          }`}
                        />
                        {u.status === "Active" ? "Activo" : "Inactivo"}
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
                              <UserAvatar name={u.name} size="w-10 h-10" />
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
                            <span
                              className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                                u.status === "Active"
                                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                                  : "bg-surface-container-high text-secondary"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === "Active"
                                    ? "bg-primary"
                                    : "bg-outline"
                                }`}
                              />
                              {u.status === "Active" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(u)}
                                className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                                data-tip="Editar"
                              >
                                <MdEdit className="text-lg text-secondary" />
                              </button>
                              {u.status === "Active" ? (
                                <button
                                  onClick={() => setConfirmId(u.id)}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                                  data-tip="Desactivar"
                                >
                                  <IoCloseCircle className="text-lg text-error" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRestore(u.id)}
                                  disabled={actionLoading}
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

        {/* Paginación */}
        <Paginacion
          meta={meta}
          onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
          itemLabel="usuarios"
        />
      </div>

      {/* Modal editar usuario */}
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

      {/* Modal confirmación desactivar */}
      {confirmId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center mb-3">
              <IoCloseCircle className="text-xl text-on-error-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Desactivar usuario?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              El usuario no podrá acceder al sistema. Puedes reactivarlo en
              cualquier momento.
            </p>
            <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
              <button
                onClick={() => setConfirmId(null)}
                className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={actionLoading}
                className="btn bg-error text-on-error border-none rounded-full font-label-md hover:brightness-95 w-full sm:w-auto"
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Desactivar"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmId(null)} />
        </dialog>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default MisUsuarios;
