import { useState, useEffect } from "react";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";

const MiTienda = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasStore, setHasStore] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    neighborhood: "",
    longitude: "",
    latitude: "",
    description: "",
    phone: "",
    photo: "",
    storeCategoryId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, catRes] = await Promise.all([fetchCliente("/stores/me").catch(() => null), fetchCliente("/store-categories")]);

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
            photo: s.photo ?? "",
            storeCategoryId: s.storeCategoryId ?? "",
          });
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        storeCategoryId: parseInt(form.storeCategoryId),
        longitude: parseFloat(form.longitude) || 0,
        latitude: parseFloat(form.latitude) || 0,
      };

      if (hasStore) {
        await fetchCliente("/stores/me", { method: "PUT", body });
        addToast({ message: "Tienda actualizada correctamente", type: "success" });
      } else {
        await fetchCliente("/stores/me", { method: "POST", body });
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
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{hasStore ? "Mi Tienda" : "Registra tu Tienda"}</h1>
          <p className="text-body-md text-secondary mt-1">
            {hasStore
              ? "Actualiza la información de tu establecimiento."
              : "Completa el perfil de tu negocio para aparecer en el directorio."}
          </p>
        </div>

        {/* Badge estado */}
        {!hasStore && (
          <div className="alert bg-primary-container text-on-primary-container border-none">
            <span className="material-symbols-outlined text-xl">info</span>
            <span className="text-label-md">Una vez registrada, tu tienda quedará pendiente de aprobación por el administrador.</span>
          </div>
        )}

        {/* Formulario */}
        <div className="card bg-surface-container-low border border-outline-variant rounded-2xl">
          <div className="card-body gap-5">
            <h2 className="text-title-md font-semibold text-on-surface">Información principal</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div className="form-control w-full">
                <Label label="Nombre del establecimiento *" />
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Tienda Don Carlos" type="text" />
              </div>

              {/* Categoría */}
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

              {/* Dirección y Barrio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <Label label="Dirección *" />
                  <Input name="address" value={form.address} onChange={handleChange} placeholder="Ej: Calle 10 # 5-23" type="text" />
                </div>
                <div className="form-control w-full">
                  <Label label="Barrio *" />
                  <Input name="neighborhood" value={form.neighborhood} onChange={handleChange} placeholder="Ej: Centro" type="text" />
                </div>
              </div>

              {/* Coordenadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <Label label="Latitud" />
                  <Input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Ej: 4.7459" type="number" />
                </div>
                <div className="form-control w-full">
                  <Label label="Longitud" />
                  <Input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Ej: -75.9124" type="number" />
                </div>
              </div>

              {/* Teléfono */}
              <div className="form-control w-full">
                <Label label="Teléfono de contacto" />
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Ej: 3101234567" type="tel" />
              </div>

              {/* Foto URL */}
              <div className="form-control w-full">
                <Label label="URL de foto del establecimiento" />
                <Input name="photo" value={form.photo} onChange={handleChange} placeholder="https://..." type="url" />
                {form.photo && (
                  <div className="mt-2 rounded-xl overflow-hidden h-36 w-full">
                    <img
                      src={form.photo}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="form-control w-full">
                <Label label="Descripción (opcional)" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Cuéntales a tus clientes qué ofrece tu tienda..."
                  className="textarea textarea-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-2xl resize-none h-28"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full bg-primary-container text-on-primary hover:bg-primary border-none font-label-md text-label-md h-12 rounded-full"
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : hasStore ? (
                  "Guardar cambios"
                ) : (
                  "Registrar mi tienda"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default MiTienda;
