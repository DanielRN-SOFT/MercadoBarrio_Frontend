import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdOutlineInventory2, MdAdd, MdEdit, MdRestoreFromTrash } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";

const MisProductos = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetchCliente(`/products?page=${p}`);
      setProducts(res.data);
      setMeta(res.meta);
    } catch {
      addToast({ message: "Error al cargar los productos", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await fetchCliente(`/products/delete/${id}`, { method: "PUT" });
      addToast({ message: "Producto desactivado correctamente", type: "success" });
      fetchProducts(page);
    } catch (err) {
      addToast({ message: err.message ?? "Error al desactivar", type: "error" });
    } finally {
      setActionLoading(false);
      setConfirmId(null);
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try {
      await fetchCliente(`/products/restore/${id}`, { method: "PUT" });
      addToast({ message: "Producto reactivado correctamente", type: "success" });
      fetchProducts(page);
    } catch (err) {
      addToast({ message: err.message ?? "Error al reactivar", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Mis Productos</h1>
            <p className="text-body-md text-secondary mt-1">
              Gestiona el catálogo de tu establecimiento.
            </p>
          </div>
          <Link
            to="/panel/productos/nuevo"
            className="btn bg-primary text-white border-none hover:brightness-110 gap-2 rounded-full font-label-md text-label-md"
          >
            <MdAdd className="text-xl" />
            Nuevo producto
          </Link>
        </div>

        {/* Tabla / Lista */}
        <div className="card bg-surface-container-low border border-outline-variant rounded-2xl">
          <div className="card-body p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/3" />
                      <div className="skeleton h-3 w-1/4" />
                    </div>
                    <div className="skeleton h-8 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-secondary">
                <MdOutlineInventory2 className="text-6xl mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-on-surface">Aún no tienes productos</p>
                <p className="text-body-md mt-1">Agrega tu primer producto para comenzar.</p>
                <Link
                  to="/panel/productos/nuevo"
                  className="btn bg-primary text-white border-none rounded-full mt-6 font-label-md text-label-md"
                >
                  <MdAdd className="text-xl" /> Agregar producto
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="text-secondary text-label-sm border-outline-variant">
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-outline-variant">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                              <MdOutlineInventory2 className="text-secondary text-lg" />
                            </div>
                            <span className="font-semibold text-on-surface text-body-md">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-primary font-bold text-body-md">
                          ${Number(p.price).toLocaleString("es-CO")}
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm text-white ${
                              p.currentStock <= p.lowStockThreshold
                                ? "badge-warning"
                                : "badge-success"
                            }`}
                          >
                            {p.currentStock} uds
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              p.status === "Active"
                                ? "bg-primary-container text-on-primary-container"
                                : "bg-surface-container-high text-secondary"
                            }`}
                          >
                            {p.status === "Active" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/panel/productos/${p.id}/editar`}
                              className="btn btn-ghost btn-sm btn-circle tooltip"
                              data-tip="Editar"
                            >
                              <MdEdit className="text-lg text-secondary" />
                            </Link>
                            {p.status === "Active" ? (
                              <button
                                onClick={() => setConfirmId(p.id)}
                                className="btn btn-ghost btn-sm btn-circle tooltip"
                                data-tip="Desactivar"
                              >
                                <IoCloseCircle className="text-lg text-error" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(p.id)}
                                disabled={actionLoading}
                                className="btn btn-ghost btn-sm btn-circle tooltip"
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
            )}
          </div>
        </div>

        {/* Paginación */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-ghost btn-sm rounded-full"
            >
              Anterior
            </button>
            <span className="flex items-center text-body-md text-secondary px-2">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="btn btn-ghost btn-sm rounded-full"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal confirmación desactivar */}
      {confirmId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-low rounded-2xl">
            <h3 className="font-bold text-title-md text-on-surface">¿Desactivar producto?</h3>
            <p className="text-body-md text-secondary mt-2">
              El producto dejará de ser visible en el catálogo público. Puedes reactivarlo en
              cualquier momento.
            </p>
            <div className="modal-action gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="btn btn-ghost rounded-full font-label-md"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={actionLoading}
                className="btn bg-error text-on-error border-none rounded-full font-label-md"
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

export default MisProductos;
