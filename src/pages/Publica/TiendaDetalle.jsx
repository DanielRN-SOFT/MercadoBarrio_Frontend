import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoStorefrontSharp, IoArrowBackSharp } from "react-icons/io5";
import { MdLocationCity, MdAccessTime } from "react-icons/md";
import fetchCliente from "../../config/fetchCliente";
import Hero from "../../components/publica/Tiendas/Show/Hero";
import InfoPrincipal from "../../components/publica/Tiendas/Show/InfoPrincipal";
import Horarios from "../../components/publica/Tiendas/Show/Horarios";
import Productos from "../../components/publica/Tiendas/Show/Productos";
import ButtonCategorias from "../../components/publica/Tiendas/Show/ButtonCategorias";

const diasOrden = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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
      <Hero tienda={tienda} />

      <div className="px-margin-mobile md:px-margin-desktop mt-6 space-y-8">
        {/* Info principal */}
        <InfoPrincipal tienda={tienda} />

        {/* Horarios */}
        {horarios.length > 0 && <Horarios horarios={horarios} />}

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
                  <ButtonCategorias
                    cat={cat}
                    categoriaActiva={categoriaActiva}
                    setCategoriaActiva={setCategoriaActiva}
                    key={cat.id}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map((producto) => (
                <Productos key={producto.id} producto={producto} />
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
