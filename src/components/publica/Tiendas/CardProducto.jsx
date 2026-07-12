import { useState, useEffect } from "react";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoStorefrontSharp, IoArrowForward } from "react-icons/io5";
import { MdLocationCity } from "react-icons/md";
import { Link } from "react-router-dom";
import { estaAbierto } from "../../../helpers/horarioTienda";

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/stores/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo; // ya es una URL absoluta
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
};

const CardProducto = ({ tienda }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imagenUrl = getPhotoUrl(tienda.photo);
  const abierto = estaAbierto(tienda.schedules);

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [tienda.photo]);

  return (
    <Link
      to={`/tiendas/${tienda.id}`}
      className="card bg-base-100 border border-base-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden"
    >
      <div className="h-36 bg-base-200 relative overflow-hidden">
        {imagenUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-spinner loading-sm text-primary" />
              </div>
            )}
            <img
              src={imagenUrl}
              alt={tienda.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-base-200">
            <IoStorefrontSharp className="text-6xl text-primary/25" />
          </div>
        )}

        {/* Degradado para que el badge siempre se lea bien */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {tienda.status === "Active" && (
          <div className="absolute top-2 right-2">
            <span
              className={`badge gap-1.5 text-white text-[10px] font-bold uppercase tracking-wider border-none shadow-sm ${
                abierto ? "badge-success" : "badge-error"
              }`}
            >
              <span className="relative flex w-1.5 h-1.5">
                {abierto && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white motion-safe:animate-ping" />
                )}
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              {abierto ? "Abierto" : "Cerrado"}
            </span>
          </div>
        )}

        {tienda.storeCategory && (
          <div className="absolute bottom-2 left-2">
            <span className="badge badge-sm bg-base-100/90 backdrop-blur-sm border-none text-base-content font-medium shadow-sm">
              {tienda.storeCategory.name}
            </span>
          </div>
        )}
      </div>

      <div className="card-body p-4 gap-2">
        <h4 className="card-title text-base group-hover:text-primary transition-colors">
          {tienda.name}
        </h4>

        <div className="flex flex-col gap-1.5">
          {tienda.neighborhood && (
            <div className="flex items-center gap-2 text-base-content/60 text-sm">
              <MdLocationCity className="text-primary shrink-0" />
              <span className="truncate">{tienda.neighborhood}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-base-content/60 text-sm">
            <FaLocationDot className="text-primary shrink-0" />
            <span className="truncate">{tienda.address}</span>
          </div>
          {tienda.phone && (
            <div className="flex items-center gap-2 text-base-content/60 text-sm">
              <FaPhone className="text-primary shrink-0" />
              <span className="truncate">{tienda.phone}</span>
            </div>
          )}
        </div>

        <div className="card-actions justify-end mt-2">
          <span className="btn btn-primary btn-sm gap-1.5 group-hover:gap-2.5 transition-all">
            Ver tienda
            <IoArrowForward className="text-sm transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CardProducto;
