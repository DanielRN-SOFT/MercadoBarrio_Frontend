import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdOutlineInventory2,
  MdAdd,
  MdEdit,
  MdRestoreFromTrash,
  MdOutlineFilterAlt,
} from "react-icons/md";
import { IoCloseCircle, IoSearchSharp, IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";

// Iniciales para el avatar del producto cuando no hay imagen
const getInitials = (str = "") =>
  str
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/products/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo; // ya es una URL absoluta
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
};

// Avatar/foto del producto con fallback a iniciales si no hay foto o falla la carga
const ProductAvatar = ({
  product,
  size = "w-10 h-10",
  textSize = "text-label-sm",
}) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getPhotoUrl(product.photo);

  // Si cambia el producto/foto, reseteamos el estado de error
  useEffect(() => {
    setImgError(false);
  }, [product.photo]);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={product.name}
        onError={() => setImgError(true)}
        className={`${size} rounded-xl object-cover shrink-0 border border-outline-variant/50`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-xl bg-primary flex items-center justify-center shrink-0`}
    >
      <span className={`${textSize} font-bold text-on-primary`}>
        {getInitials(product.name) || (
          <MdOutlineInventory2 className="text-on-primary text-lg" />
        )}
      </span>
    </div>
  );
};

const MisProductos = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [name, setName] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchCliente("/product-categories/store/mine")
      .then((res) => setCategorias(res?.data ?? []))
      .catch(() => {});
  }, []);

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (name.trim()) params.set("name", name.trim());
      if (productCategoryId) params.set("productCategoryId", productCategoryId);
      if (status) params.set("status", status);

      const res = await fetchCliente(`/products?${params.toString()}`);
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page === 1) fetchProducts(1);
      else setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [name, productCategoryId, status]);

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await fetchCliente(`/products/delete/${id}`, { method: "PUT" });
      addToast({
        message: "Producto desactivado correctamente",
        type: "success",
      });
      fetchProducts(page);
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
      await fetchCliente(`/products/restore/${id}`, { method: "PUT" });
      addToast({
        message: "Producto reactivado correctamente",
        type: "success",
      });
      fetchProducts(page);
    } catch (err) {
      addToast({ message: err.message ?? "Error al reactivar", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearFilters = () => {
    setName("");
    setProductCategoryId("");
    setStatus("");
  };

  const hasFilters = name || productCategoryId || status;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdOutlineInventory2 className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                Mis Productos
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Gestiona el catálogo de tu establecimiento
                {meta.total > 0 && (
                  <span className="text-on-surface-variant">
                    {" "}
                    · {meta.total} en total
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/panel/productos/nuevo"
            className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto"
          >
            <MdAdd className="text-xl" />
            Nuevo producto
          </Link>
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

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda por nombre */}
              <label className="input input-bordered flex items-center gap-2 flex-1 rounded-full bg-surface-container-low border-outline-variant focus-within:border-primary transition-colors">
                <IoSearchSharp className="text-on-surface-variant text-lg shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="grow bg-transparent min-w-0"
                />
                {name && (
                  <button
                    onClick={() => setName("")}
                    className="btn btn-ghost btn-xs btn-circle shrink-0"
                  >
                    <IoCloseSharp />
                  </button>
                )}
              </label>

              {/* Categoría + Estado en fila en móvil */}
              <div className="grid grid-cols-2 sm:flex gap-3">
                <select
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-48 transition-colors"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-40 transition-colors"
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
        ) : products.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-center py-16 sm:py-20 px-6 text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <MdOutlineInventory2 className="text-3xl opacity-40" />
              </div>
              {hasFilters ? (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">
                    Sin resultados
                  </p>
                  <p className="text-body-md mt-1">
                    No encontramos productos con esos filtros. Intenta
                    ajustarlos.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">
                    Aún no tienes productos
                  </p>
                  <p className="text-body-md mt-1">
                    Agrega tu primer producto para comenzar.
                  </p>
                  <Link
                    to="/panel/productos/nuevo"
                    className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
                  >
                    <MdAdd className="text-xl" /> Agregar producto
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ProductAvatar product={p} size="w-11 h-11" />
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {p.name}
                          </p>
                          <span className="badge badge-ghost bg-surface-container-high border-none text-on-surface-variant badge-sm mt-1">
                            {p.productCategory?.name ?? "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          to={`/panel/productos/${p.id}/editar`}
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Editar"
                        >
                          <MdEdit className="text-lg text-secondary" />
                        </Link>
                        {p.status === "Active" ? (
                          <button
                            onClick={() => setConfirmId(p.id)}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                            aria-label="Desactivar"
                          >
                            <IoCloseCircle className="text-lg text-error" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(p.id)}
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
                      <span className="text-primary font-bold text-body-md">
                        ${Number(p.price).toLocaleString("es-CO")}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                          p.currentStock <= p.lowStockThreshold
                            ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                            : "bg-secondary-fixed text-on-secondary-fixed-variant"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.currentStock <= p.lowStockThreshold
                              ? "bg-tertiary-container"
                              : "bg-primary"
                          }`}
                        />
                        {p.currentStock} uds
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                          p.status === "Active"
                            ? "bg-primary-fixed text-on-primary-fixed-variant"
                            : "bg-surface-container-high text-secondary"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === "Active" ? "bg-primary" : "bg-outline"
                          }`}
                        />
                        {p.status === "Active" ? "Activo" : "Inactivo"}
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
                          Producto
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Categoría
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Precio
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Stock
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
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <ProductAvatar product={p} size="w-10 h-10" />
                              <span className="font-semibold text-on-surface text-body-md">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-ghost bg-surface-container-high border-none text-on-surface-variant badge-sm">
                              {p.productCategory?.name ?? "—"}
                            </span>
                          </td>
                          <td className="text-primary font-bold text-body-md">
                            ${Number(p.price).toLocaleString("es-CO")}
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                                p.currentStock <= p.lowStockThreshold
                                  ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                  : "bg-secondary-fixed text-on-secondary-fixed-variant"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.currentStock <= p.lowStockThreshold
                                    ? "bg-tertiary-container"
                                    : "bg-primary"
                                }`}
                              />
                              {p.currentStock} uds
                            </span>
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                                p.status === "Active"
                                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                                  : "bg-surface-container-high text-secondary"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === "Active"
                                    ? "bg-primary"
                                    : "bg-outline"
                                }`}
                              />
                              {p.status === "Active" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/panel/productos/${p.id}/editar`}
                                className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                                data-tip="Editar"
                              >
                                <MdEdit className="text-lg text-secondary" />
                              </Link>
                              {p.status === "Active" ? (
                                <button
                                  onClick={() => setConfirmId(p.id)}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                                  data-tip="Desactivar"
                                >
                                  <IoCloseCircle className="text-lg text-error" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRestore(p.id)}
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
          itemLabel="productos"
        />
      </div>

      {/* Modal confirmación desactivar */}
      {confirmId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center mb-3">
              <IoCloseCircle className="text-xl text-on-error-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Desactivar producto?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              El producto dejará de ser visible en el catálogo público. Puedes
              reactivarlo en cualquier momento.
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

export default MisProductos;
