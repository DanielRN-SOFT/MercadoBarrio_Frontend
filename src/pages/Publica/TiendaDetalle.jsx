import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoStorefrontSharp, IoArrowBackSharp } from "react-icons/io5";
import { MdLocationCity, MdAccessTime } from "react-icons/md";
import fetchCliente from "../../config/fetchCliente";

const diasOrden = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const diasNombres = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo",
};

const formatHora = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const TiendaDetalle = () => {
  const { id } = useParams();
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("");

  useEffect(() => {
    fetchCliente(`/stores/public/${id}`)
      .then((res) => {
        setTienda(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading) {
    return (
      <main className="pt-16 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
        <div className="mt-8 space-y-4">
          <div className="skeleton h-64 w-full rounded-2xl" />
          <div className="skeleton h-8 w-1/3" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      </main>
    );
  }

  if (!tienda) {
    return (
      <main className="pt-16 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
        <div className="mt-8 text-center">
          <p className="text-on-surface/60">Tienda no encontrada.</p>
          <Link to="/tiendas" className="btn btn-primary mt-4">
            Volver
          </Link>
        </div>
      </main>
    );
  }

  const horarios = [...(tienda.schedules || [])]
    .filter((s) => s.status === "Active")
    .sort(
      (a, b) => diasOrden.indexOf(a.weekDay) - diasOrden.indexOf(b.weekDay),
    );

  const categorias = [
    "",
    ...new Set(tienda.products.map((p) => p.productCategory.name)),
  ];
  const productosFiltrados = categoriaActiva
    ? tienda.products.filter((p) => p.productCategory.name === categoriaActiva)
    : tienda.products;

  return (
    <main className="pt-16 mb-24 md:mb-12">
      {/* Hero */}
      <div className="relative h-56 md:h-72 bg-base-200 overflow-hidden">
        {tienda.photo ? (
          <img
            src={tienda.photo}
            alt={tienda.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoStorefrontSharp className="text-8xl text-base-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <Link
          to="/tiendas"
          className="absolute top-4 left-4 btn btn-sm btn-ghost text-white gap-1"
        >
          <IoArrowBackSharp />
          Volver
        </Link>
        {tienda.status === "Active" && (
          <span className="absolute top-4 right-4 badge badge-success text-white font-bold uppercase tracking-wider">
            Abierto
          </span>
        )}
      </div>

      <div className="px-margin-mobile md:px-margin-desktop mt-6 space-y-8">
        {/* Info principal */}
        <div className="flex gap-4 items-start">
          {tienda.logo && (
            <div className="w-16 h-16 rounded-xl border-2 border-base-300 overflow-hidden shrink-0 bg-base-100">
              <img
                src={tienda.logo}
                alt={`Logo ${tienda.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-on-surface">
                {tienda.name}
              </h1>
              {tienda.storeCategory && (
                <span className="badge badge-primary badge-outline">
                  {tienda.storeCategory.name}
                </span>
              )}
            </div>
            {tienda.description && (
              <p className="text-on-surface/60 text-sm mt-1">
                {tienda.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-3">
              {tienda.neighborhood && (
                <div className="flex items-center gap-1 text-sm text-on-surface/60">
                  <MdLocationCity className="text-primary" />
                  {tienda.neighborhood}
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-on-surface/60">
                <FaLocationDot className="text-primary" />
                {tienda.address}
              </div>
              {tienda.phone && (
                <div className="flex items-center gap-1 text-sm text-on-surface/60">
                  <FaPhone className="text-primary" />
                  {tienda.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horarios */}
        {horarios.length > 0 && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <h2 className="card-title text-base flex items-center gap-2">
                <MdAccessTime className="text-primary" />
                Horarios de atención
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {horarios.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-col bg-base-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-primary">
                      {diasNombres[h.weekDay]}
                    </span>
                    <span className="text-xs text-on-surface/70">
                      {formatHora(h.startTime)} – {formatHora(h.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        {tienda.products.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Productos disponibles
            </h2>

            {/* Filtro por categoría */}
            {categorias.length > 1 && (
              <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-2 mb-4">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    className={`px-4 py-1.5 rounded-full border whitespace-nowrap text-sm transition-all cursor-pointer ${
                      categoriaActiva === cat
                        ? "border-primary bg-primary text-white"
                        : "border-base-300 text-on-surface/60 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat === "" ? "Todos" : cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className="card bg-base-100 border border-base-300 hover:shadow-sm transition-shadow"
                >
                  <div className="h-32 bg-base-200 overflow-hidden">
                    {producto.photo ? (
                      <img
                        src={producto.photo}
                        alt={producto.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoStorefrontSharp className="text-4xl text-base-300" />
                      </div>
                    )}
                  </div>
                  <div className="card-body p-3 gap-1">
                    <h4 className="font-semibold text-sm text-on-surface leading-tight">
                      {producto.name}
                    </h4>
                    <span className="badge badge-ghost badge-sm">
                      {producto.productCategory.name}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-primary font-bold text-sm">
                        ${Number(producto.price).toLocaleString("es-CO")}
                        <span className="text-on-surface/40 font-normal text-xs">
                          {" "}
                          / {producto.unitOfMeasure.name}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`badge badge-sm ${producto.currentStock <= producto.lowStockThreshold ? "badge-warning" : "badge-success"}`}
                      >
                        {producto.currentStock <= producto.lowStockThreshold
                          ? "Poco stock"
                          : `${producto.currentStock} en stock`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tienda.products.length === 0 && (
          <div className="text-center py-12 text-on-surface/40">
            <IoStorefrontSharp className="text-6xl mx-auto mb-3" />
            <p>Esta tienda aún no tiene productos registrados.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TiendaDetalle;
