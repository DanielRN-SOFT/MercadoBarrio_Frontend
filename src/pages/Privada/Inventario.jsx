import { useState, useEffect } from "react";
import {
  MdOutlineInventory2,
  MdOutlineFilterAlt,
  MdWarningAmber,
  MdOutlineRemoveShoppingCart,
  MdCheckCircleOutline,
  MdTune,
  MdOutlineInventory,
} from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";

// Estado de stock (RF-18) → tono de StatusBadge
const STOCK_STATUS_TONE = {
  Normal: "secondary",
  Critico: "tertiary",
  Agotado: "error",
};

const Inventario = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({
    total: 0,
    criticos: 0,
    agotados: 0,
  });

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

      setSummary({
        total: res.summary?.total || 0,
        criticos: res.summary?.criticos || 0,
        agotados: res.summary?.agotados || 0,
      });
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
        <PageHeader
          icon={MdOutlineInventory}
          title="Inventario"
          subtitle="Stock en tiempo real y umbrales de alerta"
          action={{ label: "Umbral por categoría", onClick: () => setShowThresholdModal(true), icon: MdTune }}
        />

        {/* Resumen (RF-18) — tarjetas de estadísticas sin equivalente genérico en la librería,
            quedan manuales */}
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
        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            <SearchInput value={name} onChange={setName} placeholder="Buscar por nombre..." />
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
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleClearFilters} className="btn btn-ghost btn-sm rounded-full text-secondary gap-1">
                <IoCloseSharp className="text-base" />
                Limpiar filtros
              </button>
            </div>
          )}
        </Card>

        {/* Lista */}
        {loading ? (
          <Card overflowHidden bodyClassName="p-0">
            <SkeletonList rows={4} />
          </Card>
        ) : products.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState icon={MdOutlineInventory2} title="Sin resultados" message="No se encontraron productos con los filtros aplicados" />
          </Card>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil */}
            <div className="lg:hidden space-y-3">
              {products.map((p) => (
                <div key={p.id} className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
                  <div className="card-body p-4 flex-row items-center gap-3">
                    <Avatar text={p.name} photo={p.photo} icon={MdOutlineInventory2} size="w-10 h-10" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-body-md truncate">{p.name}</p>
                      <p className="text-body-sm text-secondary truncate">
                        {p.productCategory?.name ?? "Sin categoría"} · umbral {p.lowStockThreshold}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-label-sm font-semibold text-on-surface">{p.currentStock} uds</span>
                        <StatusBadge label={p.stockStatus === "Critico" ? "Crítico" : p.stockStatus} tone={STOCK_STATUS_TONE[p.stockStatus]} />
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
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 first:rounded-tl-2xl">
                        Producto
                      </th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Categoría</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Stock actual</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Umbral</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 last:rounded-tr-2xl">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar text={p.name} photo={p.photo} icon={MdOutlineInventory2} size="w-10 h-10" />
                            <span className="font-semibold text-on-surface text-body-md">{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-ghost bg-surface-container-high border-none text-on-surface-variant badge-sm">
                            {p.productCategory?.name ?? "—"}
                          </span>
                        </td>
                        <td className="font-bold text-body-md text-on-surface">{p.currentStock} uds</td>
                        <td className="text-secondary text-body-md">{p.lowStockThreshold} uds</td>
                        <td>
                          <StatusBadge label={p.stockStatus === "Critico" ? "Crítico" : p.stockStatus} tone={STOCK_STATUS_TONE[p.stockStatus]} />
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
        <Paginacion meta={meta} onPageChange={(nuevaPagina) => setPage(nuevaPagina)} itemLabel="productos" />
      </div>

      {/* Modal umbral por categoría (RF-19) — formulario propio, queda manual */}
      {showThresholdModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center mb-3">
              <MdTune className="text-xl text-on-primary-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">Configurar umbral por categoría</h3>
            <p className="text-body-md text-secondary mt-2">
              El umbral se aplicará a todos los productos activos de la categoría seleccionada.
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
                  {savingThreshold ? <span className="loading loading-spinner loading-sm" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowThresholdModal(false)} />
        </dialog>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Inventario;
