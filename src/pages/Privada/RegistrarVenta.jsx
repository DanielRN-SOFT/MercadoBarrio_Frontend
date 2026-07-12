import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdOutlineInventory2,
  MdAdd,
  MdRemove,
  MdDeleteOutline,
  MdArrowBack,
  MdPointOfSale,
} from "react-icons/md";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import Avatar from "../../components/ui/Avatar";
import SearchInput from "../../components/ui/SearchInput";
import Card from "../../components/ui/Card";

const formatCOP = (n) => `$${Number(n ?? 0).toLocaleString("es-CO")}`;

const RegistrarVenta = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null); // { page, totalPages, total }
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]); // [{ productId, name, photo, price, stock, quantity }]
  const [submitting, setSubmitting] = useState(false);

  // Si cambia el texto de búsqueda, siempre volvemos a la página 1
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

  const addToCart = (product) => {
    if (product.currentStock <= 0) {
      addToast({
        message: "Este producto no tiene stock disponible",
        type: "error",
      });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          addToast({
            message: "No hay más stock disponible de este producto",
            type: "error",
          });
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          photo: product.photo,
          price: Number(product.price),
          stock: product.currentStock,
          quantity: 1,
        },
      ];
    });
  };

  const changeQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const newQty = i.quantity + delta;
          if (newQty > i.stock) {
            addToast({
              message: "No hay más stock disponible de este producto",
              type: "error",
            });
            return i;
          }
          return { ...i, quantity: newQty };
        })
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      addToast({
        message: "Agrega al menos un producto a la venta",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        details: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      const response = await fetchCliente("/sales", {
        method: "POST",
        body: payload,
      });

      // No mostramos el toast aquí: como navegamos inmediatamente después,
      // esta página se desmonta antes de que el toast llegue a pintarse.
      // Se pasa la info a MisVentas.jsx vía navigate state, que sí permanece
      // montado el tiempo suficiente para mostrarlo.
      navigate("/panel/ventas", {
        state: {
          saleSuccessMessage: "Venta registrada correctamente",
          productosEnAlerta: response?.productosEnAlerta ?? [],
        },
      });
    } catch (err) {
      addToast({
        message: err.message ?? "Error al registrar la venta",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/panel/ventas"
            className="btn btn-ghost btn-circle hover:bg-surface-container-high"
            aria-label="Volver"
          >
            <MdArrowBack className="text-xl text-on-surface" />
          </Link>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <MdPointOfSale className="text-lg sm:text-xl text-on-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
              Nueva venta
            </h1>
            <p className="text-body-sm sm:text-body-md text-secondary">
              Selecciona los productos y confirma el total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Buscador y catálogo */}
          <div className="lg:col-span-3 space-y-3">
            <SearchInput
              value={name}
              onChange={setName}
              placeholder="Buscar producto por nombre..."
            />

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
                  <p className="text-body-sm text-secondary text-center py-8">
                    No se encontraron productos
                  </p>
                ) : (
                  results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      disabled={p.currentStock <= 0}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Avatar
                        text={p.name}
                        photo={p.photo}
                        icon={MdOutlineInventory2}
                        size="w-10 h-10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface text-body-sm truncate">
                          {p.name}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {formatCOP(p.price)} · {p.currentStock} uds
                          disponibles
                        </p>
                      </div>
                      <MdAdd className="text-xl text-primary shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {/* Paginación del catálogo */}
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

          {/* Carrito */}
          <div className="lg:col-span-2">
            <Card className="sticky top-4" bodyClassName="p-4 sm:p-5 gap-3">
              <h2 className="font-semibold text-on-surface text-body-lg">
                Detalle de la venta
              </h2>

              {cart.length === 0 ? (
                <p className="text-body-sm text-secondary py-6 text-center">
                  Aún no has agregado productos
                </p>
              ) : (
                <div className="divide-y divide-outline-variant/50 max-h-96 overflow-y-auto pr-1">
                  {cart.map((i) => (
                    <div
                      key={i.productId}
                      className="py-3 flex items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface text-body-sm truncate">
                          {i.name}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {formatCOP(i.price)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => changeQuantity(i.productId, -1)}
                          className="btn btn-ghost btn-xs btn-circle bg-surface-container-high"
                        >
                          <MdRemove className="text-sm" />
                        </button>
                        <span className="w-6 text-center font-medium text-body-sm">
                          {i.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(i.productId, 1)}
                          className="btn btn-ghost btn-xs btn-circle bg-surface-container-high"
                        >
                          <MdAdd className="text-sm" />
                        </button>
                      </div>
                      <span className="font-semibold text-on-surface text-body-sm w-20 text-right shrink-0">
                        {formatCOP(i.price * i.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(i.productId)}
                        className="btn btn-ghost btn-xs btn-circle text-error shrink-0"
                        aria-label="Quitar"
                      >
                        <MdDeleteOutline className="text-base" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/50">
                <span className="font-semibold text-on-surface text-body-lg">
                  Total
                </span>
                <span className="font-bold text-primary text-title-lg">
                  {formatCOP(total)}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="btn bg-primary text-on-primary border-none hover:bg-primary-container rounded-full font-label-md text-label-md w-full mt-2 disabled:opacity-40"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Confirmar venta"
                )}
              </button>
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default RegistrarVenta;
