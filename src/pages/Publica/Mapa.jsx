// Mapa.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import FilterBar from "../../components/publica/Tiendas/FilterBar";
import fetchCliente from "../../config/fetchCliente";

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

const createPin = (color) =>
  L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });

const CARTAGO = [4.7467, -75.9122];

const FitBounds = ({ tiendas }) => {
  const map = useMap();
  useEffect(() => {
    if (!tiendas.length) return;
    const bounds = tiendas.map((t) => [
      parseFloat(t.latitude),
      parseFloat(t.longitude),
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [tiendas, map]);
  return null;
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
    <div className="flex flex-col h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] overflow-hidden">
      {/* Barra de filtros */}
      <div className="px-4 pt-4 pb-2 bg-surface border-b border-outline-variant z-10">
        <FilterBar onFilter={setFiltros} />
      </div>

      {/* Split view */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mapa — 60% desktop */}
        <section className="w-full md:w-[60%] relative bg-surface-dim overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-surface/60">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}
          <MapContainer
            center={CARTAGO}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {tiendas.length > 0 && <FitBounds tiendas={tiendas} />}
            {tiendas.map((tienda) => {
              const color = getColor(tienda.storeCategory?.id);
              const abierto = tienda.status === "Active";
              return (
                <Marker
                  key={tienda.id}
                  position={[
                    parseFloat(tienda.latitude),
                    parseFloat(tienda.longitude),
                  ]}
                  icon={createPin(color)}
                  ref={(ref) => {
                    if (ref) markerRefs.current[tienda.id] = ref;
                  }}
                  eventHandlers={{ click: () => setTiendaActiva(tienda.id) }}
                >
                  <Popup minWidth={220} maxWidth={260}>
                    <div className="flex flex-col gap-2 p-1">
                      {tienda.photo && (
                        <img
                          src={tienda.photo}
                          alt={tienda.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-on-surface leading-tight text-sm">
                          {tienda.name}
                        </span>
                        <span
                          className={`badge badge-sm shrink-0 ${abierto ? "badge-success text-white" : "badge-ghost"}`}
                        >
                          {abierto ? "Abierto" : "Cerrado"}
                        </span>
                      </div>
                      {tienda.storeCategory && (
                        <span
                          className="badge badge-sm text-white w-fit"
                          style={{ backgroundColor: color }}
                        >
                          {tienda.storeCategory.name}
                        </span>
                      )}
                      {tienda.address && (
                        <p className="text-xs text-on-surface/60 leading-snug">
                          {tienda.address}
                        </p>
                      )}
                      <Link
                        to={`/tiendas/${tienda.id}`}
                        className="btn-primary btn btn-sm w-full mt-1"
                      >
                        <p className="text-white">Ver perfil</p>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </section>

        {/* Divider desktop */}
        <div className="hidden md:flex divider divider-horizontal m-0 border-outline-variant" />

        {/* Lista — 40% desktop */}
        <section className="w-full md:w-[40%] bg-surface flex flex-col h-full border-t md:border-t-0 border-outline-variant">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="text-label-md font-label-md text-on-surface uppercase tracking-wider">
              {loading
                ? "Cargando..."
                : `Tiendas encontradas (${tiendas.length})`}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {!loading && tiendas.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface/20">
                  storefront
                </span>
                <p className="text-body-md text-on-surface-variant">
                  No se encontraron tiendas con estos filtros.
                </p>
              </div>
            )}

            {tiendas.map((tienda) => {
              const color = getColor(tienda.storeCategory?.id);
              const abierto = tienda.status === "Active";
              const activa = tiendaActiva === tienda.id;
              return (
                <div
                  key={tienda.id}
                  onClick={() => handleCardClick(tienda)}
                  className={`card card-bordered cursor-pointer transition-colors ${
                    activa
                      ? "border-primary bg-surface-container"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div className="card-body p-4 flex-row gap-4 items-center">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low">
                        {tienda.logo || tienda.photo ? (
                          <img
                            src={tienda.logo || tienda.photo}
                            alt={tienda.name}
                            className={!abierto ? "grayscale" : ""}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-on-surface/20">
                              storefront
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          className={`text-headline-md font-headline-md text-on-surface leading-tight truncate ${!abierto ? "opacity-70" : ""}`}
                        >
                          {tienda.name}
                        </h4>
                        <span
                          className={`badge badge-sm shrink-0 py-2 px-3 rounded-md ${abierto ? "badge-success text-white" : "badge-ghost text-on-surface-variant border-outline-variant"}`}
                        >
                          {abierto ? "Abierto" : "Cerrado"}
                        </span>
                      </div>

                      {tienda.storeCategory && (
                        <span
                          className="badge badge-sm text-white"
                          style={{ backgroundColor: color }}
                        >
                          {tienda.storeCategory.name}
                        </span>
                      )}

                      {tienda.neighborhood && (
                        <div
                          className={`flex items-center gap-1 text-label-sm font-label-sm text-secondary ${!abierto ? "opacity-70" : ""}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            location_on
                          </span>
                          {tienda.neighborhood}
                        </div>
                      )}
                    </div>
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
