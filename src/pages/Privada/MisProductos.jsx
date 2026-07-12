import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdOutlineInventory2, MdAdd, MdEdit, MdRestoreFromTrash, MdOutlineFilterAlt, MdHistory } from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import ProductoTimelineModal from "../../components/ui/ProductoTimelineModal";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import SearchInput from "../../components/ui/SearchInput";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import IconButton from "../../components/ui/IconButton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Avatar from "../../components/ui/Avatar";

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/products/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo; // ya es una URL absoluta
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
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
  const [timelineProduct, setTimelineProduct] = useState(null); // RF-46

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
        <PageHeader
          icon={MdOutlineInventory2}
          title="Mis Productos"
          subtitle={
            <>
              Gestiona el catálogo de tu establecimiento
              {meta.total > 0 && <span className="text-on-surface-variant"> · {meta.total} en total</span>}
            </>
          }
          action={{ label: "Nuevo producto", to: "/panel/productos/nuevo", icon: MdAdd }}
          actionAs={Link}
        />

        {/* Filtros */}
        <Card bodyClassName="p-4 sm:p-5 gap-3">
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">Filtros</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput
              value={name}
              onChange={setName}
              placeholder="Buscar por nombre..."
              className="flex-1"
            />

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
        </Card>

        {/* Estado vacío / carga compartido */}
        {loading ? (
          <Card overflowHidden bodyClassName="p-0">
            <SkeletonList rows={4} />
          </Card>
        ) : products.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState
              icon={MdOutlineInventory2}
              title={hasFilters ? "Sin resultados" : "Aún no tienes productos"}
              message={
                hasFilters
                  ? "No encontramos productos con esos filtros. Intenta ajustarlos."
                  : "Agrega tu primer producto para comenzar."
              }
              action={
                hasFilters
                  ? undefined
                  : { label: "Agregar producto", to: "/panel/productos/nuevo", icon: MdAdd }
              }
              actionAs={Link}
            />
          </Card>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {products.map((p) => (
                <div key={p.id} className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          text={p.name}
                          photo={p.photo}
                          buildPhotoUrl={getPhotoUrl}
                          icon={MdOutlineInventory2}
                          size="w-11 h-11"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">{p.name}</p>
                          <span className="badge badge-ghost bg-surface-container-high border-none text-on-surface-variant badge-sm mt-1">
                            {p.productCategory?.name ?? "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          icon={MdHistory}
                          onClick={() => setTimelineProduct(p)}
                          label="Ver historial"
                          tone="primary"
                          showTooltip={false}
                        />
                        <IconButton
                          icon={MdEdit}
                          as={Link}
                          to={`/panel/productos/${p.id}/editar`}
                          label="Editar"
                          tone="secondary"
                          showTooltip={false}
                        />
                        {p.status === "Active" ? (
                          <IconButton
                            icon={IoCloseCircle}
                            onClick={() => setConfirmId(p.id)}
                            label="Desactivar"
                            tone="error"
                            showTooltip={false}
                          />
                        ) : (
                          <IconButton
                            icon={MdRestoreFromTrash}
                            onClick={() => handleRestore(p.id)}
                            disabled={actionLoading}
                            label="Reactivar"
                            tone="primary"
                            showTooltip={false}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <span className="text-primary font-bold text-body-md">${Number(p.price).toLocaleString("es-CO")}</span>

                      <StatusBadge
                        label={`${p.currentStock} uds`}
                        tone={p.currentStock <= p.lowStockThreshold ? "tertiary" : "secondary"}
                      />

                      <StatusBadge
                        label={p.status === "Active" ? "Activo" : "Inactivo"}
                        tone={p.status === "Active" ? "primary" : "neutral"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de TABLA — escritorio */}
            <Card overflowHidden bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant">
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 first:rounded-tl-2xl">
                        Producto
                      </th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Categoría</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Precio</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Stock</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">Estado</th>
                      <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 text-right last:rounded-tr-2xl">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar
                              text={p.name}
                              photo={p.photo}
                              buildPhotoUrl={getPhotoUrl}
                              icon={MdOutlineInventory2}
                              size="w-10 h-10"
                            />
                            <span className="font-semibold text-on-surface text-body-md">{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-ghost bg-surface-container-high border-none text-on-surface-variant badge-sm">
                            {p.productCategory?.name ?? "—"}
                          </span>
                        </td>
                        <td className="text-primary font-bold text-body-md">${Number(p.price).toLocaleString("es-CO")}</td>
                        <td>
                          <StatusBadge
                            label={`${p.currentStock} uds`}
                            tone={p.currentStock <= p.lowStockThreshold ? "tertiary" : "secondary"}
                          />
                        </td>
                        <td>
                          <StatusBadge
                            label={p.status === "Active" ? "Activo" : "Inactivo"}
                            tone={p.status === "Active" ? "primary" : "neutral"}
                          />
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={MdHistory}
                              onClick={() => setTimelineProduct(p)}
                              label="Ver historial"
                              tone="primary"
                            />
                            <IconButton
                              icon={MdEdit}
                              as={Link}
                              to={`/panel/productos/${p.id}/editar`}
                              label="Editar"
                              tone="secondary"
                            />
                            {p.status === "Active" ? (
                              <IconButton
                                icon={IoCloseCircle}
                                onClick={() => setConfirmId(p.id)}
                                label="Desactivar"
                                tone="error"
                              />
                            ) : (
                              <IconButton
                                icon={MdRestoreFromTrash}
                                onClick={() => handleRestore(p.id)}
                                disabled={actionLoading}
                                label="Reactivar"
                                tone="primary"
                              />
                            )}
                          </div>
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

      <ConfirmModal
        open={!!confirmId}
        icon={IoCloseCircle}
        tone="error"
        title="¿Desactivar producto?"
        message="El producto dejará de ser visible en el catálogo público. Puedes reactivarlo en cualquier momento."
        confirmLabel="Desactivar"
        loading={actionLoading}
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <ProductoTimelineModal product={timelineProduct} onClose={() => setTimelineProduct(null)} />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default MisProductos;
