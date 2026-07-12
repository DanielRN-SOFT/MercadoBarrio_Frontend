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
  MdLocationOn,
  MdLocationCity,
  MdMyLocation,
  MdAddAPhoto,
  MdBrokenImage,
  MdClose,
  MdCategory,
  MdPhone,
  MdOutlineDescription,
} from "react-icons/md";
import { IoCloseSharp, IoCloseCircle } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import IconButton from "../../components/ui/IconButton";
import SkeletonList from "../../components/ui/SkeletonList";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Avatar from "../../components/ui/Avatar";

// --- Helpers de presentación ---------------------------------------------

// Mapea el status del backend al tone de StatusBadge (mismos colores exactos
// que tenía el badge local: Active→primary, Inactive→error, Pending→pending)
const STATUS_TONE = {
  Active: "primary",
  Inactive: "error",
  Pending: "pending",
};

const STATUS_LABEL = {
  Active: "Activa",
  Inactive: "Inactiva",
  Pending: "Pendiente",
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

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/stores/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http") || photo.startsWith("blob:")) return photo;
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
};

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

  // Archivo de foto seleccionado en el formulario y su vista previa local
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState(false);

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
  const detailPhotoUrl = getPhotoUrl(detailStore?.photo);

  // --- Crear / Editar --------------------------------------------------------

  const closeFormModal = () => {
    setFormStore(null);
    setFormError("");
    setPhotoFile(null);
    setPreviewUrl("");
    setPhotoError(false);
  };

  const openCreate = () => {
    setFormError("");
    setPhotoFile(null);
    setPreviewUrl("");
    setPhotoError(false);
    setFormStore({ ...emptyForm });
  };
  const fillForm = (store) => ({
    id: store.id,
    name: store.name ?? "",
    address: store.address ?? "",
    neighborhood: store.neighborhood ?? "",
    phone: store.phone ?? "",
    description: store.description ?? "",
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
    setPhotoFile(null);
    setPhotoError(false);
    setFormStore(fillForm(store));
    setPreviewUrl(getPhotoUrl(store.photo) ?? "");
    try {
      const res = await fetchCliente(`/stores/${store.id}`);
      setFormStore(fillForm(res.data));
      setPreviewUrl(getPhotoUrl(res.data.photo) ?? "");
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoError(false);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPreviewUrl("");
  };

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
      const formData = new FormData();
      formData.append("name", formStore.name);
      formData.append("address", formStore.address);
      formData.append("neighborhood", formStore.neighborhood ?? "");
      formData.append("phone", formStore.phone ?? "");
      formData.append("description", formStore.description ?? "");
      if (formStore.longitude !== "") {
        formData.append("longitude", parseFloat(formStore.longitude));
      }
      if (formStore.latitude !== "") {
        formData.append("latitude", parseFloat(formStore.latitude));
      }
      formData.append("storeCategoryId", parseInt(formStore.storeCategoryId));
      if (isCreateForm) {
        formData.append("userId", parseInt(formStore.userId));
      }
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (isCreateForm) {
        await fetchCliente("/stores", { method: "POST", body: formData });
        addToast({ message: "Tienda creada correctamente", type: "success" });
      } else {
        await fetchCliente(`/stores/${formStore.id}`, {
          method: "PUT",
          body: formData,
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
        <PageHeader
          icon={MdStorefront}
          title="Tiendas"
          subtitle={
            <>
              Gestiona las tiendas registradas en la plataforma
              {meta.total > 0 && (
                <span className="text-on-surface-variant">
                  {" "}
                  · {meta.total} en total
                </span>
              )}
            </>
          }
          action={{ label: "Nueva tienda", onClick: openCreate, icon: MdAdd }}
        />

        {/* Filtros (aplican sobre la página cargada) */}
        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <MdOutlineFilterAlt className="text-base" />
            <span className="text-label-sm uppercase tracking-wide font-semibold">
              Filtros
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="form-control sm:col-span-2">
              <span className="text-label-sm text-on-surface-variant mb-1">
                Buscar
              </span>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Nombre, dirección o teléfono"
              />
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
        </Card>

        {/* Estado vacío / carga */}
        {loading ? (
          <Card overflowHidden bodyClassName="p-0">
            <SkeletonList rows={4} />
          </Card>
        ) : filteredStores.length === 0 ? (
          <Card overflowHidden bodyClassName="p-0">
            <EmptyState
              icon={MdStorefront}
              title={hasFilters ? "Sin resultados" : "Aún no hay tiendas"}
              message={
                hasFilters
                  ? "No encontramos tiendas con esos filtros en esta página. Intenta limpiarlos o cambiar de página."
                  : "Registra la primera tienda para comenzar."
              }
              action={
                !hasFilters
                  ? { label: "Registrar tienda", onClick: openCreate, icon: MdAdd }
                  : undefined
              }
            />
          </Card>
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
                        <Avatar
                          text={s.name}
                          photo={s.photo}
                          buildPhotoUrl={getPhotoUrl}
                          icon={MdOutlineStorefront}
                          size="w-12 h-12"
                        />
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
                        <IconButton
                          icon={MdVisibility}
                          onClick={() => openDetail(s.id)}
                          label="Ver detalle"
                          tone="secondary"
                          showTooltip={false}
                        />
                        <IconButton
                          icon={MdEdit}
                          onClick={() => openEdit(s)}
                          label="Editar"
                          tone="secondary"
                          showTooltip={false}
                        />
                        {s.status === "Inactive" ? (
                          <IconButton
                            icon={MdOutlineRestore}
                            onClick={() => setRestoreTarget(s)}
                            label="Restaurar"
                            tone="primary"
                            showTooltip={false}
                          />
                        ) : (
                          <IconButton
                            icon={MdOutlineDeleteOutline}
                            onClick={() => setDeleteTarget(s)}
                            label="Eliminar"
                            tone="error"
                            showTooltip={false}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <span className="text-body-sm text-on-surface-variant">
                        {categoryName(s.storeCategoryId)}
                      </span>
                      <StatusBadge
                        label={STATUS_LABEL[s.status] ?? s.status}
                        tone={STATUS_TONE[s.status] ?? "pending"}
                      />
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
                            <Avatar
                              text={s.name}
                              photo={s.photo}
                              buildPhotoUrl={getPhotoUrl}
                              icon={MdOutlineStorefront}
                              size="w-10 h-10"
                            />
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
                          <StatusBadge
                            label={STATUS_LABEL[s.status] ?? s.status}
                            tone={STATUS_TONE[s.status] ?? "pending"}
                          />
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={MdVisibility}
                              onClick={() => openDetail(s.id)}
                              label="Ver detalle"
                              tone="secondary"
                            />
                            <IconButton
                              icon={MdEdit}
                              onClick={() => openEdit(s)}
                              label="Editar"
                              tone="secondary"
                            />
                            {s.status === "Inactive" ? (
                              <IconButton
                                icon={MdOutlineRestore}
                                onClick={() => setRestoreTarget(s)}
                                label="Restaurar"
                                tone="primary"
                              />
                            ) : (
                              <IconButton
                                icon={MdOutlineDeleteOutline}
                                onClick={() => setDeleteTarget(s)}
                                label="Eliminar"
                                tone="error"
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
        <Paginacion
          meta={meta}
          onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
          itemLabel="tiendas"
        />
      </div>

      {/* Modal detalle de tienda */}
      {detailStore && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl max-w-2xl p-0 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
            {/* Hero: foto de portada con overlay, o header de color si no hay foto (fijo, no scrollea) */}
            <div className="relative w-full h-40 sm:h-56 bg-gradient-to-br from-primary to-primary-container shrink-0">
              {!detailLoading && detailPhotoUrl && (
                <>
                  <img
                    src={detailPhotoUrl}
                    alt={detailStore.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </>
              )}

              {!detailLoading && !detailPhotoUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <MdStorefront className="text-6xl text-on-primary/25" />
                </div>
              )}

              <button
                onClick={() => setDetailStore(null)}
                className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3 bg-black/25 hover:bg-black/40 text-white border-none backdrop-blur-sm"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>

              {!detailLoading && (
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="mb-1.5">
                    <StatusBadge
                      label={STATUS_LABEL[detailStore.status] ?? detailStore.status}
                      tone={STATUS_TONE[detailStore.status] ?? "pending"}
                    />
                  </div>
                  <h3
                    className={`font-bold text-title-lg leading-tight truncate ${
                      detailPhotoUrl ? "text-white" : "text-on-primary"
                    }`}
                  >
                    {detailStore.name}
                  </h3>
                  <p
                    className={`text-body-sm mt-0.5 truncate ${
                      detailPhotoUrl ? "text-white/85" : "text-on-primary/80"
                    }`}
                  >
                    {detailStore.address}
                  </p>
                </div>
              )}

              {detailLoading && (
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="skeleton h-3 w-20 rounded-full bg-white/20 mb-2" />
                  <div className="skeleton h-5 w-40 rounded-full bg-white/20" />
                </div>
              )}
            </div>

            {/* Contenido: scrollea de forma independiente del hero y del footer */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
              {detailLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-4 w-2/3 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                      <MdCategory className="text-lg text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-label-sm text-on-surface-variant">
                          Categoría
                        </p>
                        <p className="text-body-sm font-medium text-on-surface mt-0.5 truncate">
                          {detailStore.storeCategory?.name ??
                            categoryName(detailStore.storeCategoryId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                      <MdOutlineStorefront className="text-lg text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-label-sm text-on-surface-variant">
                          Propietario
                        </p>
                        <p className="text-body-sm font-medium text-on-surface mt-0.5 truncate">
                          {ownerLabel(detailStore.userId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 col-span-2 sm:col-span-1">
                      <MdPhone className="text-lg text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-label-sm text-on-surface-variant">
                          Teléfono
                        </p>
                        <p className="text-body-sm font-medium text-on-surface mt-0.5 truncate">
                          {detailStore.phone || "—"}
                        </p>
                      </div>
                    </div>
                    {detailStore.neighborhood && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 col-span-2 sm:col-span-1">
                        <MdLocationCity className="text-lg text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-label-sm text-on-surface-variant">
                            Barrio
                          </p>
                          <p className="text-body-sm font-medium text-on-surface mt-0.5 truncate">
                            {detailStore.neighborhood}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {detailStore.description && (
                    <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <MdOutlineDescription className="text-base" />
                        Descripción
                      </p>
                      <p className="text-body-sm text-on-surface leading-relaxed">
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
                                {detailPhotoUrl && (
                                  <img
                                    src={detailPhotoUrl}
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
            </div>

            {/* Footer de acciones: fijo, siempre visible */}
            <div className="modal-action gap-2 flex-col-reverse sm:flex-row m-0 px-4 sm:px-6 py-3.5 border-t border-outline-variant/60 bg-surface-container-lowest shrink-0">
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

                {isCreateForm && (
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
                )}
              </div>

              {/* Foto del establecimiento: subida de archivo */}
              <Field label="Foto del establecimiento">
                <div className="relative rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center bg-surface-container-lowest min-h-32 overflow-hidden">
                  {previewUrl && !photoError ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="min-h-32 w-full object-cover"
                        onError={() => setPhotoError(true)}
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="btn btn-circle btn-sm absolute top-2 right-2 bg-surface/90 hover:bg-error hover:text-on-error border-none shadow-sm"
                        aria-label="Quitar imagen"
                      >
                        <MdClose className="text-base" />
                      </button>
                    </>
                  ) : previewUrl && photoError ? (
                    <div className="flex flex-col items-center gap-2 text-error p-6">
                      <MdBrokenImage className="text-2xl" />
                      <p className="font-label-sm text-label-sm">
                        No se pudo cargar la imagen
                      </p>
                    </div>
                  ) : (
                    <label
                      htmlFor="admin-store-photo-upload"
                      className="flex flex-col items-center p-6 cursor-pointer w-full h-full"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mb-2">
                        <MdAddAPhoto className="text-primary text-2xl" />
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Haz clic para subir una imagen
                      </p>
                    </label>
                  )}
                  <input
                    id="admin-store-photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                {previewUrl && (
                  <label
                    htmlFor="admin-store-photo-upload"
                    className="btn btn-sm btn-outline w-full rounded-full cursor-pointer mt-2"
                  >
                    Cambiar imagen
                  </label>
                )}
              </Field>

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
      <ConfirmModal
        open={!!deleteTarget}
        icon={IoCloseCircle}
        tone="error"
        title={`¿Eliminar la tienda "${deleteTarget?.name}"?`}
        message="La tienda quedará marcada como inactiva y dejará de ser visible en el catálogo público. Puedes restaurarla en cualquier momento."
        confirmLabel="Eliminar"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal confirmación restaurar */}
      <ConfirmModal
        open={!!restoreTarget}
        icon={MdOutlineRestore}
        tone="primary"
        title={`¿Restaurar la tienda "${restoreTarget?.name}"?`}
        message="La tienda volverá a estar activa y visible en el catálogo público."
        confirmLabel="Restaurar"
        loading={actionLoading}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AdminTiendas;
