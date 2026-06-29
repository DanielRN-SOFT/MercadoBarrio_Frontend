import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";

const ContainerMapa = ({ tiendas, getColor, markerRefs, setTiendaActiva }) => {
 
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

  const CARTAGO = [4.7467, -75.9122];

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
                  <span className="font-semibold leading-tight text-sm">
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
                  className="btn btn-primary btn-sm w-full mt-1"
                >
                  <p className="text-white">Ver perfil</p>
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default ContainerMapa;
