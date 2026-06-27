import { useEffect, useState } from "react";
import FilterBar from "../../components/publica/Tiendas/FilterBar";
import fetchCliente from "../../config/fetchCliente";
import CardProducto from "../../components/publica/Tiendas/CardProducto";

const Tiendas = () => {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerStores = async () => {
      try {
        const response = await fetchCliente("/stores/public");
        setTiendas(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    obtenerStores();
  }, []);

  const handleFilter = (nuevosFiltros) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(nuevosFiltros).filter(([, v]) => v !== ""),
      ),
    ).toString();
    fetchCliente(`/stores/public?${params}`)
      .then((res) => setTiendas(res.data))
      .catch(console.error);
  };

  return (
    <main className="pt-16 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
      <div className="mt-8">
        <FilterBar onFilter={handleFilter} />
      </div>

      <div className="pt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiendas.map((tienda) => (
              <CardProducto key={tienda.id} tienda={tienda} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Tiendas;
