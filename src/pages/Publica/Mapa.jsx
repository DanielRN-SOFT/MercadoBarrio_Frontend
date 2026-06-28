// Mapa.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import FilterBar from "../../components/publica/Tiendas/FilterBar";
import fetchCliente from "../../config/fetchCliente";
import ContainerMapa from "../../components/Mapa/ContainerMapa";
import HeaderLista from "../../components/Mapa/HeaderLista";
import SinResultados from "../../components/Mapa/SinResultados";

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

const CATEGORY_COLORS = [
  "#1960a6",
  "#2e7d32",
  "#c62828",
  "#f57c00",
  "#6a1b9a",
  "#00838f",
  "#ad1457",
  "#558b2f",
];

const colorCache = {};
const getColor = (categoryId) => {
  if (!colorCache[categoryId]) {
    const idx = Object.keys(colorCache).length % CATEGORY_COLORS.length;
    colorCache[categoryId] = CATEGORY_COLORS[idx];
  }
  return colorCache[categoryId];
};

const Mapa = () => {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({});
  const [tiendaActiva, setTiendaActiva] = useState(null);
  const markerRefs = useRef({});

  const fetchTiendas = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
        ),
      ).toString();
      const res = await fetchCliente(`/stores/public?limit=100&${query}`);
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
    const marker = markerRefs.current[tienda.id];
    if (marker) marker.openPopup();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] md:overflow-hidden">
      {/* Filtros — siempre arriba */}
      <div className="px-4 pt-20 pb-5 bg-surface z-10">
        <FilterBar onFilter={setFiltros} />
      </div>

      {/* Split view */}
      <main className="flex flex-col md:grid md:grid-cols-[60%_1px_1fr] md:overflow-hidden md:flex-1 md:min-h-0">
        {/* Mapa */}
        <section className="relative bg-surface-dim overflow-hidden h-[45vh] md:h-full">
          {loading && (
            <div className="absolute inset-0 z-400 flex items-center justify-center bg-surface/60">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}
          <ContainerMapa
            markerRefs={markerRefs}
            getColor={getColor}
            tiendas={tiendas}
          />
        </section>

        {/* Divider desktop */}
        <div className="hidden md:block bg-outline-variant" />

        {/* Lista */}
        <section className="flex flex-col border-t md:border-t-0 border-outline-variant bg-surface md:overflow-hidden md:min-h-0">
          {/* Header */}
          <HeaderLista loading={loading} tiendas={tiendas} />

          <div className="md:flex-1 md:overflow-y-auto p-3 space-y-2 md:min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {!loading && tiendas.length === 0 && <SinResultados />}

            {tiendas.map((tienda) => {
              const color = getColor(tienda.storeCategory?.id);
              const abierto = tienda.status === "Active";
              const activa = tiendaActiva === tienda.id;
              return (
                <div
                  key={tienda.id}
                  onClick={() => handleCardClick(tienda)}
                  className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    activa
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low hover:border-outline hover:shadow-sm"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low">
                      {tienda.logo || tienda.photo ? (
                        <img
                          src={tienda.logo || tienda.photo}
                          alt={tienda.name}
                          className={`w-full h-full object-cover ${!abierto ? "grayscale opacity-60" : ""}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl text-on-surface/20">
                            storefront
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Dot estado */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${abierto ? "bg-success" : "bg-outline-variant"}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        className={`text-sm font-semibold leading-tight truncate ${!abierto ? "text-on-surface/50" : "text-on-surface"}`}
                      >
                        {tienda.name}
                      </h4>
                      {activa && (
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                          chevron_right
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {tienda.storeCategory && (
                        <span
                          className="inline-flex items-center text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: color }}
                        >
                          {tienda.storeCategory.name}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          abierto
                            ? "bg-success/10 text-success"
                            : "bg-outline-variant/30 text-on-surface/40"
                        }`}
                      >
                        {abierto ? "Abierto" : "Cerrado"}
                      </span>
                    </div>

                    {tienda.neighborhood && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <span className="material-symbols-outlined text-[12px] text-on-surface/30">
                          location_on
                        </span>
                        <span className="text-[11px] text-on-surface/40 truncate">
                          {tienda.neighborhood}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Mapa;
