import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix del ícono por defecto de Leaflet con bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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

  return (
    <div>
      <h2 className="text-xl font-bold text-on-surface mb-4">Ubicación</h2>
      <div className="rounded-2xl overflow-hidden border border-base-300 h-56 md:h-72 w-full z-0">
        <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} className="h-full w-full">
         <TileLayer
               url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
               attribution='&copy; <a href="https://carto.com/">CARTO</a>'
             />
          <Marker position={[lat, lng]} icon={defaultIcon}>
            <Popup>
              <span className="font-semibold">{tienda.name}</span>
              <br />
              {tienda.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapaTienda;
