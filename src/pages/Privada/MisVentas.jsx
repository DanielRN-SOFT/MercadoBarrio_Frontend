import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdReceiptLong, MdAdd, MdOutlineFilterAlt, MdVisibility, MdOutlineFileDownload, MdOutlineInventory2 } from "react-icons/md";
import { IoCloseCircle, IoCloseSharp, IoTimeOutline, IoWarning } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import { exportSalesToExcel } from "../../helpers/exportSalesToExcel";
import { exportSalesDetailedToExcel } from "../../helpers/exportSalesDetailedToExcel";

const MAX_CANCEL_HOURS = 24;

const formatCOP = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

const formatDateTime = (d) =>
  new Date(d).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Horas transcurridas desde la fecha de la venta
const hoursSince = (date) => (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);

const canCancel = (sale) => sale.status === "Completed" && hoursSince(sale.date) <= MAX_CANCEL_HOURS;

// Iniciales para el avatar del producto cuando no hay imagen
const getInitials = (str = "") =>
  str
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// Avatar/foto del producto con fallback a iniciales si no hay foto o falla la carga
const ProductAvatar = ({ product, size = "w-12 h-12", textSize = "text-label-sm" }) => {
  const [imgError, setImgError] = useState(false);
  const name = product?.name ?? "";

  if (product?.photo && !imgError) {
    return (
      <img
        src={product.photo}
        alt={name}
        onError={() => setImgError(true)}
        className={`${size} rounded-xl object-cover shrink-0 border border-outline-variant/50`}
      />
    );
  }

  return (
    <div className={`${size} rounded-xl bg-primary flex items-center justify-center shrink-0`}>
      <span className={`${textSize} font-bold text-on-primary`}>
        {getInitials(name) || <MdOutlineInventory2 className="text-on-primary text-lg" />}
      </span>
    </div>
  );
};

const MisVentas = () => {
  const { toasts, addToast, removeToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  // Evita procesar el mismo location.state dos veces cuando React StrictMode
  // (modo desarrollo) invoca el efecto dos veces antes de que navigate lo limpie.
  const processedStateRef = useRef(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState("");

  // Detalle
  const [detailSale, setDetailSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cancelación
  const [cancelSale, setCancelSale] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    fetchCliente("/products")
      .then((res) => setProducts(res?.data ?? []))
      .catch(() => {});
  }, []);

  // Al llegar desde "Registrar venta" con datos en el estado de navegación:
  // muestra el toast de éxito y, si aplica, la alerta de stock bajo (RF-23).
  // Se limpia el estado inmediatamente para que no se repita si el usuario
  // recarga la página o vuelve con el botón "atrás".
  useEffect(() => {
    const state = location.state;
    if (!state || processedStateRef.current === state) return;
    processedStateRef.current = state;

    if (state.saleSuccessMessage) {
      addToast({ message: state.saleSuccessMessage, type: "success" });
    }

    const productosEnAlerta = state.productosEnAlerta ?? [];
    if (productosEnAlerta.length > 0) {
      const nombres = productosEnAlerta.map((p) => `${p.name} (${p.currentStock})`).join(", ");
      addToast({
        message: `Stock bajo tras la venta: ${nombres}`,
        type: "warning",
      });
    }

    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const fetchSales = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (minTotal) params.set("minTotal", minTotal);
      if (maxTotal) params.set("maxTotal", maxTotal);
      if (productId) params.set("productId", productId);
      if (status) params.set("status", status);

      const res = await fetchCliente(`/sales?${params.toString()}`);
      setSales(res.data);
      setMeta(res.meta);
    } catch {
      addToast({ message: "Error al cargar las ventas", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(page);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page === 1) fetchSales(1);
      else setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [startDate, endDate, minTotal, maxTotal, productId, status]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinTotal("");
    setMaxTotal("");
    setProductId("");
    setStatus("");
  };

  const hasFilters = startDate || endDate || minTotal || maxTotal || productId || status;

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailSale({ id });
    try {
      const res = await fetchCliente(`/sales/${id}`);
      setDetailSale(res.data);
    } catch {
      addToast({
        message: "Error al cargar el detalle de la venta",
        type: "error",
      });
      setDetailSale(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      addToast({
        message: "Debes indicar el motivo de la cancelación",
        type: "error",
      });
      return;
    }
    setActionLoading(true);
    try {
      await fetchCliente(`/sales/cancel/${cancelSale.id}`, {
        method: "PUT",
        body: { cancellationReason },
      });
      addToast({ message: "Venta cancelada correctamente", type: "success" });
      setCancelSale(null);
      setCancellationReason("");
      fetchSales(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al cancelar la venta",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Exporta la página actual de resultados filtrados a Excel (para reportes completos por período,
  // considerar un endpoint de exportación server-side que no dependa de la paginación visible).
  // mode: "summary" (una fila por venta, endpoint /sales) o "detailed" (una fila por
  // producto vendido, endpoint /sales/detailed) — RF-47.
  const handleExport = async (scope = "page", mode = "summary") => {
    try {
      setExportLoading(true);

      const params = new URLSearchParams();
      if (scope === "all") params.set("all", "true");
      else params.set("page", String(page));
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (minTotal) params.set("minTotal", minTotal);
      if (maxTotal) params.set("maxTotal", maxTotal);
      if (productId) params.set("productId", productId);
      if (status) params.set("status", status);

      let dataToExport;

      if (mode === "detailed") {
        // El endpoint /sales/detailed siempre trae `details` con producto,
        // categoría y unidad; se usa tanto para "página actual" como para
        // "todos los resultados" (la lista en pantalla no trae ese detalle).
        const res = await fetchCliente(`/sales/detailed?${params.toString()}`);
        dataToExport = res.data;
      } else if (scope === "all") {
        const res = await fetchCliente(`/sales?${params.toString()}`);
        dataToExport = res.data;
      } else {
        dataToExport = sales;
      }

      if (dataToExport.length === 0) {
        addToast({ message: "No hay ventas para exportar", type: "info" });
        return;
      }

      const filtersSummary = [
        startDate && `Desde: ${startDate}`,
        endDate && `Hasta: ${endDate}`,
        minTotal && `Monto mín: ${formatCOP(minTotal)}`,
        maxTotal && `Monto máx: ${formatCOP(maxTotal)}`,
        status && `Estado: ${status === "Completed" ? "Completada" : "Cancelada"}`,
      ]
        .filter(Boolean)
        .join(" · ");

      if (mode === "detailed") {
        exportSalesDetailedToExcel(dataToExport, { scope, filtersSummary });
      } else {
        exportSalesToExcel(dataToExport, { scope, filtersSummary });
      }
    } catch {
      addToast({ message: "Error al exportar el reporte", type: "error" });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdReceiptLong className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">Mis Ventas</h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Historial de transacciones de tu establecimiento
                {meta.total > 0 && <span className="text-on-surface-variant"> · {meta.total} en total</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="dropdown dropdown-end flex-1 sm:flex-none">
              <div
                tabIndex={0}
                role="button"
                className={`btn btn-outline border-outline-variant text-secondary hover:bg-surface-container-high gap-2 rounded-full font-label-md text-label-md w-full ${
                  sales.length === 0 ? "btn-disabled" : ""
                }`}
              >
                {exportLoading ? <span className="loading loading-spinner loading-sm" /> : <MdOutlineFileDownload className="text-xl" />}
                Exportar
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-lg z-10 w-64 p-2 mt-1"
              >
                <li className="menu-title px-3 pt-1 pb-0.5">
                  <span className="text-label-sm text-on-surface-variant">Resumen por venta</span>
                </li>
                <li>
                  <button onClick={() => handleExport("page", "summary")} className="rounded-xl text-body-sm text-on-surface">
                    Página actual
                    <span className="text-on-surface-variant">({sales.length})</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("all", "summary")}
                    disabled={exportLoading}
                    className="rounded-xl text-body-sm text-on-surface"
                  >
                    Todos los resultados
                    {meta.total > 0 && <span className="text-on-surface-variant">({meta.total})</span>}
                  </button>
                </li>
                <div className="divider my-1" />
                <li className="menu-title px-3 pt-0.5 pb-0.5">
                  <span className="text-label-sm text-on-surface-variant">Detalle por producto</span>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("page", "detailed")}
                    disabled={exportLoading}
                    className="rounded-xl text-body-sm text-on-surface"
                  >
                    Página actual
                    <span className="text-on-surface-variant">({sales.length})</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("all", "detailed")}
                    disabled={exportLoading}
                    className="rounded-xl text-body-sm text-on-surface"
                  >
                    Todos los resultados
                    {meta.total > 0 && <span className="text-on-surface-variant">({meta.total})</span>}
                  </button>
                </li>
              </ul>
            </div>
            <Link
              to="/panel/ventas/nueva"
              className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors flex-1 sm:flex-none"
            >
              <MdAdd className="text-xl" />
              Nueva venta
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
          <div className="card-body p-4 sm:p-5 gap-3">
            <div className="flex items-center gap-2 text-secondary">
              <MdOutlineFilterAlt className="text-base" />
              <span className="text-label-sm uppercase tracking-wide font-semibold">Filtros</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <label className="form-control col-span-1">
                <span className="text-label-sm text-on-surface-variant mb-1">Desde</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                />
              </label>

              <label className="form-control col-span-1">
                <span className="text-label-sm text-on-surface-variant mb-1">Hasta</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                />
              </label>

              <label className="form-control col-span-1">
                <span className="text-label-sm text-on-surface-variant mb-1">Monto mín.</span>
                <input
                  type="number"
                  min="0"
                  value={minTotal}
                  onChange={(e) => setMinTotal(e.target.value)}
                  placeholder="0"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                />
              </label>

              <label className="form-control col-span-1">
                <span className="text-label-sm text-on-surface-variant mb-1">Monto máx.</span>
                <input
                  type="number"
                  min="0"
                  value={maxTotal}
                  onChange={(e) => setMaxTotal(e.target.value)}
                  placeholder="999999"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                />
              </label>

              <label className="form-control col-span-1">
                <span className="text-label-sm text-on-surface-variant mb-1">Producto</span>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                >
                  <option value="">Todos</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control col-span-1">
                <span className="text-label-sm text-on-surface-variant mb-1">Estado</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                >
                  <option value="">Todos</option>
                  <option value="Completed">Completada</option>
                  <option value="Cancelled">Cancelada</option>
                </select>
              </label>
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

        {/* Estado vacío / carga */}
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
        ) : sales.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-center py-16 sm:py-20 px-6 text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <MdReceiptLong className="text-3xl opacity-40" />
              </div>
              {hasFilters ? (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">Sin resultados</p>
                  <p className="text-body-md mt-1">No encontramos ventas con esos filtros. Intenta ajustarlos.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">Aún no tienes ventas</p>
                  <p className="text-body-md mt-1">Registra tu primera venta para comenzar.</p>
                  <Link
                    to="/panel/ventas/nueva"
                    className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
                  >
                    <MdAdd className="text-xl" /> Registrar venta
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {sales.map((s) => (
                <div key={s.id} className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface text-body-md">Venta #{s.id}</p>
                        <p className="text-body-sm text-secondary">{formatDateTime(s.date)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openDetail(s.id)}
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Ver detalle"
                        >
                          <MdVisibility className="text-lg text-secondary" />
                        </button>
                        {canCancel(s) && (
                          <button
                            onClick={() => setCancelSale(s)}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                            aria-label="Cancelar"
                          >
                            <IoCloseCircle className="text-lg text-error" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <span className="text-primary font-bold text-body-md">{formatCOP(s.total)}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                          s.status === "Completed"
                            ? "bg-primary-fixed text-on-primary-fixed-variant"
                            : "bg-error-container text-on-error-container"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Completed" ? "bg-primary" : "bg-error"}`} />
                        {s.status === "Completed" ? "Completada" : "Cancelada"}
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
                          # Venta
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Fecha</th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Total</th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Estado</th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 text-right last:rounded-tr-2xl">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60">
                      {sales.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="font-semibold text-on-surface text-body-md">#{s.id}</td>
                          <td className="text-body-sm text-secondary">{formatDateTime(s.date)}</td>
                          <td className="text-primary font-bold text-body-md">{formatCOP(s.total)}</td>
                          <td>
                            <span
                              className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                                s.status === "Completed"
                                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                                  : "bg-error-container text-on-error-container"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Completed" ? "bg-primary" : "bg-error"}`} />
                              {s.status === "Completed" ? "Completada" : "Cancelada"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openDetail(s.id)}
                                className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                                data-tip="Ver detalle"
                              >
                                <MdVisibility className="text-lg text-secondary" />
                              </button>
                              {canCancel(s) && (
                                <button
                                  onClick={() => setCancelSale(s)}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                                  data-tip="Cancelar"
                                >
                                  <IoCloseCircle className="text-lg text-error" />
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
        <Paginacion meta={meta} onPageChange={(nuevaPagina) => setPage(nuevaPagina)} itemLabel="ventas" />
      </div>

      {/* Modal detalle de venta */}
      {detailSale && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl max-w-2xl p-0 overflow-hidden">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-outline-variant/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                  <MdReceiptLong className="text-xl text-on-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-title-md text-on-surface leading-tight">Venta #{detailSale.id}</h3>
                  {!detailLoading && <p className="text-body-sm text-secondary truncate">{formatDateTime(detailSale.date)}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!detailLoading && (
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                      detailSale.status === "Completed"
                        ? "bg-primary-fixed text-on-primary-fixed-variant"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${detailSale.status === "Completed" ? "bg-primary" : "bg-error"}`} />
                    {detailSale.status === "Completed" ? "Completada" : "Cancelada"}
                  </span>
                )}
                <button onClick={() => setDetailSale(null)} className="btn btn-ghost btn-sm btn-circle">
                  <IoCloseSharp className="text-lg" />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="space-y-3 p-4 sm:p-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/2 rounded-full" />
                      <div className="skeleton h-3 w-1/3 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Estado en móvil (badge ya no cabe junto al header) */}
                <div className="sm:hidden px-4 pt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                      detailSale.status === "Completed"
                        ? "bg-primary-fixed text-on-primary-fixed-variant"
                        : "bg-error-container text-on-error-container"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${detailSale.status === "Completed" ? "bg-primary" : "bg-error"}`} />
                    {detailSale.status === "Completed" ? "Completada" : "Cancelada"}
                  </span>
                </div>

                {/* Lista de productos */}
                <div className="px-4 sm:px-5 pt-3">
                  <p className="text-label-sm uppercase tracking-wide font-semibold text-on-surface-variant mb-2">
                    {(detailSale.details ?? []).length} producto
                    {(detailSale.details ?? []).length === 1 ? "" : "s"}
                  </p>
                  <div className="space-y-2 max-h-88 overflow-y-auto pr-1">
                    {(detailSale.details ?? []).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40"
                      >
                        <ProductAvatar product={d.product} size="w-12 h-12" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-on-surface text-body-sm truncate">
                            {d.product?.name ?? `Producto #${d.productId}`}
                          </p>
                          <p className="text-label-sm text-on-surface-variant">
                            {d.quantity} uds × {formatCOP(d.unitPrice)}
                          </p>
                        </div>
                        <span className="font-semibold text-on-surface text-body-md shrink-0">{formatCOP(d.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivo de cancelación */}
                {detailSale.status === "Cancelled" && (
                  <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-2xl bg-error-container/40 text-on-error-container">
                    <p className="text-label-sm font-semibold uppercase tracking-wide">Venta cancelada</p>
                    <p className="text-body-sm mt-1">{detailSale.cancellationReason}</p>
                    {detailSale.cancellationDate && (
                      <p className="text-label-sm text-on-error-container/70 mt-1">{formatDateTime(detailSale.cancellationDate)}</p>
                    )}
                  </div>
                )}

                {/* Resumen y total */}
                <div className="mt-4 p-4 sm:p-5 bg-surface-container-high/60 border-t border-outline-variant/60 flex items-center justify-between">
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Total de la venta</p>
                    <p className="font-bold text-primary text-title-lg">{formatCOP(detailSale.total)}</p>
                  </div>
                  <button onClick={() => setDetailSale(null)} className="btn btn-ghost rounded-full font-label-md">
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => setDetailSale(null)} />
        </dialog>
      )}

      {/* Modal confirmación cancelar */}
      {cancelSale && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl p-6">
            {/* Icono de advertencia */}
            <div className="w-12 h-12 rounded-2xl bg-error-container flex items-center justify-center mb-4">
              <IoWarning className="text-2xl text-on-error-container" />
            </div>

            <h3 className="font-bold text-title-md text-on-surface">¿Cancelar venta #{cancelSale.id}?</h3>

            <p className="text-body-md text-on-surface-variant mt-1.5">
              El stock de los productos involucrados será restituido. Esta acción no se puede deshacer.
            </p>

            <label className="form-control mt-4">
              <span className="text-label-sm text-on-surface-variant mb-1.5 flex items-center gap-1">
                Motivo de la cancelación
                <span className="text-error">*</span>
              </span>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Ej: Producto ingresado por error"
                className="textarea textarea-bordered bg-surface-container-low border-outline-variant focus:border-primary focus:outline-none rounded-2xl text-body-sm resize-none"
                rows={3}
              />
            </label>

            <div className="divider my-5 before:bg-outline-variant/40 after:bg-outline-variant/40" />

            <div className="modal-action gap-2 flex-col-reverse sm:flex-row mt-0">
              <button
                onClick={() => {
                  setCancelSale(null);
                  setCancellationReason("");
                }}
                className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading || !cancellationReason.trim()}
                className="btn bg-error text-on-error border-none rounded-full font-label-md hover:brightness-95 disabled:opacity-40 w-full sm:w-auto gap-1.5"
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <IoCloseCircle className="text-lg" />
                    Cancelar venta
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            className="modal-backdrop bg-scrim/40 backdrop-blur-[2px]"
            onClick={() => {
              setCancelSale(null);
              setCancellationReason("");
            }}
          />
        </dialog>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default MisVentas;
