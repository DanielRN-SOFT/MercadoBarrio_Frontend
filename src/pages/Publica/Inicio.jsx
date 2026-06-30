import { useEffect, useState } from "react";
import CardProducto from "../../components/publica/Tiendas/CardProducto";
import HeroSection from "../../components/publica/Inicio/HeroSection";
import ComoFunciona from "../../components/publica/Inicio/ComoFunciona";
import PorQueMercadoBarrio from "../../components/publica/Inicio/PorQueMercadoBarrio";
import CTATenderos from "../../components/publica/Inicio/CTATenderos";
import fetchCliente from "../../config/fetchCliente";

const Inicio = () => {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerStores = async () => {
      try {
        const response = await fetchCliente("/stores/public");
        setTiendas(response.data.slice(0, 3));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    obtenerStores();
  }, []);

  return (
    <main className="pt-16 mx-auto">
      <section className="bg-primary-container text-on-primary">
        <HeroSection />
      </section>

      <ComoFunciona />

      <PorQueMercadoBarrio />

      <section className="mt-8 px-margin-mobile md:px-margin-desktop mb-8">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Nuestras últimas tiendas agregadas
          </h3>
          <button className="text-primary cursor-pointer font-label-md text-label-md hover:underline">
            Ver mapa
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-base-100 border border-base-300">
                <div className="h-32 skeleton" />
                <div className="card-body gap-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiendas.map((tienda) => (
              <CardProducto key={tienda.id} tienda={tienda} />
            ))}
          </div>
        )}
      </section>

      <CTATenderos />
    </main>
  );
};

export default Inicio;
