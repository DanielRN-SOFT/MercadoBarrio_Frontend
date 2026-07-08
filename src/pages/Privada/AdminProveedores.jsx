import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdOutlineFilterAlt,
  MdSearch,
  MdBadge,
  MdEmail,
  MdPhone,
  MdDirections,
  MdLocationCity,
  MdOutlineApartment,
  MdRestoreFromTrash,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import { useEffect, useState } from "react";
import useToast from "../../hooks/useToast";
import fetchCliente from "../../config/fetchCliente";

const EMPTY_FORM = { name: "", email: "", address: "", phone: "", city: "" };

const AdminProveedores = () => {
  const { addToast, toasts, removeToast } = useToast();
  const [proveedores, setProveedores] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formError, setFormError] = useState("");

  const fetchProveedores = async (p) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetchCliente(`/suppliers?${params.toString()}`);
      setProveedores(res.data);
      setMeta(res.meta);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores(page);
  }, [page]);

  useEffect(() => {
    if (page === 1) fetchProveedores(1);
    else setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleClearFilters = () => {
    setStatusFilter("");
    setSearchInput("");
    setSearch("");
  };

  const openCreateModal = () => {
    setEditingProveedor(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditModal = (proveedor) => {
    setEditingProveedor(proveedor);
    setForm(proveedor);
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setEditingProveedor(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowFormModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (
        (!form.name.trim(),
        !form.email.trim(),
        !form.phone.trim(),
        !form.address.trim(),
        !form.city.trim())
      ) {
        setFormError("Todos los campos son obligatorios");
        return;
      }

      if (editingProveedor) {
        const res = await fetchCliente(`/suppliers/${editingProveedor.id}`, {
          method: "PUT",
          body: form,
        });
        addToast({ message: res.message, type: "success" });
      } else {
        const res = await fetchCliente("/suppliers", {
          method: "POST",
          body: form,
        });

        addToast({ message: res.message, type: "success" });
      }

      fetchProveedores(page);
      closeFormModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    console.log(id);
    try {
      const res = await fetchCliente(`/suppliers/delete/${id}`, {
        method: "PUT",
      });
      addToast({ message: res.message, type: "success" });
    } catch (error) {
      console.log(error);
      addToast({ message: error.message, type: "error" });
    } finally {
      setConfirmId(null);
      fetchProveedores(page);
      setActionLoading(false);
    }
  };


    const handleRestore = async (id) => {
      setActionLoading(true);
      console.log(id);
      try {
        const res = await fetchCliente(`/suppliers/restore/${id}`, {
          method: "PUT",
        });
        addToast({ message: res.message, type: "success" });
      } catch (error) {
        console.log(error);
        addToast({ message: error.message, type: "error" });
      } finally {
        setConfirmId(null);
        fetchProveedores(page);
        setActionLoading(false);
      }
    };

  const hasActiveFilters = statusFilter || search;
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdBadge className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                Proveedores
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Administra todos los proveedores para registrar movimientos de
                inventario
                <span className="text-on-surface-variant">
                  {" "}
                  · {meta.total} en total
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto"
          >
            <MdAdd className="text-xl" />
            Nuevo proveedor
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

            <div className="md:grid md:grid-cols-2 gap-5">
              <div className="relative my-2">
                <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
                <input
                  onChange={(e) => setSearchInput(e.target.value)}
                  value={searchInput}
                  type="text"
                  placeholder="Buscar por nombre, telefono, email, o ciudad..."
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full pl-10 relative z-0 transition-colors"
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

            {hasActiveFilters && (
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

        {/* Vista de TARJETAS — móvil y tablet */}
        <div className="lg:hidden space-y-3">
          {proveedores.map((rol) => (
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
                    <button
                      className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                      aria-label="Editar"
                    >
                      <MdEdit className="text-lg text-secondary" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                      aria-label="Eliminar"
                    >
                      <MdDelete className="text-lg text-error" />
                    </button>
                  </div>
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
                      Contacto
                    </th>
                    <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                      Direccion
                    </th>
                    <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                      Ciudad
                    </th>

                    <th>Estado</th>
                    <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 text-right last:rounded-tr-2xl">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {proveedores.map((proveedor) => (
                    <tr
                      key={proveedor.id}
                      className="hover:bg-surface-container-low transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray- text-body-md">
                            {proveedor.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-on-surface text-body-md">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5">
                            <MdEmail className="text-base text-on-surface-variant" />
                            {proveedor.email}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                            <MdPhone className="text-sm" />
                            {proveedor.phone}
                          </span>
                        </div>
                      </td>
                      <td className="text-on-surface text-body-md">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5">
                            <MdDirections className="text-base text-on-surface-variant" />
                            {proveedor.address}
                          </span>
                        </div>
                      </td>

                      <td className="text-on-surface text-body-md">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5">
                            <MdLocationCity className="text-base text-on-surface-variant" />
                            {proveedor.city}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                            proveedor.status === "Active"
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-surface-container-high text-secondary"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              proveedor.status === "Active"
                                ? "bg-primary"
                                : "bg-outline"
                            }`}
                          />
                          {proveedor.status === "Active"
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(proveedor)}
                            className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                            data-tip="Editar"
                          >
                            <MdEdit className="text-lg text-secondary" />
                          </button>
                          {proveedor.status === "Active" ? (
                            <button
                              onClick={() => setConfirmId(proveedor.id)}
                              className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                              data-tip="Desactivar"
                            >
                              <IoCloseCircle className="text-lg text-error" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(proveedor.id)}
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

        {/* Paginación */}
        <Paginacion meta={meta} itemLabel="roles" />
      </div>

      {/* Modal crear/editar rol */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdOutlineApartment className="text-xl text-on-primary-container" />
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
              Nuevo proveedor
            </h3>
            <p className="text-body-md text-secondary mt-1">
              Completa los datos para crear un nuevo proveedor
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
                  value={form.name}
                  type="text"
                  placeholder="Ej: Productos nutritivos del Valle"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Email
                  </span>
                </label>
                <input
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  value={form.email}
                  type="text"
                  placeholder="empresa@gmail.com"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Direccion
                  </span>
                </label>
                <input
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  value={form.address}
                  type="text"
                  placeholder="Calle 4 #78-45 El Diamante"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Telefono
                    </span>
                  </label>
                  <input
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    value={form.phone}
                    type="number"
                    placeholder="3158905738"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Ciudad
                    </span>
                  </label>
                  <input
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    value={form.city}
                    type="text"
                    placeholder="Cartago"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                  />
                </div>
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
                  className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container w-full sm:w-auto"
                >
                  Crear rol
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" />
        </dialog>
      )}

      {/* Modal confirmación eliminar */}
      {confirmId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center mb-3">
              <MdDelete className="text-xl text-on-error-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Eliminar este proveedor?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              Esta acción se puede revertir, pero no podras eliminar un
              proveedor asociado a un movimiento activo
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
                className="btn bg-error text-on-error border-none rounded-full font-label-md hover:brightness-95 w-full sm:w-auto"
              >
                Eliminar
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

export default AdminProveedores;
