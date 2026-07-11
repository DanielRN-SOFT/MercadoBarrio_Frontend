import { useState, useEffect, useCallback } from "react";
import {
  MdHistory,
  MdArrowUpward,
  MdArrowDownward,
  MdOutlineShoppingBag,
  MdOutlineLocalShipping,
  MdOutlineTune,
  MdClose,
} from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import Paginacion from "./Paginacion";

const TIPO_META = {
  Entry: { label: "Entrada", icon: MdOutlineLocalShipping, tone: "primary" },
  Exit: { label: "Salida", icon: MdOutlineLocalShipping, tone: "error" },
  AdjustEntry: { label: "Ajuste (entrada)", icon: MdOutlineTune, tone: "primary" },
  AdjustExit: { label: "Ajuste (salida)", icon: MdOutlineTune, tone: "error" },
  Venta: { label: "Venta", icon: MdOutlineShoppingBag, tone: "error" },
};

const toneClasses = {
  primary: {
    bg: "bg-primary-fixed",
    text: "text-on-primary-fixed-variant",
    dot: "bg-primary",
    iconBg: "bg-primary-container",
    iconText: "text-on-primary-container",
  },
  error: {
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
    dot: "bg-tertiary-container",
    iconBg: "bg-error-container",
    iconText: "text-on-error-container",
  },
};

const formatFecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Modal con la línea de tiempo consolidada (RF-46) de todo lo que afectó
 * el stock de un producto: movimientos (entradas/salidas/ajustes) y ventas.
 *
 * Props:
 * - product: { id, name } — producto a consultar (null/undefined = cerrado)
 * - onClose: () => void
 */
const ProductoTimelineModal = ({ product, onClose }) => {
  const [eventos, setEventos] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(
    async (p = 1) => {
      if (!product) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCliente(`/products/${product.id}/timeline?page=${p}&limit=10`);
        setEventos(res.data);
        setMeta(res.meta);
      } catch (err) {
        setError(err.message ?? "No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    },
    [product],
  );

  useEffect(() => {
    if (product) {
      setPage(1);
      fetchTimeline(1);
    }
  }, [product, fetchTimeline]);

  useEffect(() => {
    if (product) fetchTimeline(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (!product) return null;

  return (
    <dialog open className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl max-w-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-outline-variant/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <MdHistory className="text-lg text-on-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-title-md text-on-surface truncate">Historial de stock</h3>
              <p className="text-body-sm text-secondary truncate">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle shrink-0" aria-label="Cerrar">
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-4 sm:p-5 grow">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="skeleton h-3 w-1/3 rounded-full" />
                    <div className="skeleton h-3 w-2/3 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-secondary">
              <IoCloseCircle className="text-3xl text-error mx-auto mb-2" />
              <p className="text-body-md">{error}</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-14 px-4 text-secondary">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-3">
                <MdHistory className="text-2xl opacity-40" />
              </div>
              <p className="font-semibold text-on-surface text-body-md">Sin movimientos ni ventas</p>
              <p className="text-body-sm mt-1">Este producto todavía no tiene eventos que hayan afectado su stock.</p>
            </div>
          ) : (
            <ol className="relative border-s-2 border-outline-variant/60 ms-4 space-y-6">
              {eventos.map((ev) => {
                const tipoMeta = TIPO_META[ev.tipo] ?? TIPO_META.Venta;
                const tones = toneClasses[tipoMeta.tone];
                const Icon = tipoMeta.icon;
                const cancelada = ev.estado === "Cancelled" || ev.estado === "Cancelada";

                return (
                  <li key={`${ev.origen}-${ev.id}-${ev.date}`} className="ms-6 relative">
                    <span
                      className={`absolute -start-[calc(1.5rem+9px)] top-0.5 w-8 h-8 rounded-full flex items-center justify-center ${tones.iconBg}`}
                    >
                      <Icon className={`text-base ${tones.iconText}`} />
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${tones.bg} ${tones.text}`}>
                        {ev.signo === "+" ? <MdArrowUpward className="text-xs" /> : <MdArrowDownward className="text-xs" />}
                        {tipoMeta.label}
                      </span>
                      <span className="font-bold text-on-surface text-body-md">
                        {ev.signo}
                        {ev.cantidad} uds
                      </span>
                      {cancelada && (
                        <span className="badge badge-sm bg-surface-container-high border-none text-on-surface-variant">Cancelada</span>
                      )}
                    </div>

                    <p className="text-body-sm text-secondary mt-1">
                      {formatFecha(ev.date)}
                      {ev.origen === "Movimiento" && ` · Movimiento #${ev.id}`}
                      {ev.origen === "Venta" && ` · Venta #${ev.id}`}
                    </p>

                    {ev.motivo && <p className="text-body-sm text-on-surface-variant mt-1 italic">"{ev.motivo}"</p>}

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-body-sm text-on-surface-variant">
                      {ev.usuario?.name && <span>Por {ev.usuario.name}</span>}
                      {ev.supplier?.name && <span>Proveedor: {ev.supplier.name}</span>}
                      {typeof ev.unitCost === "number" && <span>Costo unit.: ${Number(ev.unitCost).toLocaleString("es-CO")}</span>}
                      {typeof ev.unitPrice === "number" && <span>Precio unit.: ${Number(ev.unitPrice).toLocaleString("es-CO")}</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Footer con paginación */}
        {!loading && !error && eventos.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-outline-variant/60 shrink-0">
            <Paginacion meta={meta} onPageChange={(p) => setPage(p)} itemLabel="eventos" scrollTop={false} />
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default ProductoTimelineModal;
