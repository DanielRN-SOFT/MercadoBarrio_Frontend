import { useState, useRef, useEffect } from "react";
import {
  IoSearchSharp,
  IoCloseSharp,
  IoStorefrontSharp,
} from "react-icons/io5";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdLocationCity } from "react-icons/md";
import { Link } from "react-router-dom";
import fetchCliente from "../../config/fetchCliente";
import ProductosResultado from "../../components/publica/BuscarProducto/ProductosResultado";
import Paginacion from "../../components/publica/BuscarProducto/Paginacion";
import BuscadorFiltro from "../../components/publica/BuscarProducto/BuscadorFiltro";

const BuscarProducto = () => {
  const [query, setQuery] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchCliente("/product-categories/public/search")
      .then((res) => setCategorias(res?.data ?? []))
      .catch(() => {});
  }, []);

  const buscar = async (valor, categoriaId, paginaActual) => {
    setLoading(true);
    setBuscado(true);
    try {
      const params = new URLSearchParams();
      if (valor.trim()) params.set("name", valor.trim());
      if (categoriaId) params.set("productCategoryId", categoriaId);
      params.set("page", paginaActual);
      const res = await fetchCliente(
        `/products/public/search?${params.toString()}`,
      );
      setResultados(res.data);
      setMeta(res.meta ?? { total: res.data.length, page: 1, totalPages: 1 });
    } catch {
      setResultados([]);
      setMeta({ total: 0, page: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  // Se dispara cada vez que cambia la página (incluida la carga inicial)
  useEffect(() => {
    buscar(query, productCategoryId, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChange = (e) => {
    const valor = e.target.value;
    setQuery(valor);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        buscar(valor, productCategoryId, 1);
      }
    }, 400);
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    setProductCategoryId(categoriaId);
    if (page !== 1) {
      setPage(1);
    } else {
      buscar(query, categoriaId, 1);
    }
  };

  const handleLimpiar = () => {
    setQuery("");
    setProductCategoryId("");
    if (page !== 1) {
      setPage(1);
    } else {
      buscar("", "", 1);
    }
  };

  const hayFiltrosActivos = query || productCategoryId;

  // Genera el arreglo de páginas a mostrar, con "..." donde se omiten
  const getPaginas = (paginaActual, totalPaginas, delta = 1) => {
    const rango = [];
    const rangoConPuntos = [];
    let l;

    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 ||
        i === totalPaginas ||
        (i >= paginaActual - delta && i <= paginaActual + delta)
      ) {
        rango.push(i);
      }
    }

    for (const i of rango) {
      if (l) {
        if (i - l === 2) {
          rangoConPuntos.push(l + 1);
        } else if (i - l !== 1) {
          rangoConPuntos.push("...");
        }
      }
      rangoConPuntos.push(i);
      l = i;
    }

    return rangoConPuntos;
  };

  return (
    <main className="pt-16 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
      <div className="mt-10 max-w-4xl mx-auto">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-on-surface">
            Buscar productos
          </h1>
          <p className="text-sm text-on-surface/60 mt-1">
            Encuentra qué tiendas cercanas tienen el producto que necesitas.
          </p>
        </div>

        {/* Buscador + Filtro por categoría */}
        <BuscadorFiltro
          query={query}
          handleCategoriaChange={handleCategoriaChange}
          handleChange={handleChange}
          handleLimpiar={handleLimpiar}
          categorias={categorias}
          productCategoryId={productCategoryId}
        />
      </div>

      {/* Resultados */}
      <div className="mt-8 max-w-4xl mx-auto">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card bg-base-100 border border-base-300 p-4"
              >
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
              {hayFiltrosActivos
                ? `No encontramos resultados con esos filtros.`
                : "No hay productos disponibles."}
            </p>
            {query && (
              <p className="text-sm mt-1">
                Intenta con otro nombre o revisa la ortografía.
              </p>
            )}
          </div>
        )}

        {!loading && resultados.length > 0 && (
          <>
            <div className="space-y-3">
              <p className="text-sm text-on-surface/60">
                {meta.total} {meta.total === 1 ? "resultado" : "resultados"}
                {query && (
                  <>
                    {" "}
                    para{" "}
                    <span className="font-semibold text-on-surface">
                      "{query}"
                    </span>
                  </>
                )}
              </p>

              {resultados.map((producto) => (
                <ProductosResultado producto={producto} key={producto.id} />
              ))}
            </div>

            {/* Paginación */}
            {meta.totalPages > 1 && (
              <Paginacion
                setPage={setPage}
                page={page}
                meta={meta}
                getPaginas={getPaginas}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default BuscarProducto;
