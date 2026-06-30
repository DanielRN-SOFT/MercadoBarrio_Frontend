import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, uomRes] = await Promise.all([fetchCliente("/product-categories"), fetchCliente("/unit-measures")]);
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
        await fetchCliente(`/products/${id}`, { method: "PUT", body: bodyWithoutStock });
        addToast({ message: "Producto actualizado correctamente", type: "success" });
      } else {
        await fetchCliente("/products", { method: "POST", body });
        addToast({ message: "Producto creado correctamente", type: "success" });
        setTimeout(() => navigate("/panel/productos"), 1200);
      }
    } catch (err) {
      addToast({ message: err.message ?? "Error al guardar el producto", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/panel/productos")} className="btn btn-ghost btn-circle">
            <MdArrowBack className="text-xl" />
          </button>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">{isEditing ? "Editar producto" : "Nuevo producto"}</h1>
            <p className="text-body-md text-secondary mt-0.5">
              {isEditing ? "Modifica los datos del producto." : "Completa la información para publicar el producto en tu catálogo."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Información principal */}
          <div className="card bg-surface-container-low border border-outline-variant rounded-2xl">
            <div className="card-body gap-5">
              <h2 className="text-title-md font-semibold text-on-surface">Información principal</h2>

              {/* Nombre */}
              <div className="form-control w-full">
                <Label label="Nombre del producto *" />
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Arroz Diana x 500g" type="text" />
              </div>

              {/* Categoría */}
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

              {/* Precio y Unidad de medida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <Label label="Precio *" />
                  <Input name="price" value={form.price} onChange={handleChange} placeholder="Ej: 2500" type="number" />
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
              </div>

              {/* Código de referencia */}
              <div className="form-control w-full">
                <Label label="Código de referencia (opcional)" />
                <Input name="referenceCode" value={form.referenceCode} onChange={handleChange} placeholder="Ej: ARR-001" type="text" />
              </div>

              {/* Descripción */}
              <div className="form-control w-full">
                <Label label="Descripción (opcional)" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe brevemente el producto..."
                  className="textarea textarea-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-2xl resize-none h-24"
                />
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div className="card bg-surface-container-low border border-outline-variant rounded-2xl">
            <div className="card-body gap-5">
              <h2 className="text-title-md font-semibold text-on-surface">Inventario</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <Label label={isEditing ? "Stock actual" : "Stock inicial *"} />
                  <Input
                    name="currentStock"
                    value={form.currentStock}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    type="number"
                    disabled={isEditing}
                  />
                  {isEditing && (
                    <p className="text-label-sm text-secondary mt-1 px-1">
                      El stock se actualiza con tus ventas y movimientos de inventario, no desde aquí.
                    </p>
                  )}
                </div>
                <div className="form-control w-full">
                  <Label label="Alerta de stock bajo" />
                  <Input
                    name="lowStockThreshold"
                    value={form.lowStockThreshold}
                    onChange={handleChange}
                    placeholder="Ej: 5"
                    type="number"
                  />
                  <p className="text-label-sm text-secondary mt-1 px-1">Se mostrará alerta cuando el stock baje de este valor.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Foto */}
          <div className="card bg-surface-container-low border border-outline-variant rounded-2xl">
            <div className="card-body gap-5">
              <h2 className="text-title-md font-semibold text-on-surface">Foto del producto</h2>

              <div className="form-control w-full">
                <Label label="URL de la imagen (opcional)" />
                <Input name="photo" value={form.photo} onChange={handleChange} placeholder="https://..." type="url" />
              </div>

              {form.photo && (
                <div className="rounded-xl overflow-hidden h-40 w-full bg-surface-container-high">
                  <img
                    src={form.photo}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/panel/productos")}
              className="btn btn-ghost flex-1 rounded-full font-label-md text-label-md h-12"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn bg-primary text-white border-none flex-1 rounded-full font-label-md text-label-md h-12 hover:brightness-110"
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : isEditing ? "Guardar cambios" : "Publicar producto"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default ProductoForm;
