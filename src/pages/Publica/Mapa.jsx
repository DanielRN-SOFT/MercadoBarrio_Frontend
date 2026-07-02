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
      console.log(res);
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
      <div className="px-4 pt-20 pb-5 bg-surface border border-surface-container  z-10">
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
            setTiendaActiva={setTiendaActiva}
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
