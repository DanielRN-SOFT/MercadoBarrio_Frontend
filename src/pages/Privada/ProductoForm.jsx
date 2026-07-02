import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdAddAPhoto,
  MdOutlineInfo,
  MdCheckCircle,
  MdSave,
  MdBrokenImage,
  MdOutlineImage,
  MdClose,
} from "react-icons/md";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";

const INITIAL_FORM = {
  name: "",
  price: "",
  currentStock: "",
  productCategoryId: "",
  unitOfMeasureId: "",
  lowStockThreshold: "5",
  description: "",
  referenceCode: "",
  photo: "",
};

const DESCRIPTION_MAX = 300;

const ProductoForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            photo: p.photo ?? "",
          });
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
    if (name === "photo") setPhotoError(false);
    if (name === "description" && value.length > DESCRIPTION_MAX) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        currentStock: parseInt(form.currentStock),
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
        productCategoryId: parseInt(form.productCategoryId),
        unitOfMeasureId: parseInt(form.unitOfMeasureId),
      };

      if (isEditing) {
        const { currentStock, ...bodyWithoutStock } = body;
        await fetchCliente(`/products/${id}`, {
          method: "PUT",
          body: bodyWithoutStock,
        });
        addToast({
          message: "Producto actualizado correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/products", { method: "POST", body });
        addToast({ message: "Producto creado correctamente", type: "success" });
        setTimeout(() => navigate("/panel/productos"), 1200);
      }
    } catch (err) {
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
            <span className="font-label-sm text-label-sm hover:underline">
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
            <div className="card bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm">
              <div className="card-body gap-5 p-4 sm:p-6">
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
              </div>
            </div>
          </div>

          {/* Columna derecha: imagen, specs y acciones */}
          <div className="lg:col-span-5">
            <div className="card bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm lg:sticky lg:top-4">
              <div className="card-body p-4 sm:p-6 gap-5 flex flex-col h-full">
                <Label label="Imagen del producto" />

                {/* Zona de imagen / vista previa */}
                <div className="relative rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center bg-surface-container-lowest min-h-40 overflow-hidden">
                  {form.photo && !photoError ? (
                    <>
                      <img
                        src={form.photo}
                        alt="Vista previa"
                        className="min-h-40 object-cover"
                        onError={() => setPhotoError(true)}
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, photo: "" })}
                        className="btn btn-circle btn-sm absolute top-2 right-2 bg-surface/90 hover:bg-error hover:text-on-error border-none shadow-sm"
                        aria-label="Quitar imagen"
                      >
                        <MdClose className="text-base" />
                      </button>
                    </>
                  ) : form.photo && photoError ? (
                    <div className="flex flex-col items-center gap-2 text-error p-8">
                      <MdBrokenImage className="text-3xl" />
                      <p className="font-label-md text-label-md">
                        No se pudo cargar la imagen
                      </p>
                      <p className="font-label-sm text-label-sm opacity-80">
                        Verifica que el enlace sea correcto
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-8">
                      <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4">
                        <MdAddAPhoto className="text-primary text-3xl" />
                      </div>
                      <p className="font-label-md text-label-md text-on-surface mb-1">
                        Aún no hay imagen
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Pega el enlace de la imagen abajo
                      </p>
                    </div>
                  )}
                </div>

                {/* Input URL — mismo estilo de Input/Label del proyecto */}
                <div className="form-control w-full">
                  <Label label="URL de la imagen (opcional)" />
                  <Input
                    name="photo"
                    value={form.photo}
                    onChange={handleChange}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

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
                        Usa un enlace directo (https) en formato JPG, PNG o
                        WEBP.
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
                    className="btn btn-ghost w-full rounded-full font-label-md text-label-md h-12 text-secondary"
                  >
                    Cancelar y salir
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

export default ProductoForm;
