import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdOutlineInventory2, MdAdd, MdRemove, MdDeleteOutline, MdArrowBack, MdSwapVert, MdOutlineLocalShipping } from "react-icons/md";
import { IoSearchSharp, IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";

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
        {getInitials(product.name) || <MdOutlineInventory2 className="text-on-primary text-lg" />}
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

  const isAdjust = movementType === "Ajuste";
  const finalType = isAdjust ? (adjustSign === "positivo" ? "AdjustEntry" : "AdjustExit") : movementType === "Entrada" ? "Entry" : "Exit";

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
        .catch(() => addToast({ message: "Error al buscar productos", type: "error" }))
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

  const loadHistory = (targetPage = 1) => {
    setLoadingHistory(true);
    fetchCliente(`/movements?page=${targetPage}`)
      .then((res) => {
        setMovements(res?.data ?? []);
        setMovementsMeta(res?.meta ?? null);
      })
      .catch(() => addToast({ message: "Error al cargar el historial", type: "error" }))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    loadHistory(movementsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementsPage]);

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
    const qty = Math.max(1, parseInt(value) || 1);
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  };

  const changeCost = (productId, value) => {
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, unitCost: value } : i)));
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

  const handleCancel = async (id) => {
    if (!confirm("¿Cancelar este movimiento? Se revertirá el efecto en el stock.")) return;
    try {
      await fetchCliente(`/movements/delete/${id}`, { method: "POST" });
      addToast({ message: "Movimiento cancelado", type: "success" });
      loadHistory(movementsPage);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al cancelar el movimiento",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/panel/inventario" className="btn btn-ghost btn-circle hover:bg-surface-container-high" aria-label="Volver">
            <MdArrowBack className="text-xl text-on-surface" />
          </Link>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <MdSwapVert className="text-lg sm:text-xl text-on-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
              Movimientos de inventario
            </h1>
            <p className="text-body-sm sm:text-body-md text-secondary">Registra entradas y ajustes de stock</p>
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
            <label className="input input-bordered flex items-center gap-2 rounded-full bg-surface-container-low border-outline-variant focus-within:border-primary transition-colors">
              <IoSearchSharp className="text-on-surface-variant text-lg shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Buscar producto por nombre..."
                className="grow bg-transparent min-w-0"
              />
              {name && (
                <button onClick={() => setName("")} className="btn btn-ghost btn-xs btn-circle shrink-0">
                  <IoCloseSharp />
                </button>
              )}
            </label>

            <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
              <div className="card-body p-2 sm:p-3 gap-1 max-h-112 overflow-y-auto">
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
                  <p className="text-body-sm text-secondary text-center py-8">No se encontraron productos</p>
                ) : (
                  results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors text-left"
                    >
                      <ProductAvatar product={p} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface text-body-sm truncate">{p.name}</p>
                        <p className="text-label-sm text-on-surface-variant">Stock actual: {p.currentStock}</p>
                      </div>
                      <MdAdd className="text-xl text-primary shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {!searching && meta && meta.totalPages > 1 && (
                <div className="border-t border-outline-variant/50 p-3">
                  <Paginacion meta={meta} onPageChange={(nuevaPagina) => setPage(nuevaPagina)} itemLabel="productos" scrollTop={false} />
                </div>
              )}
            </div>
          </div>

          {/* Formulario del movimiento */}
          <div className="lg:col-span-2">
            <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm sticky top-4">
              <div className="card-body p-4 sm:p-5 gap-3">
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
              </div>
            </div>
          </div>
        </div>

        {/* Historial reciente */}
        <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
          <div className="card-body p-4 sm:p-5 gap-3">
            <h2 className="font-semibold text-on-surface text-body-lg flex items-center gap-2">
              <MdOutlineLocalShipping /> Historial de movimientos
            </h2>

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
                          <span className={`badge badge-sm rounded-full ${m.status === "Cancelled" ? "badge-error" : "badge-success"}`}>
                            {STATUS_LABELS[m.status] ?? m.status}
                          </span>
                        </td>
                        <td>
                          {m.status !== "Cancelled" && (
                            <button onClick={() => handleCancel(m.id)} className="btn btn-ghost btn-xs text-error">
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
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Movimientos;
