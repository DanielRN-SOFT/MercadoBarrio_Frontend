import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix del ícono por defecto de Leaflet con bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Link } from "react-router-dom";
import { MdLocationCity } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapaTienda = ({ tienda }) => {
  const lat = parseFloat(tienda.latitude);
  const lng = parseFloat(tienda.longitude);
  if (!lat || !lng) return null;
  const abierto = tienda.status === "Active";
  return (
    <div>
      <h2 className="text-xl font-bold text-on-surface mb-4">Ubicación</h2>
      <div className="rounded-2xl overflow-hidden border border-base-300 h-56 md:h-96 w-full z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={[lat, lng]} icon={defaultIcon}>
            <Popup minWidth={220} maxWidth={260}>
              <div className="flex flex-col gap-1 p-1">
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
                    style={{ backgroundColor: "#1960a6" }}
                  >
                    {tienda.storeCategory.name}
                  </span>
                )}
                {tienda.address && (
                  <div className="text-xs m-0 text-on-surface/60 leading-snug">
                    <p className="">
                      <MdLocationCity className="text-primary inline" />{" "}
                      {tienda.neighborhood}
                    </p>
                    <p className="">
                      <FaLocationDot className="text-primary inline m-0" />
                      {tienda.address}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapaTienda;
