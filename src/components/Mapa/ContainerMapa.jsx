// ContainerMapa.jsx
import React, { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { MdLocationOn, MdArrowForward } from "react-icons/md";
import { IoStorefrontOutline } from "react-icons/io5";

// Cache de íconos por color: evita reconstruir el SVG del pin en cada render.
const pinCache = {};
const createPin = (color) => {
  if (pinCache[color]) return pinCache[color];
  const icon = L.divIcon({
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
  pinCache[color] = icon;
  return icon;
};

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

// Ojo: este contenido vive dentro del wrapper de Leaflet, NO dentro de un
// div propio con padding. Todo el espaciado se maneja aquí adentro, y el
// padding/border-radius del wrapper se anula por completo en ContainerMapa.css.
const TiendaPopup = ({ tienda, color, abierto }) => (
  <div className="w-56">
    {/* Portada con estado superpuesto */}
    <div className="relative h-24 bg-surface-container-low">
      {tienda.photo ? (
        <img
          src={tienda.photo}
          alt={tienda.name}
          className={`w-full h-full object-cover block ${!abierto ? "grayscale opacity-70" : ""}`}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}22, transparent)`,
          }}
        >
          <IoStorefrontOutline
            className="text-3xl"
            style={{ color: `${color}80` }}
          />
        </div>
      )}

      {/* Degradado para que el badge se lea sobre cualquier foto */}
      <div className="absolute inset-x-0 top-0 h-10 bg-linear-to-b from-black/35 to-transparent pointer-events-none" />

      <span
        className={`absolute top-2 left-2 inline-flex items-center gap-1 badge badge-sm border-0 font-medium shadow-sm ${
          abierto ? "badge-success text-white" : "bg-neutral text-white"
        }`}
      >
        <span className="relative flex w-1.5 h-1.5">
          {abierto && (
            <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-70 animate-ping" />
          )}
          <span className="relative w-1.5 h-1.5 rounded-full bg-white" />
        </span>
        {abierto ? "Abierto" : "Cerrado"}
      </span>
    </div>

    <div className="flex flex-col gap-1.5 p-3">
      <h3 className="font-semibold leading-tight text-sm text-on-surface m-0">
        {tienda.name}
      </h3>

      {tienda.storeCategory && (
        <span
          className="inline-flex w-fit items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {tienda.storeCategory.name}
        </span>
      )}

      {tienda.address && (
        <div className="flex items-start gap-1 text-xs text-on-surface/55 leading-snug">
          <MdLocationOn className="shrink-0 mt-0.5 text-sm text-on-surface/35" />
          <span>{tienda.address}</span>
        </div>
      )}

      <Link
        to={`/tiendas/${tienda.id}`}
        className="group btn btn-primary btn-sm w-full mt-1 gap-1 text-white"
      >
        <span className="text-white">Ver perfil</span>
        <MdArrowForward className="text-sm transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  </div>
);

const ContainerMapa = ({ tiendas, getColor, markerRefs, setTiendaActiva }) => {
  const CARTAGO = useMemo(() => [4.7467, -75.9122], []);

  return (
    <MapContainer
      center={CARTAGO}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
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
            <Popup minWidth={224} maxWidth={224} className="tienda-popup">
              <TiendaPopup tienda={tienda} color={color} abierto={abierto} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default ContainerMapa;
