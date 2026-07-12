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
  const [focused, setFocused] = useState(false);

  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const ICON_GRID = Array.from({ length: 48 });

  const CATEGORIAS = [
    "🥬 Frutas y verduras",
    "🥖 Panadería",
    "🥩 Carnicería",
    "🐟 Pescadería",
    "🧀 Lácteos",
    "🌶️ Especias",
    "🍯 Productos artesanales",
    "☕ Café local",
  ];

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
    <div className="relative w-full min-h-105 md:min-h-150 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4%, -6%) scale(1.08); }
          66% { transform: translate(-5%, 4%) scale(0.96); }
        }
        @keyframes drift {
          0% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-14px) rotate(calc(var(--r, 0deg) + 6deg)); }
          100% { transform: translateY(0) rotate(var(--r, 0deg)); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
      `}</style>

      {/* Capa de fondo: mesh gradient animado + wallpaper de íconos */}
      <div className="absolute inset-0 overflow-hidden bg-primary">
        <div
          className="absolute inset-[-10%] opacity-90"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, theme(colors.secondary) 0%, transparent 45%), radial-gradient(circle at 80% 20%, theme(colors.primary) 0%, transparent 50%), radial-gradient(circle at 50% 90%, theme(colors.secondary-container) 0%, transparent 55%)",
            animation: "meshMove 14s ease-in-out infinite",
          }}
        />

        {/* Íconos flotando con drift, no estáticos */}
        <div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,black_10%,transparent_65%)]">
          <div className="grid grid-cols-8 md:grid-cols-12 gap-6 place-items-center h-full p-6 rotate-[-8deg] scale-125">
            {ICON_GRID.map((_, i) => (
              <IoStorefrontSharp
                key={i}
                className="text-white motion-safe:animate-[drift_ease-in-out_infinite]"
                style={{
                  fontSize: i % 5 === 0 ? "2.25rem" : "1.35rem",
                  opacity: i % 3 === 0 ? 0.9 : 0.45,
                  "--r": `${((i * 37) % 40) - 20}deg`,
                  animationDuration: `${5 + (i % 4)}s`,
                  animationDelay: `${(i % 6) * 0.4}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Franja de rayas tipo toldo */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(90deg,var(--color-primary-container)_0px,var(--color-primary-container)_20px,var(--color-secondary-container)_20px,var(--color-secondary-container)_40px)]" />

      {/* Capa de contenido */}
      <div className="relative z-10 w-full min-w-0 max-w-5xl mx-auto text-center px-margin-mobile md:px-margin-desktop">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 mb-4 ring-1 ring-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-white motion-safe:animate-pulse" />
          <span className="font-label-sm text-label-sm text-white">
            +200 tiendas de tu barrio, abiertas ahora
          </span>
        </div>

        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:text-6xl md:font-headline-lg mb-2 text-white drop-shadow-md tracking-tight">
          Merca
          <span className="bg-linear-to-r from-white to-secondary-container bg-clip-text text-transparent">
            doBarrio
          </span>
        </h2>
        <p className="font-body-md text-body-md opacity-90 mb-8 text-white">
          Tu mercado local en un click
        </p>

        <div ref={containerRef} className="relative max-w-xl mx-auto text-left">
          {/* Glow pulsante detrás del buscador */}
          <div
            className="absolute -inset-4 rounded-full bg-secondary blur-2xl -z-10"
            style={{ animation: "glowPulse 3s ease-in-out infinite" }}
          />
          <div
            className={`flex items-center bg-surface/95 backdrop-blur-sm rounded-full p-1 shadow-2xl transition-all duration-300 ${
              focused
                ? "ring-2 ring-white/70 scale-[1.02]"
                : "ring-1 ring-white/20"
            }`}
          >
            <IoSearchCircle className="text-primary text-5xl ml-2 shrink-0" />
            <input
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setFocused(true);
                resultados.length > 0 && setOpen(true);
              }}
              onBlur={() => setFocused(false)}
              className="flex-1 min-w-0 rounded-full mx-2 text-on-surface px-4 py-2 font-body-md text-body-md outline-none"
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

        {/* Marquee de categorías: da movimiento y es información real, no decoración */}
        <div className="mt-8 max-w-xl mx-auto overflow-hidden mask-[linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div
            className="flex gap-3 w-max"
            style={{ animation: "marquee 22s linear infinite" }}
          >
            {[...CATEGORIAS, ...CATEGORIAS].map((cat, i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/15 px-3 py-1 font-label-sm text-label-sm text-white"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
