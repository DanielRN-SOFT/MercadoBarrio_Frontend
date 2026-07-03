import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix del ícono por defecto de Leaflet con bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MdStorefront,
  MdAdd,
  MdOutlineFilterAlt,
  MdVisibility,
  MdEdit,
  MdOutlineDeleteOutline,
  MdOutlineRestore,
  MdOutlineStorefront,
  MdSearch,
  MdLocationOn,
  MdLocationCity,
  MdMyLocation,
} from "react-icons/md";
import { IoCloseSharp, IoCloseCircle } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";

// --- Helpers de presentación ---------------------------------------------

const STATUS_LABEL = {
  Active: "Activa",
  Inactive: "Inactiva",
  Pending: "Pendiente",
};

const STATUS_BADGE_CLASS = {
  Active: "bg-primary-fixed text-on-primary-fixed-variant",
  Inactive: "bg-error-container text-on-error-container",
  Pending: "bg-secondary-container text-on-secondary-container",
};

const STATUS_DOT_CLASS = {
  Active: "bg-primary",
  Inactive: "bg-error",
  Pending: "bg-secondary",
};

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recentra el mapa cuando cambian las coordenadas sin desmontar el MapContainer
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng]);
  return null;
};

const getInitials = (str = "") =>
  str
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const StoreAvatar = ({
  store,
  size = "w-12 h-12",
  textSize = "text-label-sm",
}) => {
  const [imgError, setImgError] = useState(false);
  const name = store?.name ?? "";

  if (store?.logo && !imgError) {
    return (
      <img
        src={store.logo}
        alt={name}
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
        {getInitials(name) || (
          <MdOutlineStorefront className="text-on-primary text-lg" />
        )}
      </span>
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
      STATUS_BADGE_CLASS[status] ??
      "bg-secondary-container text-on-secondary-container"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_CLASS[status] ?? "bg-secondary"}`}
    />
    {STATUS_LABEL[status] ?? status}
  </span>
);

// Campo de formulario reutilizable, estilo "horarios"
const Field = ({ label, required, children }) => (
  <div className="form-control">
    <label className="label pb-1">
      <span className="label-text text-label-md font-semibold text-on-surface-variant">
        {label} {required && <span className="text-error">*</span>}
      </span>
    </label>
    {children}
  </div>
);

const inputClass =
  "input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full";
const selectClass =
  "select select-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full";
const textareaClass =
  "textarea textarea-bordered bg-surface-container-low border-outline-variant focus:border-primary focus:outline-none rounded-xl w-full resize-none";

const emptyForm = {
  name: "",
  address: "",
  neighborhood: "",
  phone: "",
  description: "",
  photo: "",
  longitude: "",
  latitude: "",
  storeCategoryId: "",
  userId: "",
};

const AdminTiendas = () => {
  const { toasts, addToast, removeToast } = useToast();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [actionLoading, setActionLoading] = useState(false);

  // Catálogos auxiliares (el backend no hace join, así que resolvemos nombres en el cliente)
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);

  // Filtros locales (la página actual solamente; getStores no soporta filtros server-side)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modales
  const [detailStore, setDetailStore] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formStore, setFormStore] = useState(null); // null = cerrado, {} = crear, {...} = editar
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [locatingForm, setLocatingForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);

  useEffect(() => {
    fetchCliente("/store-categories")
      .then((res) => setCategories(res?.data ?? []))
      .catch(() => {});
    fetchCliente("/users")
      .then((res) => setOwners(res?.data ?? []))
      .catch(() => {});
  }, []);

  const categoryName = (id) =>
    categories.find((c) => c.id === id)?.name ?? `Categoría #${id}`;
  const ownerLabel = (id) => {
    const u = owners.find((o) => o.id === id);
    if (!u) return `Usuario #${id}`;
    return u.name ?? u.fullName ?? u.email ?? `Usuario #${id}`;
  };

  const fetchStores = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetchCliente(`/stores?page=${p}`);
      setStores(res.data);
      setMeta(res.meta);
    } catch {
      addToast({ message: "Error al cargar las tiendas", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(page);
  }, [page]);

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchesStatus = !statusFilter || s.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [stores, statusFilter, search]);

  const hasFilters = search || statusFilter;
  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  // --- Detalle -------------------------------------------------------------

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailStore({ id });
    try {
      const res = await fetchCliente(`/stores/${id}`);
      setDetailStore(res.data);
    } catch {
      addToast({
        message: "Error al cargar el detalle de la tienda",
        type: "error",
      });
      setDetailStore(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const detailLat = parseFloat(detailStore?.latitude);
  const detailLng = parseFloat(detailStore?.longitude);
  const detailHasCoords =
    !detailLoading &&
    detailStore &&
    !isNaN(detailLat) &&
    !isNaN(detailLng) &&
    (detailLat !== 0 || detailLng !== 0);

  // --- Crear / Editar --------------------------------------------------------

  const closeFormModal = () => {
    setFormStore(null);
    setFormError("");
  };

  const openCreate = () => {
    setFormError("");
    setFormStore({ ...emptyForm });
  };
  const fillForm = (store) => ({
    id: store.id,
    name: store.name ?? "",
    address: store.address ?? "",
    neighborhood: store.neighborhood ?? "",
    phone: store.phone ?? "",
    description: store.description ?? "",
    photo: store.photo ?? "",
    longitude: store.longitude ?? "",
    latitude: store.latitude ?? "",
    storeCategoryId: store.storeCategoryId ?? "",
    userId: store.userId ?? "",
  });

  // Siempre trae el registro completo antes de editar, sin depender de qué
  // tan completo venga el select de la fila que disparó la acción (lista o detalle).
  const openEdit = async (store) => {
    setFormError("");
    setFormLoading(true);
    setFormStore(fillForm(store));
    try {
      const res = await fetchCliente(`/stores/${store.id}`);
      setFormStore(fillForm(res.data));
    } catch {
      addToast({
        message: "No se pudo cargar la información completa de la tienda",
        type: "error",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (field, value) =>
    setFormStore((prev) => ({ ...prev, [field]: value }));

  const handleUseMyLocationForm = () => {
    if (!navigator.geolocation) {
      addToast({
        message: "Tu navegador no soporta geolocalización",
        type: "error",
      });
      return;
    }
    setLocatingForm(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormStore((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        addToast({ message: "Ubicación capturada", type: "success" });
        setLocatingForm(false);
      },
      () => {
        addToast({ message: "No se pudo obtener tu ubicación", type: "error" });
        setLocatingForm(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const formLat = parseFloat(formStore?.latitude);
  const formLng = parseFloat(formStore?.longitude);
  const formHasCoords =
    formStore?.latitude !== "" &&
    formStore?.longitude !== "" &&
    !isNaN(formLat) &&
    !isNaN(formLng);

  const isCreateForm = formStore && !formStore.id;

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formStore.name?.trim() || !formStore.address?.trim()) {
      setFormError("Nombre y dirección son obligatorios");
      return;
    }
    if (!formStore.storeCategoryId) {
      setFormError("Selecciona una categoría de tienda");
      return;
    }
    if (isCreateForm && !formStore.userId) {
      setFormError("Selecciona el usuario propietario");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        name: formStore.name,
        address: formStore.address,
        neighborhood: formStore.neighborhood,
        phone: formStore.phone,
        description: formStore.description,
        photo: formStore.photo,
        longitude: formStore.longitude
          ? parseFloat(formStore.longitude)
          : undefined,
        latitude: formStore.latitude
          ? parseFloat(formStore.latitude)
          : undefined,
        storeCategoryId: parseInt(formStore.storeCategoryId),
        ...(isCreateForm && { userId: parseInt(formStore.userId) }),
      };

      if (isCreateForm) {
        await fetchCliente("/stores", { method: "POST", body: payload });
        addToast({ message: "Tienda creada correctamente", type: "success" });
      } else {
        await fetchCliente(`/stores/${formStore.id}`, {
          method: "PUT",
          body: payload,
        });
        addToast({ message: "Tienda editada exitosamente", type: "success" });
      }

      closeFormModal();
      fetchStores(page);
    } catch (err) {
      setFormError(err.message ?? "Error al guardar la tienda");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Eliminar / Restaurar ---------------------------------------------

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await fetchCliente(`/stores/delete/${deleteTarget.id}`, {
        method: "PUT",
      });
      addToast({ message: "Tienda eliminada correctamente", type: "success" });
      setDeleteTarget(null);
      fetchStores(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al eliminar la tienda",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await fetchCliente(`/stores/restore/${restoreTarget.id}`, {
        method: "PUT",
      });
      addToast({
        message: "Tienda restablecida correctamente",
        type: "success",
      });
      setRestoreTarget(null);
      fetchStores(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al restablecer la tienda",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdStorefront className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                Tiendas
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Gestiona las tiendas registradas en la plataforma
                {meta.total > 0 && (
                  <span className="text-on-surface-variant">
                    {" "}
                    · {meta.total} en total
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={openCreate}
              className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors flex-1 sm:flex-none"
            >
              <MdAdd className="text-xl" />
              Nueva tienda
            </button>
          </div>
        </div>

        {/* Filtros (aplican sobre la página cargada) */}
        <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
          <div className="card-body p-4 sm:p-5 gap-3">
            <div className="flex items-center gap-2 text-secondary">
              <MdSearch className="text-base" />
              <span className="text-label-sm uppercase tracking-wide font-semibold">
                Filtros
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="form-control sm:col-span-2">
                <span className="text-label-sm text-on-surface-variant mb-1">
                  Buscar
                </span>
                <div className="relative">
                  <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-lg" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre, dirección o teléfono"
                    className="input input-bordered w-full pl-10 bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                  />
                </div>
              </label>

              <label className="form-control">
                <span className="text-label-sm text-on-surface-variant mb-1">
                  Estado
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-full text-body-sm"
                >
                  <option value="">Todos</option>
                  <option value="Active">Activa</option>
                  <option value="Pending">Pendiente</option>
                  <option value="Inactive">Inactiva</option>
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
        ) : filteredStores.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-center py-16 sm:py-20 px-6 text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <MdStorefront className="text-3xl opacity-40" />
              </div>
              {hasFilters ? (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">
                    Sin resultados
                  </p>
                  <p className="text-body-md mt-1">
                    No encontramos tiendas con esos filtros en esta página.
                    Intenta limpiarlos o cambiar de página.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">
                    Aún no hay tiendas
                  </p>
                  <p className="text-body-md mt-1">
                    Registra la primera tienda para comenzar.
                  </p>
                  <button
                    onClick={openCreate}
                    className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
                  >
                    <MdAdd className="text-xl" /> Registrar tienda
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {filteredStores.map((s) => (
                <div
                  key={s.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StoreAvatar store={s} />
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {s.name}
                          </p>
                          <p className="text-body-sm text-secondary truncate">
                            {s.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openDetail(s.id)}
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Ver detalle"
                        >
                          <MdVisibility className="text-lg text-secondary" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Editar"
                        >
                          <MdEdit className="text-lg text-secondary" />
                        </button>
                        {s.status === "Inactive" ? (
                          <button
                            onClick={() => setRestoreTarget(s)}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-primary-container/60"
                            aria-label="Restaurar"
                          >
                            <MdOutlineRestore className="text-lg text-primary" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                            aria-label="Eliminar"
                          >
                            <MdOutlineDeleteOutline className="text-lg text-error" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <span className="text-body-sm text-on-surface-variant">
                        {categoryName(s.storeCategoryId)}
                      </span>
                      <StatusBadge status={s.status} />
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
                          Tienda
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Categoría
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Teléfono
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
                      {filteredStores.map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-3 min-w-0">
                              <StoreAvatar store={s} size="w-10 h-10" />
                              <div className="min-w-0">
                                <p className="font-semibold text-on-surface text-body-md truncate">
                                  {s.name}
                                </p>
                                <p className="text-body-sm text-secondary truncate max-w-xs">
                                  {s.address}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-body-sm text-secondary">
                            {categoryName(s.storeCategoryId)}
                          </td>
                          <td className="text-body-sm text-secondary">
                            {s.phone || "—"}
                          </td>
                          <td>
                            <StatusBadge status={s.status} />
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
                              <button
                                onClick={() => openEdit(s)}
                                className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                                data-tip="Editar"
                              >
                                <MdEdit className="text-lg text-secondary" />
                              </button>
                              {s.status === "Inactive" ? (
                                <button
                                  onClick={() => setRestoreTarget(s)}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-primary-container/60"
                                  data-tip="Restaurar"
                                >
                                  <MdOutlineRestore className="text-lg text-primary" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteTarget(s)}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                                  data-tip="Eliminar"
                                >
                                  <MdOutlineDeleteOutline className="text-lg text-error" />
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
          itemLabel="tiendas"
        />
      </div>

      {/* Modal detalle de tienda */}
      {detailStore && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl max-w-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdStorefront className="text-xl text-on-primary-container" />
              </div>
              <button
                onClick={() => setDetailStore(null)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-title-md text-on-surface">
                {detailLoading ? "Cargando..." : detailStore.name}
              </h3>
              {!detailLoading && <StatusBadge status={detailStore.status} />}
            </div>
            {!detailLoading && (
              <p className="text-body-md text-secondary mt-1">
                {detailStore.address}
              </p>
            )}

            {detailLoading ? (
              <div className="mt-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-4 w-2/3 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">
                      Categoría
                    </p>
                    <p className="text-body-sm text-on-surface mt-1">
                      {detailStore.storeCategory?.name ??
                        categoryName(detailStore.storeCategoryId)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">
                      Propietario
                    </p>
                    <p className="text-body-sm text-on-surface mt-1">
                      {ownerLabel(detailStore.userId)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 col-span-2 sm:col-span-1">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">
                      Teléfono
                    </p>
                    <p className="text-body-sm text-on-surface mt-1">
                      {detailStore.phone || "—"}
                    </p>
                  </div>
                </div>

                {detailStore.description && (
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-1">
                      Descripción
                    </p>
                    <p className="text-body-sm text-on-surface">
                      {detailStore.description}
                    </p>
                  </div>
                )}

                {/* Ubicación con vista previa en el mapa, igual que en Mi Tienda */}
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <MdLocationOn className="text-base text-secondary" />
                    Ubicación
                  </p>
                  {detailHasCoords ? (
                    <div className="rounded-2xl overflow-hidden border border-outline-variant h-48 sm:h-64 w-full z-0">
                      <MapContainer
                        center={[detailLat, detailLng]}
                        zoom={16}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        <RecenterMap lat={detailLat} lng={detailLng} />
                        <Marker
                          position={[detailLat, detailLng]}
                          icon={defaultIcon}
                        >
                          <Popup minWidth={200} maxWidth={240}>
                            <div className="flex flex-col gap-1 p-1">
                              {detailStore.photo && (
                                <img
                                  src={detailStore.photo}
                                  alt={detailStore.name}
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                              )}
                              <span className="font-semibold leading-tight text-sm">
                                {detailStore.name}
                              </span>
                              <div className="text-xs m-0 text-on-surface/60 leading-snug">
                                {detailStore.neighborhood && (
                                  <p>
                                    <MdLocationCity className="text-primary inline" />{" "}
                                    {detailStore.neighborhood}
                                  </p>
                                )}
                                {detailStore.address && (
                                  <p>
                                    <FaLocationDot className="text-primary inline m-0" />{" "}
                                    {detailStore.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-outline-variant h-40 w-full flex items-center justify-center text-center px-6 bg-surface-container-lowest">
                      <p className="text-label-sm text-on-surface-variant">
                        Esta tienda aún no tiene coordenadas registradas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="modal-action gap-2 flex-col-reverse sm:flex-row pt-4">
              <button
                onClick={() => setDetailStore(null)}
                className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
              >
                Cerrar
              </button>
              {!detailLoading && (
                <button
                  onClick={() => {
                    openEdit(detailStore);
                    setDetailStore(null);
                  }}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container gap-1.5 w-full sm:w-auto"
                >
                  <MdEdit className="text-lg" />
                  Editar
                </button>
              )}
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDetailStore(null)}
          />
        </dialog>
      )}

      {/* Modal crear / editar tienda */}
      {formStore && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl max-w-xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdStorefront className="text-xl text-on-primary-container" />
              </div>
              <button
                onClick={closeFormModal}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>
            </div>

            <h3 className="font-bold text-title-md text-on-surface">
              {isCreateForm ? "Nueva tienda" : "Editar tienda"}
            </h3>
            <p className="text-body-md text-secondary mt-1">
              {isCreateForm
                ? "Registra una nueva tienda y asígnale un propietario."
                : "Modifica la información del establecimiento."}
            </p>

            <form
              onSubmit={handleSubmitForm}
              className="mt-5 space-y-4 max-h-[55vh] overflow-y-auto pr-1"
            >
              {formLoading && (
                <div className="flex items-center gap-2 text-secondary text-body-sm pb-1">
                  <span className="loading loading-spinner loading-xs" />
                  Cargando información completa...
                </div>
              )}

              <Field label="Nombre" required>
                <input
                  type="text"
                  value={formStore.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  disabled={formLoading}
                  placeholder="Ej: Tienda Don Carlos"
                  className={inputClass}
                />
              </Field>

              <Field label="Dirección" required>
                <input
                  type="text"
                  value={formStore.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  placeholder="Ej: Calle 10 # 5-23"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Barrio">
                  <input
                    type="text"
                    value={formStore.neighborhood}
                    onChange={(e) =>
                      handleFormChange("neighborhood", e.target.value)
                    }
                    placeholder="Ej: Centro"
                    className={inputClass}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    type="text"
                    value={formStore.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="Ej: 3101234567"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitud">
                  <input
                    type="number"
                    step="any"
                    value={formStore.latitude}
                    onChange={(e) =>
                      handleFormChange("latitude", e.target.value)
                    }
                    placeholder="Ej: 4.7459"
                    className={inputClass}
                  />
                </Field>
                <Field label="Longitud">
                  <input
                    type="number"
                    step="any"
                    value={formStore.longitude}
                    onChange={(e) =>
                      handleFormChange("longitude", e.target.value)
                    }
                    placeholder="Ej: -75.9124"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="form-control">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <label className="label p-0">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Vista previa en el mapa
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseMyLocationForm}
                    disabled={locatingForm}
                    className="btn btn-ghost btn-xs gap-1.5 text-primary font-label-sm rounded-full disabled:text-primary/60"
                  >
                    {locatingForm ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <MdMyLocation className="text-sm" />
                    )}
                    {locatingForm ? "Ubicando..." : "Usar mi ubicación"}
                  </button>
                </div>

                {formHasCoords ? (
                  <div className="rounded-2xl overflow-hidden border border-outline-variant h-48 w-full z-0">
                    <MapContainer
                      center={[formLat, formLng]}
                      zoom={16}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      />
                      <RecenterMap lat={formLat} lng={formLng} />
                      <Marker position={[formLat, formLng]} icon={defaultIcon}>
                        <Popup minWidth={180} maxWidth={220}>
                          <span className="font-semibold text-sm">
                            {formStore.name || "Tienda"}
                          </span>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-outline-variant h-32 w-full flex items-center justify-center text-center px-6 bg-surface-container-lowest">
                    <p className="text-label-sm text-on-surface-variant">
                      Ingresa latitud y longitud (o usa tu ubicación) para ver
                      el mapa.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoría" required>
                  <select
                    value={formStore.storeCategoryId}
                    onChange={(e) =>
                      handleFormChange("storeCategoryId", e.target.value)
                    }
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Selecciona...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {isCreateForm ? (
                  <Field label="Propietario" required>
                    <select
                      value={formStore.userId}
                      onChange={(e) =>
                        handleFormChange("userId", e.target.value)
                      }
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Selecciona...
                      </option>
                      {owners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name ?? o.fullName ?? o.email}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <Field label="Foto (URL)">
                    <input
                      type="text"
                      value={formStore.photo}
                      onChange={(e) =>
                        handleFormChange("photo", e.target.value)
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>

              {isCreateForm && (
                <Field label="Foto (URL)">
                  <input
                    type="text"
                    value={formStore.photo}
                    onChange={(e) => handleFormChange("photo", e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Descripción">
                <textarea
                  value={formStore.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  rows={3}
                  placeholder="Cuéntales a los clientes qué ofrece esta tienda..."
                  className={textareaClass}
                />
              </Field>

              {formError && (
                <div className="alert bg-error-container border-none rounded-xl py-2.5">
                  <span className="text-body-sm text-on-error-container">
                    {formError}
                  </span>
                </div>
              )}

              <div className="modal-action gap-2 flex-col-reverse sm:flex-row pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={actionLoading}
                  className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container w-full sm:w-auto"
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : isCreateForm ? (
                    "Crear tienda"
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeFormModal} />
        </dialog>
      )}

      {/* Modal confirmación eliminar */}
      {deleteTarget && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center mb-3">
              <IoCloseCircle className="text-xl text-on-error-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Eliminar la tienda "{deleteTarget.name}"?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              La tienda quedará marcada como inactiva y dejará de ser visible en
              el catálogo público. Puedes restaurarla en cualquier momento.
            </p>
            <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn bg-error text-on-error border-none rounded-full font-label-md hover:brightness-95 w-full sm:w-auto"
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeleteTarget(null)}
          />
        </dialog>
      )}

      {/* Modal confirmación restaurar */}
      {restoreTarget && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center mb-3">
              <MdOutlineRestore className="text-xl text-on-primary-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Restaurar la tienda "{restoreTarget.name}"?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              La tienda volverá a estar activa y visible en el catálogo público.
            </p>
            <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
              <button
                onClick={() => setRestoreTarget(null)}
                className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestore}
                disabled={actionLoading}
                className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container w-full sm:w-auto"
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Restaurar"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setRestoreTarget(null)}
          />
        </dialog>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminTiendas;
