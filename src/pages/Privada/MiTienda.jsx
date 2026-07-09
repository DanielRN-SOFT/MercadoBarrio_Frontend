import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix del ícono por defecto de Leaflet con bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MdStorefront,
  MdInfoOutline,
  MdCategory,
  MdLocationOn,
  MdLocationCity,
  MdPhone,
  MdAddAPhoto,
  MdBrokenImage,
  MdClose,
  MdSave,
  MdCheckCircle,
  MdOutlineDescription,
  MdMyLocation,
} from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";

const DESCRIPTION_MAX = 300;

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

const MiTienda = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasStore, setHasStore] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [locating, setLocating] = useState(false);

  // Foto: mismo patrón que ProductoForm (archivo + preview + error de carga)
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    neighborhood: "",
    longitude: "",
    latitude: "",
    description: "",
    phone: "",
    storeCategoryId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, catRes] = await Promise.all([
          fetchCliente("/stores/me").catch(() => null),
          fetchCliente("/store-categories"),
        ]);

        setCategorias(catRes?.data ?? []);

        if (storeRes?.data) {
          setHasStore(true);
          const s = storeRes.data;
          setForm({
            name: s.name ?? "",
            address: s.address ?? "",
            neighborhood: s.neighborhood ?? "",
            longitude: s.longitude ?? "",
            latitude: s.latitude ?? "",
            description: s.description ?? "",
            phone: s.phone ?? "",
            storeCategoryId: s.storeCategoryId ?? "",
          });
          if (s.photo) {
            setPreviewUrl(`${import.meta.env.VITE_BACKEND_URL}${s.photo}`);
          }
        }
      } catch (error) {
        addToast({ message: "Error al cargar los datos", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "description" && value.length > DESCRIPTION_MAX) return;
    setForm({ ...form, [name]: value });
  };

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

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      addToast({
        message: "Tu navegador no soporta geolocalización",
        type: "error",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        addToast({ message: "Ubicación capturada", type: "success" });
        setLocating(false);
      },
      () => {
        addToast({ message: "No se pudo obtener tu ubicación", type: "error" });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const latNum = parseFloat(form.latitude);
  const lngNum = parseFloat(form.longitude);
  const hasValidCoords =
    form.latitude !== "" &&
    form.longitude !== "" &&
    !isNaN(latNum) &&
    !isNaN(lngNum);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("neighborhood", form.neighborhood);
      formData.append("longitude", parseFloat(form.longitude) || 0);
      formData.append("latitude", parseFloat(form.latitude) || 0);
      formData.append("description", form.description);
      formData.append("phone", form.phone);
      formData.append("storeCategoryId", parseInt(form.storeCategoryId));
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (hasStore) {
        await fetchCliente("/stores/me", { method: "PUT", body: formData });
        addToast({
          message: "Tienda actualizada correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/stores/me", { method: "POST", body: formData });
        setHasStore(true);
        addToast({
          message: "Tienda registrada. Está pendiente de aprobación.",
          type: "success",
        });
      }
    } catch (error) {
      addToast({ message: error.message ?? "Error al guardar", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-body-sm text-secondary">Cargando información...</p>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-4 lg:px-0 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdStorefront className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                {hasStore ? "Mi Tienda" : "Registra tu Tienda"}
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                {hasStore
                  ? "Actualiza la información de tu establecimiento."
                  : "Completa el perfil de tu negocio para aparecer en el directorio."}
              </p>
            </div>
          </div>

          {hasStore && (
            <span className="inline-flex items-center gap-1.5 badge badge-lg border-none font-medium bg-primary-fixed text-on-primary-fixed-variant self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Tienda registrada
            </span>
          )}
        </div>

        {/* Alerta pendiente de aprobación */}
        {!hasStore && (
          <div className="alert bg-primary-container text-on-primary-container border-none rounded-2xl mb-6 items-start sm:items-center">
            <MdInfoOutline className="text-xl shrink-0" />
            <span className="text-label-md">
              Una vez registrada, tu tienda quedará pendiente de aprobación por
              el administrador.
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6"
        >
          {/* Columna izquierda: campos del formulario */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Información principal */}
            <div className="card bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm">
              <div className="card-body gap-5 p-4 sm:p-6">
                <h2 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                  <MdCategory className="text-base text-secondary" />
                  Información principal
                </h2>

                <div className="form-control w-full">
                  <Label label="Nombre del establecimiento *" />
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ej: Tienda Don Carlos"
                    type="text"
                  />
                </div>

                <div className="form-control w-full">
                  <Label label="Categoría de tienda *" />
                  <select
                    name="storeCategoryId"
                    value={form.storeCategoryId}
                    onChange={handleChange}
                    className="select select-bordered border-outline-variant bg-surface focus:border-primary w-full font-body-md text-body-md rounded-full"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="card bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm">
              <div className="card-body gap-5 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                    <MdLocationOn className="text-base text-secondary" />
                    Ubicación
                  </h2>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="btn btn-ghost btn-xs gap-1.5 text-primary font-label-sm rounded-full disabled:text-primary/60"
                  >
                    {locating ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <MdMyLocation className="text-sm" />
                    )}
                    {locating ? "Ubicando..." : "Usar mi ubicación"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <Label label="Dirección *" />
                    <Input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Ej: Calle 10 # 5-23"
                      type="text"
                    />
                  </div>
                  <div className="form-control w-full">
                    <Label label="Barrio *" />
                    <Input
                      name="neighborhood"
                      value={form.neighborhood}
                      onChange={handleChange}
                      placeholder="Ej: Centro"
                      type="text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <Label label="Latitud" />
                    <Input
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="Ej: 4.7459"
                      type="number"
                    />
                  </div>
                  <div className="form-control w-full">
                    <Label label="Longitud" />
                    <Input
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="Ej: -75.9124"
                      type="number"
                    />
                  </div>
                </div>

                {/* Vista previa en el mapa */}
                <div className="form-control w-full">
                  <Label label="Vista previa en el mapa" />
                  {hasValidCoords ? (
                    <div className="rounded-2xl overflow-hidden border border-outline-variant h-48 sm:h-72 w-full z-0">
                      <MapContainer
                        center={[latNum, lngNum]}
                        zoom={16}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        <RecenterMap lat={latNum} lng={lngNum} />
                        <Marker position={[latNum, lngNum]} icon={defaultIcon}>
                          <Popup minWidth={200} maxWidth={240}>
                            <div className="flex flex-col gap-1 p-1">
                              {previewUrl && !photoError && (
                                <img
                                  src={previewUrl}
                                  alt={form.name || "Tienda"}
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                              )}
                              <span className="font-semibold leading-tight text-sm">
                                {form.name || "Tu tienda"}
                              </span>
                              {(form.address || form.neighborhood) && (
                                <div className="text-xs m-0 text-on-surface/60 leading-snug">
                                  {form.neighborhood && (
                                    <p>
                                      <MdLocationCity className="text-primary inline" />{" "}
                                      {form.neighborhood}
                                    </p>
                                  )}
                                  {form.address && (
                                    <p>
                                      <FaLocationDot className="text-primary inline m-0" />{" "}
                                      {form.address}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-outline-variant h-48 sm:h-56 w-full flex items-center justify-center text-center px-6 bg-surface-container-lowest">
                      <p className="text-label-sm text-on-surface-variant">
                        Ingresa latitud y longitud (o usa tu ubicación) para ver
                        el mapa.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contacto y descripción */}
            <div className="card bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm">
              <div className="card-body gap-5 p-4 sm:p-6">
                <h2 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                  <MdPhone className="text-base text-secondary" />
                  Contacto
                </h2>

                <div className="form-control w-full sm:w-1/2">
                  <Label label="Teléfono de contacto" />
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Ej: 3101234567"
                    type="tel"
                  />
                </div>

                <div className="form-control w-full">
                  <div className="flex justify-between items-end mb-1">
                    <Label label="Descripción (opcional)" className="mb-0" />
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {form.description.length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="Cuéntales a tus clientes qué ofrece tu tienda..."
                    className="textarea textarea-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-2xl resize-none h-28"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: foto, tips y acciones */}
          <div className="lg:col-span-5">
            <div className="card bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm lg:sticky lg:top-4">
              <div className="card-body p-4 sm:p-6 gap-5 flex flex-col h-full">
                <Label label="Foto del establecimiento" />

                {/* Zona de imagen / vista previa — mismo patrón que ProductoForm */}
                <div className="relative rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center bg-surface-container-lowest min-h-40 overflow-hidden">
                  {previewUrl && !photoError ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="min-h-40 w-full object-cover"
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
                    <div className="flex flex-col items-center gap-2 text-error p-8">
                      <MdBrokenImage className="text-3xl" />
                      <p className="font-label-md text-label-md">
                        No se pudo cargar la imagen
                      </p>
                    </div>
                  ) : (
                    <label
                      htmlFor="store-photo-upload"
                      className="flex flex-col items-center p-8 cursor-pointer w-full h-full"
                    >
                      <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4">
                        <MdAddAPhoto className="text-primary text-3xl" />
                      </div>
                      <p className="font-label-md text-label-md text-on-surface mb-1">
                        Aún no hay imagen
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Haz clic para subir una imagen
                      </p>
                    </label>
                  )}
                  <input
                    id="store-photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                {previewUrl && (
                  <label
                    htmlFor="store-photo-upload"
                    className="btn btn-sm btn-outline w-full rounded-full cursor-pointer"
                  >
                    Cambiar imagen
                  </label>
                )}

                {/* Recomendaciones */}
                <div className="space-y-3">
                  <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                    <MdOutlineDescription className="text-base text-secondary" />
                    Recomendaciones
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5">
                      <MdCheckCircle className="text-primary text-sm mt-0.5 shrink-0" />
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Usa una foto clara de la fachada o el mostrador de tu
                        tienda.
                      </p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <MdCheckCircle className="text-primary text-sm mt-0.5 shrink-0" />
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Verifica que la dirección y el barrio sean correctos
                        para el directorio.
                      </p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <MdCheckCircle className="text-primary text-sm mt-0.5 shrink-0" />
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Formatos permitidos: JPG, PNG o WEBP (máx. 5MB).
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Acción */}
                <div className="mt-auto pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn bg-primary text-on-primary border-none w-full rounded-full font-label-md text-label-md h-12 hover:bg-primary-container shadow-sm shadow-primary/25 gap-2"
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <>
                        <MdSave className="text-lg" />
                        {hasStore ? "Guardar cambios" : "Registrar mi tienda"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default MiTienda;
