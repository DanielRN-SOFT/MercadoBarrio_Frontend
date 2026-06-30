import { useState, useRef, useEffect } from "react";
import { IoSearchSharp, IoCloseSharp, IoStorefrontSharp } from "react-icons/io5";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdLocationCity } from "react-icons/md";
import { Link } from "react-router-dom";
import fetchCliente from "../../config/fetchCliente";

const BuscarProducto = () => {
  const [query, setQuery] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchCliente("/product-categories/public/search")
      .then((res) => setCategorias(res?.data ?? []))
      .catch(() => {});
  }, []);

  const buscar = async (valor, categoriaId) => {
    setLoading(true);
    setBuscado(true);
    try {
      const params = new URLSearchParams();
      if (valor.trim()) params.set("name", valor.trim());
      if (categoriaId) params.set("productCategoryId", categoriaId);
      const qs = params.toString();
      const res = await fetchCliente(`/products/public/search${qs ? `?${qs}` : ""}`);
      setResultados(res.data);
    } catch {
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar("", "");
  }, []);

  const handleChange = (e) => {
    const valor = e.target.value;
    setQuery(valor);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(valor, productCategoryId), 400);
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    setProductCategoryId(categoriaId);
    buscar(query, categoriaId);
  };

  const handleLimpiar = () => {
    setQuery("");
    setProductCategoryId("");
    buscar("", "");
  };

  const hayFiltrosActivos = query || productCategoryId;

  return (
    <main className="pt-16 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
      <div className="mt-10 max-w-4xl mx-auto">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-on-surface">Buscar productos</h1>
          <p className="text-sm text-on-surface/60 mt-1">Encuentra qué tiendas cercanas tienen el producto que necesitas.</p>
        </div>

        {/* Buscador + Filtro por categoría */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="input input-bordered flex items-center gap-2 pr-2 flex-1">
            <IoSearchSharp className="text-on-surface/40 text-lg shrink-0" />
            <input type="text" value={query} onChange={handleChange} placeholder="Ej: Arroz, Aceite, Jabón..." className="grow" autoFocus />
            {query && (
              <button onClick={handleLimpiar} className="btn btn-ghost btn-xs btn-circle">
                <IoCloseSharp />
              </button>
            )}
          </label>

          <select value={productCategoryId} onChange={handleCategoriaChange} className="select select-bordered sm:w-56">
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-8 max-w-4xl mx-auto">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-base-100 border border-base-300 p-4">
                <div className="flex gap-4">
                  <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && buscado && resultados.length === 0 && (
          <div className="text-center py-16 text-on-surface/40">
            <IoStorefrontSharp className="text-6xl mx-auto mb-3" />
            <p className="font-medium">
              {hayFiltrosActivos ? `No encontramos resultados con esos filtros.` : "No hay productos disponibles."}
            </p>
            {query && <p className="text-sm mt-1">Intenta con otro nombre o revisa la ortografía.</p>}
          </div>
        )}

        {!loading && resultados.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-on-surface/60">
              {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
              {query && (
                <>
                  {" "}
                  para <span className="font-semibold text-on-surface">"{query}"</span>
                </>
              )}
            </p>

            {resultados.map((producto) => (
              <Link
                key={producto.id}
                to={`/tiendas/${producto.store.id}`}
                className="card bg-base-100 border border-base-300 hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="card-body p-4">
                  <div className="flex gap-4">
                    {/* Foto producto */}
                    <div className="w-20 h-20 rounded-xl bg-base-200 overflow-hidden shrink-0">
                      {producto.photo ? (
                        <img src={producto.photo} alt={producto.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoStorefrontSharp className="text-3xl text-base-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">{producto.name}</h3>
                          <span className="badge badge-ghost badge-sm mt-0.5">{producto.productCategory.name}</span>
                        </div>
                        <span className="text-primary font-bold text-base shrink-0">
                          ${Number(producto.price).toLocaleString("es-CO")}
                          <span className="text-on-surface/40 font-normal text-xs"> / {producto.unitOfMeasure.name}</span>
                        </span>
                      </div>

                      {/* Stock */}
                      <div className="mt-2">
                        <span
                          className={`badge badge-sm text-white ${
                            producto.currentStock <= producto.lowStockThreshold ? "badge-warning" : "badge-success"
                          }`}
                        >
                          {producto.currentStock <= producto.lowStockThreshold ? `Poco stock (${producto.currentStock})` : "En existencia"}
                        </span>
                      </div>

                      {/* Tienda */}
                      <div className="mt-3 pt-3 border-t border-base-200 flex flex-wrap gap-3 items-center">
                        {producto.store.logo && (
                          <div className="w-6 h-6 rounded overflow-hidden bg-base-200 shrink-0">
                            <img src={producto.store.logo} alt={producto.store.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="font-medium text-sm text-on-surface">{producto.store.name}</span>
                        {producto.store.neighborhood && (
                          <div className="flex items-center gap-1 text-xs text-on-surface/50">
                            <MdLocationCity className="text-primary" />
                            {producto.store.neighborhood}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-on-surface/50">
                          <FaLocationDot className="text-primary" />
                          {producto.store.address}
                        </div>
                        {producto.store.phone && (
                          <div className="flex items-center gap-1 text-xs text-on-surface/50">
                            <FaPhone className="text-primary" />
                            {producto.store.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default BuscarProducto;
