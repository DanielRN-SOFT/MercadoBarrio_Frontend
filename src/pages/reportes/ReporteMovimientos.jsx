import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  MdArrowBack,
  MdAssessment,
  MdOutlineFileDownload,
  MdTrendingUp,
  MdTrendingDown,
  MdOutlineInventory2,
  MdOutlineWarningAmber,
  MdSwapVert,
} from "react-icons/md";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import { exportRotationReportToExcel } from "../../helpers/exportRotationReportToExcel";

const ROTATION_BADGE = {
  Alta: "badge-success",
  Media: "badge-warning",
  Baja: "badge-ghost",
};

const toISODate = (date) => date.toISOString().slice(0, 10);

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { startDate: toISODate(start), endDate: toISODate(end) };
};

const PRESETS = [
  { label: "Últimos 7 días", days: 6 },
  { label: "Últimos 30 días", days: 29 },
  { label: "Últimos 90 días", days: 89 },
];

const SummaryCard = ({ icon: Icon, label, value, tone = "text-primary" }) => (
  <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
    <div className="card-body p-4 sm:p-5 gap-1 flex-row items-center">
      <div className={`w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="text-xl" />
      </div>
      <div className="min-w-0">
        <p className="text-label-sm text-secondary">{label}</p>
        <p className="text-headline-sm font-bold text-on-surface truncate">{value}</p>
      </div>
    </div>
  </div>
);

const RotationBarChart = ({ title, data, dataKey = "salidas", color, emptyMessage }) => (
  <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
    <div className="card-body p-4 sm:p-5 gap-3">
      <h2 className="font-semibold text-on-surface text-body-lg">{title}</h2>
      {data.length === 0 ? (
        <p className="text-body-sm text-secondary text-center py-10">{emptyMessage}</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
            <Tooltip formatter={(v) => [v, "Unidades vendidas/salidas"]} labelFormatter={(l) => `Producto: ${l}`} />
            <Bar dataKey={dataKey} radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

const ReporteMovimientos = () => {
  const { toasts, addToast, removeToast } = useToast();

  const defaultRange = getDefaultRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sortBy, setSortBy] = useState("salidas");
  const [sortDir, setSortDir] = useState("desc");

  const loadReport = useCallback(
    (from, to) => {
      if (!from || !to) return;
      if (new Date(from) > new Date(to)) {
        addToast({ message: "La fecha inicial no puede ser mayor que la fecha final.", type: "error" });
        return;
      }
      setLoading(true);
      const params = new URLSearchParams({ startDate: from, endDate: to });
      fetchCliente(`/movements/reporte-resumen?${params.toString()}`)
        .then((res) => setReport(res))
        .catch((err) => {
          addToast({ message: err.message ?? "Error al generar el reporte", type: "error" });
          setReport(null);
        })
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    loadReport(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const from = toISODate(start);
    const to = toISODate(end);
    setStartDate(from);
    setEndDate(to);
    loadReport(from, to);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadReport(startDate, endDate);
  };

  const handleExport = () => {
    if (!report?.reporteCompletoPorProducto?.length) {
      addToast({ message: "No hay datos para exportar en este período", type: "info" });
      return;
    }
    try {
      setExporting(true);
      exportRotationReportToExcel(report, { startDate, endDate });
    } catch {
      addToast({ message: "Error al exportar el reporte", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const sortedRows = report?.reporteCompletoPorProducto
    ? [...report.reporteCompletoPorProducto].sort((a, b) => {
        const dir = sortDir === "desc" ? -1 : 1;
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === "string") return va.localeCompare(vb) * dir;
        return (va - vb) * dir;
      })
    : [];

  const sortIndicator = (field) => (sortBy === field ? (sortDir === "desc" ? " ↓" : " ↑") : "");

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/panel/movimientos" className="btn btn-ghost btn-circle hover:bg-surface-container-high" aria-label="Volver">
            <MdArrowBack className="text-xl text-on-surface" />
          </Link>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <MdAssessment className="text-lg sm:text-xl text-on-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
              Reporte de rotación de productos
            </h1>
            <p className="text-body-sm sm:text-body-md text-secondary">
              Identifica tus productos de mayor y menor rotación para planear el reabastecimiento
            </p>
          </div>
        </div>

        {/* Filtros de período */}
        <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
          <div className="card-body p-4 sm:p-5 gap-3">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <label className="form-control">
                <span className="text-label-sm text-on-surface-variant mb-1">Desde</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input input-bordered input-sm bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                  required
                />
              </label>
              <label className="form-control">
                <span className="text-label-sm text-on-surface-variant mb-1">Hasta</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input input-bordered input-sm bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm bg-primary text-on-primary border-none hover:bg-primary-container rounded-full font-label-md text-label-sm disabled:opacity-40"
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : "Generar reporte"}
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || loading || !report?.reporteCompletoPorProducto?.length}
                className="btn btn-sm btn-outline border-outline-variant text-secondary hover:bg-surface-container-high gap-2 rounded-full font-label-md text-label-sm disabled:opacity-40 ml-auto"
              >
                {exporting ? <span className="loading loading-spinner loading-xs" /> : <MdOutlineFileDownload className="text-lg" />}
                Exportar a Excel
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.days)}
                  className="btn btn-xs btn-ghost bg-surface-container-low rounded-full text-label-sm text-secondary hover:bg-surface-container-high"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full rounded-2xl" />
              ))}
            </div>
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        ) : !report ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
            <div className="card-body items-center text-center py-12">
              <MdOutlineWarningAmber className="text-4xl text-secondary" />
              <p className="text-body-sm text-secondary">No fue posible cargar el reporte. Intenta generarlo de nuevo.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Resumen general */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SummaryCard
                icon={MdOutlineInventory2}
                label="Productos con movimiento"
                value={report.resumenGeneral.totalProductosConMovimiento}
                tone="text-primary"
              />
              <SummaryCard
                icon={MdTrendingUp}
                label="Unidades entrantes"
                value={report.resumenGeneral.totalUnidadesEntrantes}
                tone="text-success"
              />
              <SummaryCard
                icon={MdTrendingDown}
                label="Unidades salientes"
                value={report.resumenGeneral.totalUnidadesSalientes}
                tone="text-error"
              />
            </div>

            {report.reporteCompletoPorProducto.length === 0 ? (
              <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
                <div className="card-body items-center text-center py-12 gap-1">
                  <MdSwapVert className="text-4xl text-secondary" />
                  <p className="text-body-sm text-secondary">No hay movimientos registrados en el período seleccionado.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Gráficos de rotación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <RotationBarChart
                    title="Mayor rotación (top 5 por salidas)"
                    data={report.productosMayorRotacion}
                    color="#1baf7a"
                    emptyMessage="No se registraron salidas en el período"
                  />
                  <RotationBarChart
                    title="Menor rotación (top 5 por salidas)"
                    data={report.productosMenorRotacion}
                    color="#e34948"
                    emptyMessage="No hay productos para mostrar"
                  />
                </div>

                {/* Tabla detallada */}
                <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
                  <div className="card-body p-4 sm:p-5 gap-3">
                    <h2 className="font-semibold text-on-surface text-body-lg">Detalle por producto</h2>
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr className="text-label-sm text-secondary">
                            <th className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                              Producto{sortIndicator("name")}
                            </th>
                            <th className="cursor-pointer select-none text-right" onClick={() => toggleSort("entradas")}>
                              Entradas{sortIndicator("entradas")}
                            </th>
                            <th className="cursor-pointer select-none text-right" onClick={() => toggleSort("salidas")}>
                              Salidas{sortIndicator("salidas")}
                            </th>
                            <th className="cursor-pointer select-none text-right" onClick={() => toggleSort("porcentajeRotacion")}>
                              % del total{sortIndicator("porcentajeRotacion")}
                            </th>
                            <th>Rotación</th>
                            <th className="text-right">Stock actual</th>
                            <th>Reabastecer</th>
                            <th className="text-right">Sugerencia compra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRows.map((p) => (
                            <tr key={p.id}>
                              <td className="text-body-sm font-medium text-on-surface max-w-48 truncate">{p.name}</td>
                              <td className="text-body-sm text-right">{p.entradas}</td>
                              <td className="text-body-sm text-right font-semibold">{p.salidas}</td>
                              <td className="text-body-sm text-right text-on-surface-variant">{p.porcentajeRotacion}%</td>
                              <td>
                                <span className={`badge badge-sm rounded-full ${ROTATION_BADGE[p.nivelRotacion] ?? "badge-ghost"}`}>
                                  {p.nivelRotacion}
                                </span>
                              </td>
                              <td className="text-body-sm text-right">{p.currentStock}</td>
                              <td>
                                {p.requiereReabastecimiento ? (
                                  <span className="badge badge-sm badge-error rounded-full">Sí</span>
                                ) : (
                                  <span className="badge badge-sm badge-ghost rounded-full">No</span>
                                )}
                              </td>
                              <td className="text-body-sm text-right font-semibold text-primary">
                                {p.sugerenciaCompra > 0 ? p.sugerenciaCompra : "—"}
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
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default ReporteMovimientos;
