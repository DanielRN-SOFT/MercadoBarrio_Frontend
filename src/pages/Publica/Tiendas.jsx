import { useEffect, useState } from "react";
import FilterBar from "../../components/publica/Tiendas/FilterBar";
import fetchCliente from "../../config/fetchCliente";
import CardProducto from "../../components/publica/Tiendas/CardProducto";
import Paginacion from "../../components/publica/Tiendas/Paginacion";

const Tiendas = () => {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({});
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const obtenerStores = async (pagina = 1, filtrosActuales = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filtrosActuales).filter(([, v]) => v !== ""),
        ),
      );
      params.set("page", pagina);

      const response = await fetchCliente(
        `/stores/public?${params.toString()}`,
      );
      setTiendas(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerStores(1, {});
  }, []);

  const handleFilter = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    obtenerStores(1, nuevosFiltros); // al filtrar, siempre volvemos a la página 1
  };

  return (
    <main className="pt-16 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
      <div className="mt-8">
        <FilterBar onFilter={handleFilter} />
      </div>

      <div className="pt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : tiendas.length === 0 ? (
          <div className="text-center py-16 text-base-content/60">
            No se encontraron tiendas con esos filtros.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiendas.map((tienda) => (
                <CardProducto key={tienda.id} tienda={tienda} />
              ))}
            </div>

            {meta.totalPages > 1 && (
              <Paginacion meta={meta} obtenerStores={obtenerStores} filtros={filtros} />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Tiendas;
