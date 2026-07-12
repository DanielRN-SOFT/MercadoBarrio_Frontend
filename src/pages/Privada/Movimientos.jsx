import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdOutlineInventory2,
  MdAdd,
  MdRemove,
  MdDeleteOutline,
  MdArrowBack,
  MdSwapVert,
  MdOutlineLocalShipping,
  MdOutlineFilterAlt,
  MdOutlineFileDownload,
} from "react-icons/md";
import { IoWarning } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { exportMovementsToExcel } from "../../helpers/exportMovementsToExcel";

const getInitials = (str = "") =>
  str
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const ProductAvatar = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  if (product.photo && !imgError) {
    return (
      <img
        src={product.photo}
        alt={product.name}
        onError={() => setImgError(true)}
        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-outline-variant/50"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
      <span className="text-label-sm font-bold text-on-primary">
        {getInitials(product.name) || (
          <MdOutlineInventory2 className="text-on-primary text-lg" />
        )}
      </span>
    </div>
  );
};

const TYPE_LABELS = {
  Entry: "Entrada",
  Exit: "Salida",
  AdjustEntry: "Ajuste (+)",
  AdjustExit: "Ajuste (-)",
};

const STATUS_LABELS = {
  Active: "Activo",
  Cancelled: "Cancelado",
};

const Movimientos = () => {
  const { toasts, addToast, removeToast } = useToast();

  // --- Selector de tipo de movimiento ---
  const [movementType, setMovementType] = useState("Entrada"); // "Entrada" | "Ajuste"
  const [adjustSign, setAdjustSign] = useState("positivo"); // "positivo" | "negativo"

  // --- Buscador de productos ---
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);

  // --- Carrito de movimiento ---
  const [cart, setCart] = useState([]); // [{ productId, name, photo, stock, quantity, unitCost }]

  // --- Proveedores (solo para Entrada) ---
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Historial reciente ---
  const [movements, setMovements] = useState([]);
  const [movementsMeta, setMovementsMeta] = useState(null);
  const [movementsPage, setMovementsPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  // --- Filtros del historial (RF-22) ---
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterProductId, setFilterProductId] = useState("");

  // --- Cancelar movimiento ---
  const [cancelMovementId, setCancelMovementId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const isAdjust = movementType === "Ajuste";
  const finalType = isAdjust
    ? adjustSign === "positivo"
      ? "AdjustEntry"
      : "AdjustExit"
    : movementType === "Entrada"
      ? "Entry"
      : "Exit";

  useEffect(() => {
    setPage(1);
  }, [name]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearching(true);
      const params = new URLSearchParams({ page, status: "Active" });
      if (name.trim()) params.set("name", name.trim());
      fetchCliente(`/products?${params.toString()}`)
        .then((res) => {
          setResults(res?.data ?? []);
          setMeta(res?.meta ?? null);
        })
        .catch(() =>
          addToast({ message: "Error al buscar productos", type: "error" }),
        )
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, page]);

  useEffect(() => {
    if (movementType !== "Entrada") return;
    fetchCliente("/suppliers?status=Active")
      .then((res) => setSuppliers(res?.data ?? []))
      .catch(() => {});
  }, [movementType]);

  const buildFilterParams = (extra = {}) => {
    const params = new URLSearchParams(extra);
    if (filterStartDate) params.set("startDate", filterStartDate);
    if (filterEndDate) params.set("endDate", filterEndDate);
    if (filterType) params.set("type", filterType);
    if (filterProductId) params.set("productId", filterProductId);
    return params;
  };

  const loadHistory = (targetPage = 1) => {
    if (
      filterStartDate &&
      filterEndDate &&
      new Date(filterStartDate) > new Date(filterEndDate)
    ) {
      setLoadingHistory(false);

      addToast({
        message: "La fecha inicial no puede ser mayor que la fecha final.",
        type: "error",
      });

      return;
    }
    setLoadingHistory(true);
    const params = buildFilterParams({ page: targetPage });
    fetchCliente(`/movements?${params.toString()}`)
      .then((res) => {
        setMovements(res?.data ?? []);
        setMovementsMeta(res?.meta ?? null);
      })
      .catch(() =>
        addToast({ message: "Error al cargar el historial", type: "error" }),
      )
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    loadHistory(movementsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementsPage]);

  // Al cambiar filtros, se reinicia a la página 1
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (movementsPage === 1) loadHistory(1);
      else setMovementsPage(1);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStartDate, filterEndDate, filterType, filterProductId]);

  useEffect(() => {
    fetchCliente("/products")
      .then((res) => setAllProducts(res?.data ?? []))
      .catch(() => {});
  }, []);

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterType("");
    setFilterProductId("");
  };

  const hasFilters =
    filterStartDate || filterEndDate || filterType || filterProductId;

  const handleExport = async (scope = "page") => {
    try {
      if (
        filterStartDate &&
        filterEndDate &&
        new Date(filterStartDate) > new Date(filterEndDate)
      ) {
        addToast({
          message: "La fecha inicial no puede ser mayor que la fecha final.",
          type: "error",
        });
        return;
      }
      let dataToExport = movements;

      if (scope === "all") {
        setExportLoading(true);
        const params = buildFilterParams({ all: "true" });
        const res = await fetchCliente(`/movements?${params.toString()}`);
        dataToExport = res?.data ?? [];
      }

      if (dataToExport.length === 0) {
        addToast({ message: "No hay movimientos para exportar", type: "info" });
        return;
      }

      const filtersSummary = [
        filterStartDate && `Desde: ${filterStartDate}`,
        filterEndDate && `Hasta: ${filterEndDate}`,
        filterType && `Tipo: ${TYPE_LABELS[filterType] ?? filterType}`,
      ]
        .filter(Boolean)
        .join(" · ");

      exportMovementsToExcel(dataToExport, { scope, filtersSummary });
    } catch {
      addToast({ message: "Error al exportar el reporte", type: "error" });
    } finally {
      setExportLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      if (prev.find((i) => i.productId === product.id)) {
        addToast({ message: "Ese producto ya está agregado", type: "error" });
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          photo: product.photo,
          stock: product.currentStock,
          quantity: 1,
          unitCost: "",
        },
      ];
    });
  };

  const changeQuantity = (productId, value) => {
    // Permite que el input quede vacío temporalmente para que el usuario pueda borrar sin que le auto-escriba un '1'
    const qty = value === "" ? "" : Math.max(1, parseInt(value, 10) || 1);
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i,
      ),
    );
  };

  const changeCost = (productId, value) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, unitCost: value } : i,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const resetForm = () => {
    setCart([]);
    setReason("");
    setSupplierId("");
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      addToast({
        message: "Agrega al menos un producto al movimiento",
        type: "error",
      });
      return;
    }

    const hasInvalidQuantity = cart.some(
      (item) => item.quantity === "" || item.quantity <= 0,
    );
    if (hasInvalidQuantity) {
      addToast({
        message:
          "Por favor, ingresa una cantidad válida para todos los productos.",
        type: "error",
      });
      return;
    }
    if (isAdjust && !reason.trim()) {
      addToast({
        message: "El motivo es obligatorio para los ajustes",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: finalType,
        products: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          ...(i.unitCost !== "" ? { unitCost: Number(i.unitCost) } : {}),
        })),
      };
      if (reason.trim()) payload.reason = reason.trim();
      if (!isAdjust && supplierId) payload.supplierId = Number(supplierId);

      await fetchCliente("/movements", { method: "POST", body: payload });
      addToast({
        message: "Movimiento registrado correctamente",
        type: "success",
      });
      resetForm();
      setMovementsPage(1);
      loadHistory(1);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al registrar el movimiento",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Antes usaba el confirm() nativo del navegador — inconsistente con el resto de
  // la app, que confirma acciones destructivas con un modal. Ahora usa ConfirmModal.
  const confirmCancelMovement = async () => {
    if (!cancelMovementId) return;
    setCancelLoading(true);
    try {
      await fetchCliente(`/movements/delete/${cancelMovementId}`, { method: "POST" });
      addToast({ message: "Movimiento cancelado", type: "success" });
      loadHistory(movementsPage);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al cancelar el movimiento",
        type: "error",
      });
    } finally {
      setCancelLoading(false);
      setCancelMovementId(null);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <MdSwapVert className="text-lg sm:text-xl text-on-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
              Movimientos de inventario
            </h1>
            <p className="text-body-sm sm:text-body-md text-secondary">
              Registra entradas y ajustes de stock
            </p>
          </div>
        </div>

        {/* Selector de tipo */}
        <div className="tabs tabs-boxed bg-surface-container-low w-fit rounded-full p-1">
          <button
            className={`tab rounded-full px-4 ${movementType === "Entrada" ? "tab-active bg-primary text-on-primary" : ""}`}
            onClick={() => setMovementType("Entrada")}
          >
            Entrada
          </button>
          <button
            className={`tab rounded-full px-4 ${movementType === "Ajuste" ? "tab-active bg-primary text-on-primary" : ""}`}
            onClick={() => setMovementType("Ajuste")}
          >
            Ajuste
          </button>
        </div>

        {isAdjust && (
          <div className="flex gap-2">
            <button
              onClick={() => setAdjustSign("positivo")}
              className={`btn btn-sm rounded-full ${adjustSign === "positivo" ? "bg-primary text-on-primary border-none" : "btn-ghost bg-surface-container-low"}`}
            >
              <MdAdd /> Positivo
            </button>
            <button
              onClick={() => setAdjustSign("negativo")}
              className={`btn btn-sm rounded-full ${adjustSign === "negativo" ? "bg-error text-on-error border-none" : "btn-ghost bg-surface-container-low"}`}
            >
              <MdRemove /> Negativo
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Buscador y catálogo */}
          <div className="lg:col-span-3 space-y-3">
            <SearchInput value={name} onChange={setName} placeholder="Buscar producto por nombre..." />

            <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
              <div className="card-body p-2 sm:p-3 gap-1 max-h-112 overflow-y-auto">
                {/* Skeleton de búsqueda: queda manual — es más compacto (gap-1, p-2) que
                    el SkeletonList estándar, pensado para listas de página completa. */}
                {searching ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center p-2">
                      <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-1/2 rounded-full" />
                        <div className="skeleton h-3 w-1/3 rounded-full" />
                      </div>
                    </div>
                  ))
                ) : results.length === 0 ? (
                  <p className="text-body-sm text-secondary text-center py-8">
                    No se encontraron productos
                  </p>
                ) : (
                  results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors text-left"
                    >
                      <Avatar text={p.name} photo={p.photo} icon={MdOutlineInventory2} size="w-10 h-10" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface text-body-sm truncate">
                          {p.name}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          Stock actual: {p.currentStock}
                        </p>
                      </div>
                      <MdAdd className="text-xl text-primary shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {!searching && meta && meta.totalPages > 1 && (
                <div className="border-t border-outline-variant/50 p-3">
                  <Paginacion
                    meta={meta}
                    onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
                    itemLabel="productos"
                    scrollTop={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Formulario del movimiento */}
          <div className="lg:col-span-2">
            <Card className="sticky top-4" bodyClassName="p-4 sm:p-5 gap-3">
              <h2 className="font-semibold text-on-surface text-body-lg">{isAdjust ? "Detalle del ajuste" : "Detalle de la entrada"}</h2>

              {cart.length === 0 ? (
                <p className="text-body-sm text-secondary py-6 text-center">Aún no has agregado productos</p>
              ) : (
                <div className="divide-y divide-outline-variant/50 max-h-96 overflow-y-auto pr-1">
                  {cart.map((i) => (
                    <div key={i.productId} className="py-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-on-surface text-body-sm truncate">{i.name}</p>
                          <p className="text-label-sm text-on-surface-variant">Stock actual: {i.stock}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(i.productId)}
                          className="btn btn-ghost btn-xs btn-circle text-error shrink-0"
                          aria-label="Quitar"
                        >
                          <MdDeleteOutline className="text-base" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-label-sm text-secondary shrink-0 w-20">Cantidad</label>
                        <input
                          type="number"
                          min={1}
                          value={i.quantity}
                          onChange={(e) => changeQuantity(i.productId, e.target.value)}
                          className="input input-bordered input-sm rounded-full w-full bg-surface-container-low"
                        />
                      </div>
                      {!isAdjust && (
                        <div className="flex items-center gap-2">
                          <label className="text-label-sm text-secondary shrink-0 w-20">Costo (op.)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={i.unitCost}
                            onChange={(e) => changeCost(i.productId, e.target.value)}
                            placeholder="Opcional"
                            className="input input-bordered input-sm rounded-full w-full bg-surface-container-low"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isAdjust && (
                <div>
                  <label className="text-label-sm text-secondary">Proveedor (opcional)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="select select-bordered select-sm rounded-full w-full bg-surface-container-low mt-1"
                  >
                    <option value="">Sin proveedor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-label-sm text-secondary">Motivo {isAdjust && <span className="text-error">*</span>}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isAdjust ? "Ej: corrección por conteo físico" : "Opcional"}
                  className="textarea textarea-bordered rounded-2xl w-full bg-surface-container-low mt-1 text-body-sm"
                  rows={2}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="btn bg-primary text-on-primary border-none hover:bg-primary-container rounded-full font-label-md text-label-md w-full mt-1 disabled:opacity-40"
              >
                {submitting ? <span className="loading loading-spinner loading-sm" /> : "Registrar movimiento"}
              </button>
            </Card>
          </div>
        </div>

        {/* Historial reciente */}
        <Card bodyClassName="p-4 sm:p-5 gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-on-surface text-body-lg flex items-center gap-2">
              <MdOutlineLocalShipping /> Historial de movimientos
            </h2>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className={`btn btn-outline btn-sm border-outline-variant text-secondary hover:bg-surface-container-high gap-2 rounded-full font-label-md text-label-sm ${
                  movements.length === 0 ? "btn-disabled" : ""
                }`}
              >
                {exportLoading ? <span className="loading loading-spinner loading-xs" /> : <MdOutlineFileDownload className="text-lg" />}
                Exportar
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-lg z-10 w-56 p-2 mt-1"
              >
                <li>
                  <button onClick={() => handleExport("page")} className="rounded-xl text-body-sm text-on-surface">
                    Página actual
                    <span className="text-on-surface-variant">({movements.length})</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleExport("all")} disabled={exportLoading} className="rounded-xl text-body-sm text-on-surface">
                    Todos los resultados
                    {movementsMeta?.total > 0 && <span className="text-on-surface-variant">({movementsMeta.total})</span>}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">Filtros</span>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto text-label-sm text-primary hover:underline">
                Limpiar
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="form-control col-span-1">
              <span className="text-label-sm text-on-surface-variant mb-1">Desde</span>
              <input
                type="date"
                value={filterStartDate}
                max={filterEndDate || undefined}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="input input-bordered input-sm bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
              />
            </label>
            <label className="form-control col-span-1">
              <span className="text-label-sm text-on-surface-variant mb-1">Hasta</span>
              <input
                type="date"
                value={filterEndDate}
                min={filterStartDate || undefined}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="input input-bordered input-sm bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
              />
            </label>
            <label className="form-control col-span-1">
              <span className="text-label-sm text-on-surface-variant mb-1">Tipo</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select select-bordered select-sm bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
              >
                <option value="">Todos</option>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control col-span-1">
              <span className="text-label-sm text-on-surface-variant mb-1">Producto</span>
              <select
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="select select-bordered select-sm bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
              >
                <option value="">Todos</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <p className="text-body-sm text-secondary text-center py-6">Aún no hay movimientos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-label-sm text-secondary">
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Productos</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="text-body-sm whitespace-nowrap">{new Date(m.date).toLocaleDateString("es-CO")}</td>
                      <td className="text-body-sm">{TYPE_LABELS[m.type] ?? m.type}</td>
                      <td className="text-body-sm">
                        {(m.details ?? []).map((d) => `${d.product?.name ?? d.productId} (${d.quantity})`).join(", ")}
                      </td>
                      <td className="text-body-sm text-on-surface-variant max-w-40 truncate">{m.reason || "—"}</td>
                      <td>
                        <StatusBadge label={STATUS_LABELS[m.status] ?? m.status} tone={m.status === "Cancelled" ? "error" : "primary"} />
                      </td>
                      <td>
                        {m.status !== "Cancelled" && (
                          <button onClick={() => setCancelMovementId(m.id)} className="btn btn-ghost btn-xs text-error">
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {movementsMeta && movementsMeta.totalPages > 1 && (
            <Paginacion meta={movementsMeta} onPageChange={(p) => setMovementsPage(p)} itemLabel="movimientos" scrollTop={false} />
          )}
        </Card>
      </div>

      {/* Confirmación de cancelar movimiento — antes era un confirm() nativo del
          navegador; ahora usa ConfirmModal, igual que el resto de la app. */}
      <ConfirmModal
        open={cancelMovementId !== null}
        icon={IoWarning}
        tone="error"
        title="¿Cancelar este movimiento?"
        message="Se revertirá el efecto en el stock de los productos involucrados. Esta acción no se puede deshacer."
        confirmLabel="Cancelar movimiento"
        cancelLabel="Volver"
        loading={cancelLoading}
        onConfirm={confirmCancelMovement}
        onCancel={() => setCancelMovementId(null)}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Movimientos;
