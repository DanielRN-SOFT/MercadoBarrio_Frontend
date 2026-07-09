import { useState, useEffect } from "react";
import {
  MdOutlineInventory2,
  MdOutlineFilterAlt,
  MdWarningAmber,
  MdOutlineRemoveShoppingCart,
  MdCheckCircleOutline,
  MdTune,
} from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
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

const ProductAvatar = ({ product, size = "w-10 h-10" }) => {
  const [imgError, setImgError] = useState(false);

  if (product.photo && !imgError) {
    return (
      <img
        src={product.photo}
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
      <span className="text-label-sm font-bold text-on-primary">
        {getInitials(product.name) || (
          <MdOutlineInventory2 className="text-on-primary text-lg" />
        )}
      </span>
    </div>
  );
};

// Config visual por estado de stock (RF-18)
const STOCK_STATUS_CONFIG = {
  Normal: {
    label: "Normal",
    dot: "bg-primary",
    badge: "bg-secondary-fixed text-on-secondary-fixed-variant",
  },
  Critico: {
    label: "Crítico",
    dot: "bg-tertiary-container",
    badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  Agotado: {
    label: "Agotado",
    dot: "bg-error",
    badge: "bg-error-container text-on-error-container",
  },
};

const StockStatusBadge = ({ status }) => {
  const cfg = STOCK_STATUS_CONFIG[status] ?? STOCK_STATUS_CONFIG.Normal;
  return (
    <span
      className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const Inventario = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({ total: 0, criticos: 0, agotados: 0 });

  // Filtros
  const [name, setName] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  // Modal de umbral por categoría (RF-19)
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholdCategoryId, setThresholdCategoryId] = useState("");
  const [thresholdValue, setThresholdValue] = useState("");
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    fetchCliente("/product-categories/store/mine")
      .then((res) => setCategorias(res?.data ?? []))
      .catch(() => {});
  }, []);

  const fetchInventory = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (name.trim()) params.set("name", name.trim());
      if (productCategoryId) params.set("productCategoryId", productCategoryId);
      if (stockStatus) params.set("stockStatus", stockStatus);

      const res = await fetchCliente(`/products/inventory?${params.toString()}`);
      setProducts(res.data);
      setMeta(res.meta);
      setSummary(res.summary);
    } catch {
      addToast({ message: "Error al cargar el inventario", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(page);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page === 1) fetchInventory(1);
      else setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [name, productCategoryId, stockStatus]);

  const handleClearFilters = () => {
    setName("");
    setProductCategoryId("");
    setStockStatus("");
  };

  const hasFilters = name || productCategoryId || stockStatus;

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!thresholdCategoryId || thresholdValue === "") {
      addToast({ message: "Selecciona una categoría y un umbral", type: "error" });
      return;
    }
    setSavingThreshold(true);
    try {
      const res = await fetchCliente("/products/threshold/by-category", {
        method: "PUT",
        body: JSON.stringify({
          productCategoryId: parseInt(thresholdCategoryId),
          lowStockThreshold: parseInt(thresholdValue),
        }),
      });
      addToast({
        message: res.message ?? "Umbral actualizado correctamente",
        type: "success",
      });
      setShowThresholdModal(false);
      setThresholdCategoryId("");
      setThresholdValue("");
      fetchInventory(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al actualizar el umbral",
        type: "error",
      });
    } finally {
      setSavingThreshold(false);
    }
  };

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
                Inventario
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Stock en tiempo real y umbrales de alerta
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowThresholdModal(true)}
            className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto"
          >
            <MdTune className="text-xl" />
            Umbral por categoría
          </button>
        </div>

        {/* Resumen (RF-18) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <div className="card-body p-4 sm:p-5 flex-row items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-secondary-fixed flex items-center justify-center shrink-0">
                <MdCheckCircleOutline className="text-xl text-on-secondary-fixed-variant" />
              </div>
              <div>
                <p className="text-body-sm text-secondary">Total productos activos</p>
                <p className="text-title-lg font-bold text-on-surface">{summary.total}</p>
              </div>
            </div>
          </div>
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <div className="card-body p-4 sm:p-5 flex-row items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-tertiary-fixed flex items-center justify-center shrink-0">
                <MdWarningAmber className="text-xl text-on-tertiary-fixed-variant" />
              </div>
              <div>
                <p className="text-body-sm text-secondary">Stock crítico</p>
                <p className="text-title-lg font-bold text-on-surface">{summary.criticos}</p>
              </div>
            </div>
          </div>
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <div className="card-body p-4 sm:p-5 flex-row items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center shrink-0">
                <MdOutlineRemoveShoppingCart className="text-xl text-on-error-container" />
              </div>
              <div>
                <p className="text-body-sm text-secondary">Agotados</p>
                <p className="text-title-lg font-bold text-on-surface">{summary.agotados}</p>
              </div>
            </div>
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full rounded-xl bg-surface-container-low border-outline-variant/70 focus:border-primary text-body-md"
              />
              <select
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="select select-bordered w-full rounded-xl bg-surface-container-low border-outline-variant/70 focus:border-primary text-body-md"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="select select-bordered w-full rounded-xl bg-surface-container-low border-outline-variant/70 focus:border-primary text-body-md"
              >
                <option value="">Todos los estados</option>
                <option value="Normal">Normal</option>
                <option value="Critico">Crítico</option>
                <option value="Agotado">Agotado</option>
              </select>
            </div>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="self-start btn btn-ghost btn-sm rounded-full text-secondary gap-1"
              >
                <IoCloseSharp className="text-base" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl">
            <div className="card-body items-center text-center py-12">
              <MdOutlineInventory2 className="text-4xl text-outline mb-2" />
              <p className="text-body-md text-secondary">
                No se encontraron productos con los filtros aplicados
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil */}
            <div className="lg:hidden space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 flex-row items-center gap-3">
                    <ProductAvatar product={p} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-body-md truncate">
                        {p.name}
                      </p>
                      <p className="text-body-sm text-secondary truncate">
                        {p.productCategory?.name ?? "Sin categoría"} · umbral{" "}
                        {p.lowStockThreshold}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-label-sm font-semibold text-on-surface">
                          {p.currentStock} uds
                        </span>
                        <StockStatusBadge status={p.stockStatus} />
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
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 first:rounded-tl-2xl">
                          Producto
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Categoría
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Stock actual
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Umbral
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 last:rounded-tr-2xl">
                          Estado
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
                          <td className="font-bold text-body-md text-on-surface">
                            {p.currentStock} uds
                          </td>
                          <td className="text-secondary text-body-md">
                            {p.lowStockThreshold} uds
                          </td>
                          <td>
                            <StockStatusBadge status={p.stockStatus} />
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

      {/* Modal umbral por categoría (RF-19) */}
      {showThresholdModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center mb-3">
              <MdTune className="text-xl text-on-primary-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              Configurar umbral por categoría
            </h3>
            <p className="text-body-md text-secondary mt-2">
              El umbral se aplicará a todos los productos activos de la
              categoría seleccionada.
            </p>
            <form onSubmit={handleSaveThreshold} className="space-y-3 mt-4">
              <select
                value={thresholdCategoryId}
                onChange={(e) => setThresholdCategoryId(e.target.value)}
                required
                className="select select-bordered w-full rounded-xl bg-surface-container-low border-outline-variant/70 focus:border-primary text-body-md"
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="Umbral de stock bajo (unidades)"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                required
                className="input input-bordered w-full rounded-xl bg-surface-container-low border-outline-variant/70 focus:border-primary text-body-md"
              />
              <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowThresholdModal(false)}
                  className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingThreshold}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:brightness-95 w-full sm:w-auto"
                >
                  {savingThreshold ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowThresholdModal(false)}
          />
        </dialog>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Inventario;
