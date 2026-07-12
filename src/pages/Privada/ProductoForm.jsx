import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdOutlineInfo,
  MdCheckCircle,
  MdSave,
} from "react-icons/md";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Card from "../../components/ui/Card";
import PhotoUpload from "../../components/ui/PhotoUpload";

const INITIAL_FORM = {
  name: "",
  price: "",
  currentStock: "",
  productCategoryId: "",
  unitOfMeasureId: "",
  lowStockThreshold: "5",
  description: "",
  referenceCode: "",
};

const DESCRIPTION_MAX = 300;

const ProductoForm = () => {
  let { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, uomRes] = await Promise.all([
          fetchCliente("/product-categories"),
          fetchCliente("/unit-measures"),
        ]);
        setCategorias(catRes?.data ?? []);
        setUnidades(uomRes?.data ?? []);

        if (isEditing) {
          const prodRes = await fetchCliente(`/products/${id}`);
          const p = prodRes.data;
          setForm({
            name: p.name ?? "",
            price: p.price ?? "",
            currentStock: p.currentStock ?? "",
            productCategoryId: p.productCategoryId ?? "",
            unitOfMeasureId: p.unitOfMeasureId ?? "",
            lowStockThreshold: p.lowStockThreshold ?? "5",
            description: p.description ?? "",
            referenceCode: p.referenceCode ?? "",
          });
          if (p.photo) {
            setPreviewUrl(`${import.meta.env.VITE_BACKEND_URL}${p.photo}`);
          }
        }
      } catch {
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
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", parseFloat(form.price));
      formData.append(
        "lowStockThreshold",
        parseInt(form.lowStockThreshold) || 5,
      );
      formData.append("productCategoryId", parseInt(form.productCategoryId));
      formData.append("unitOfMeasureId", parseInt(form.unitOfMeasureId));
      formData.append("description", form.description);
      formData.append("referenceCode", form.referenceCode);
      if (!isEditing) {
        formData.append("currentStock", parseInt(form.currentStock));
      }
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (isEditing) {
        await fetchCliente(`/products/${id}`, {
          method: "PUT",
          body: formData,
        });
        addToast({
          message: "Producto actualizado correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/products", { method: "POST", body: formData });
        addToast({ message: "Producto creado correctamente", type: "success" });
        setTimeout(() => navigate("/panel/productos"), 1200);
      }
    } catch (err) {
      console.log(err);
      addToast({
        message: err.message ?? "Error al guardar el producto",
        type: "error",
      });
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
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/panel/productos")}
            className="flex items-center gap-2 text-on-surface-variant mb-2 hover:text-primary transition-colors"
          >
            <MdArrowBack className="text-base" />
            <span className="font-label-sm text-label-sm hover:underline cursor-pointer">
              Volver a Productos
            </span>
          </button>
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface">
            {isEditing ? "Editar producto" : "Crear nuevo producto"}
          </h1>
          <p className="text-body-sm sm:text-body-md text-secondary mt-0.5">
            {isEditing
              ? "Modifica los datos del producto."
              : "Completa la información necesaria para publicar tu producto en el catálogo."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6"
        >
          {/* Columna izquierda: campos del formulario */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <Card
              className="bg-surface-container-low"
              bodyClassName="gap-5 p-4 sm:p-6"
            >
              {/* Nombre */}
              <div className="form-control w-full">
                <Label label="Nombre del producto *" />
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Arroz Diana x 500g"
                  type="text"
                />
              </div>

              {/* Categoría + Código de referencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <Label label="Categoría *" />
                  <select
                    name="productCategoryId"
                    value={form.productCategoryId}
                    onChange={handleChange}
                    className="select select-bordered border-outline-variant bg-surface focus:border-primary w-full font-body-md text-body-md rounded-full"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control w-full">
                  <Label label="Código de referencia (opcional)" />
                  <Input
                    name="referenceCode"
                    value={form.referenceCode}
                    onChange={handleChange}
                    placeholder="Ej: ARR-001"
                    type="text"
                  />
                </div>
              </div>

              {/* Precio, Unidad y Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <Label label="Precio *" />
                  <Input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ej: 2500"
                    type="number"
                  />
                </div>
                <div className="form-control w-full">
                  <Label label="Unidad de medida *" />
                  <select
                    name="unitOfMeasureId"
                    value={form.unitOfMeasureId}
                    onChange={handleChange}
                    className="select select-bordered border-outline-variant bg-surface focus:border-primary w-full font-body-md text-body-md rounded-full"
                    required
                  >
                    <option value="">Selecciona unidad</option>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control w-full">
                  <Label
                    label={isEditing ? "Stock actual" : "Stock inicial *"}
                  />
                  <Input
                    name="currentStock"
                    value={form.currentStock}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    type="number"
                    disabled={isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <p className="text-label-sm text-secondary -mt-3 px-1">
                  El stock se actualiza con tus ventas y movimientos de
                  inventario, no desde aquí.
                </p>
              )}

              {/* Alerta de stock bajo */}
              <div className="form-control w-full sm:w-1/2">
                <Label label="Alerta de stock bajo" />
                <Input
                  name="lowStockThreshold"
                  value={form.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  type="number"
                />
                <p className="text-label-sm text-secondary mt-1 px-1">
                  Se mostrará alerta cuando el stock baje de este valor.
                </p>
              </div>

              {/* Descripción */}
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
                  placeholder="Describe brevemente el producto..."
                  className="textarea textarea-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-2xl resize-none h-28"
                />
              </div>
            </Card>
          </div>

          {/* Columna derecha: imagen, specs y acciones */}
          <div className="lg:col-span-5">
            <Card
              className="bg-surface-container-low lg:sticky lg:top-4"
              bodyClassName="p-4 sm:p-6 gap-5 flex flex-col h-full"
            >
              <Label label="Imagen del producto" />

              <PhotoUpload
                id="photo-upload"
                previewUrl={previewUrl}
                error={photoError}
                onError={() => setPhotoError(true)}
                onChange={handlePhotoChange}
                onRemove={handleRemovePhoto}
              />

              {/* Especificaciones recomendadas */}
              <div className="space-y-3">
                <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                  <MdOutlineInfo className="text-base text-secondary" />{" "}
                  Especificaciones recomendadas
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5">
                    <MdCheckCircle className="text-primary text-sm mt-0.5 shrink-0" />
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Resolución mínima de 800x800 píxeles para mayor nitidez.
                    </p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MdCheckCircle className="text-primary text-sm mt-0.5 shrink-0" />
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Fondo claro o neutro para resaltar el producto en el
                      catálogo.
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

              {/* Acciones */}
              <div className="mt-auto pt-4 space-y-3">
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
                      {isEditing ? "Guardar cambios" : "Publicar producto"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/panel/productos")}
                  className="btn btn-secondary w-full rounded-full font-label-md text-label-md h-12 text-on-secondary"
                >
                  Cancelar y salir
                </button>
              </div>
            </Card>
          </div>
        </form>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default ProductoForm;
