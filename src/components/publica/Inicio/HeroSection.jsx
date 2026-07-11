import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchCircle, IoStorefrontSharp } from "react-icons/io5";
import fetchCliente from "../../../config/fetchCliente";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [imgLoaded, setImgLoaded] = useState(false);

  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const buscar = async (valor) => {
    if (!valor.trim()) {
      setResultados([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchCliente(
        `/products/public/search?name=${encodeURIComponent(valor.trim())}`,
      );
      setResultados(res.data ?? []);
      setOpen(true);
      setActiveIndex(-1);
    } catch {
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const valor = e.target.value;
    setQuery(valor);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(valor), 350);
  };

  const irATienda = (producto) => {
    setOpen(false);
    navigate(`/tiendas/${producto.store.id}`);
  };

  const handleKeyDown = (e) => {
    if (!open || resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % resultados.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? resultados.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < resultados.length) {
        irATienda(resultados[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex];
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div className="relative w-full min-h-105 md:min-h-150 flex items-center justify-center">
      {/* Capa de fondo: imagen + overlay, recortada aparte */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Spinner mientras la imagen no ha cargado */}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-200">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <img
          src="/images/hero.jpg"
          alt="Tu mercado local"
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Capa de contenido: NO se recorta, puede desbordar hacia abajo */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-margin-mobile md:px-margin-desktop">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg mb-2 text-white">
          MercadoBarrio
        </h2>
        <p className="font-body-md text-body-md opacity-90 mb-8 text-white">
          Tu mercado local en un click
        </p>

        <div ref={containerRef} className="relative max-w-xl mx-auto text-left">
          <div className="flex items-center bg-surface rounded-full p-1 shadow-lg">
            <IoSearchCircle className="text-primary text-5xl ml-2 shrink-0" />
            <input
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => resultados.length > 0 && setOpen(true)}
              className="rounded-full mx-2 sm:w-md text-on-surface px-4 py-2 font-body-md text-body-md"
              placeholder="¿Qué producto buscas hoy en tu barrio?"
              type="text"
              autoComplete="off"
            />
          </div>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {loading && (
                <div className="px-5 py-4 text-on-surface/60 font-body-sm text-body-sm">
                  Buscando...
                </div>
              )}

              {!loading && resultados.length === 0 && (
                <div className="px-5 py-4 text-on-surface/60 font-body-sm text-body-sm">
                  No encontramos productos para "{query}".
                </div>
              )}

              {!loading && resultados.length > 0 && (
                <ul ref={listRef}>
                  {resultados.map((producto, index) => (
                    <li
                      key={producto.id}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        irATienda(producto);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-base-200 last:border-b-0 ${
                        index === activeIndex
                          ? "bg-primary/10"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-base-200 overflow-hidden shrink-0">
                        {producto.photo ? (
                          <img
                            src={producto.photo}
                            alt={producto.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoStorefrontSharp className="text-lg text-base-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface truncate">
                          {producto.name}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface/50 truncate">
                          {producto.store.name}
                        </p>
                      </div>
                      <span className="font-label-md text-label-md text-primary shrink-0">
                        ${Number(producto.price).toLocaleString("es-CO")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
