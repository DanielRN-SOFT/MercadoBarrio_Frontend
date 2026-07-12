// Mapa.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdMap, MdFormatListBulleted } from "react-icons/md";
import FilterBar from "../../components/publica/Tiendas/FilterBar";
import fetchCliente from "../../config/fetchCliente";
import ContainerMapa from "../../components/Mapa/ContainerMapa";
import HeaderLista from "../../components/Mapa/HeaderLista";
import SinResultados from "../../components/Mapa/SinResultados";
import TiendasResultados from "../../components/Mapa/TiendasResultados";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
});

// Genera colores únicos e ilimitados usando el "golden angle" para
// máxima separación visual entre matices consecutivos
const colorCache = {};
const getColor = (categoryId) => {
  if (!colorCache[categoryId]) {
    const idx = Object.keys(colorCache).length;
    const hue = (idx * 137.508) % 360;
    colorCache[categoryId] = `hsl(${hue}, 65%, 42%)`;
  }
  return colorCache[categoryId];
};

const Mapa = () => {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({});
  const [tiendaActiva, setTiendaActiva] = useState(null);
  const [vistaMobile, setVistaMobile] = useState("mapa"); // "mapa" | "lista"
  const markerRefs = useRef({});

  const fetchTiendas = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
        ),
      ).toString();
      const res = await fetchCliente(`/stores/public/map?${query}`);
      setTiendas(res.data.filter((t) => t.latitude && t.longitude));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiendas(filtros);
  }, [filtros, fetchTiendas]);

  const handleCardClick = (tienda) => {
    setTiendaActiva(tienda.id);
    // En mobile, al elegir una tienda desde la lista, saltamos al mapa
    // para ver su ubicación de inmediato.
    setVistaMobile("mapa");
    const marker = markerRefs.current[tienda.id];
    if (marker) marker.openPopup();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] md:overflow-hidden bg-surface">
      {/* Filtros — siempre arriba */}
      <div className="px-4 pt-20 pb-4 bg-surface border-b border-surface-container z-10">
        <FilterBar onFilter={setFiltros} />
      </div>

      {/* Selector Mapa / Lista — solo mobile */}
      <div className="md:hidden px-4 pb-3">
        <div
          role="tablist"
          className="relative grid grid-cols-2 bg-surface-container-low p-1 rounded-full gap-1"
        >
          {/* Fondo deslizante detrás del tab activo, en vez de recolorear cada tab por separado */}
          <span
            className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-linear-to-br from-primary to-primary/80 shadow-md shadow-primary/25 transition-transform duration-300 ease-out ${
              vistaMobile === "lista"
                ? "translate-x-[calc(100%+8px)]"
                : "translate-x-0"
            }`}
          />

          <button
            role="tab"
            onClick={() => setVistaMobile("mapa")}
            className={`relative z-10 flex items-center justify-center gap-1.5 h-9 rounded-full text-sm font-semibold transition-colors ${
              vistaMobile === "mapa" ? "text-on-primary" : "text-on-surface/50"
            }`}
          >
            <MdMap className="text-base" />
            Mapa
          </button>
          <button
            role="tab"
            onClick={() => setVistaMobile("lista")}
            className={`relative z-10 flex items-center justify-center gap-1.5 h-9 rounded-full text-sm font-semibold transition-colors ${
              vistaMobile === "lista" ? "text-on-primary" : "text-on-surface/50"
            }`}
          >
            <MdFormatListBulleted className="text-base" />
            Lista
            {!loading && (
              <span
                className={`text-[10px] font-bold rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center transition-colors ${
                  vistaMobile === "lista"
                    ? "bg-on-primary/25 text-on-primary"
                    : "bg-outline-variant/50 text-on-surface/50"
                }`}
              >
                {tiendas.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Split view */}
      <main className="flex flex-col md:grid md:grid-cols-[58%_1px_1fr] flex-1 md:overflow-hidden md:min-h-0">
        {/* Mapa */}
        <section
          className={`relative bg-surface-dim overflow-hidden h-[calc(100vh-64px-64px-176px)] min-h-80 md:h-full ${
            vistaMobile === "lista" ? "hidden md:block" : "block"
          }`}
        >
          {loading && (
            <div className="absolute inset-0 z-400 flex items-center justify-center bg-surface/70 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-surface px-6 py-4 shadow-lg ring-1 ring-outline-variant/50">
                <span className="loading loading-spinner loading-md text-primary" />
                <span className="text-xs font-medium text-on-surface/60">
                  Buscando tiendas cerca de ti...
                </span>
              </div>
            </div>
          )}
          <ContainerMapa
            setTiendaActiva={setTiendaActiva}
            markerRefs={markerRefs}
            getColor={getColor}
            tiendas={tiendas}
          />
        </section>

        {/* Divider desktop */}
        <div className="hidden md:block bg-outline-variant" />

        {/* Lista */}
        <section
          className={`flex-col border-t md:border-t-0 border-outline-variant bg-surface md:overflow-hidden md:min-h-0 ${
            vistaMobile === "mapa" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header — oculto en mobile, ya que el conteo vive en el tab de Lista */}
          <div className="hidden md:block">
            <HeaderLista loading={loading} tiendas={tiendas} />
          </div>

          <div className="md:flex-1 md:overflow-y-auto p-3 pb-6 space-y-2.5 md:min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {!loading && tiendas.length === 0 && <SinResultados />}

            {tiendas.map((tienda) => {
              const color = getColor(tienda.storeCategory?.id);
              const abierto = tienda.status === "Active";
              const activa = tiendaActiva === tienda.id;
              return (
                <TiendasResultados
                  key={tienda.id}
                  tienda={tienda}
                  handleCardClick={handleCardClick}
                  color={color}
                  abierto={abierto}
                  activa={activa}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Mapa;
