import { useState, useEffect } from "react";
import { IoArrowBackSharp, IoStorefrontSharp } from "react-icons/io5";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdLocationCity, MdAccessTime } from "react-icons/md";
import { Link } from "react-router-dom";
import { estaAbierto } from "../../../../helpers/horarioTienda";

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/stores/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo; // ya es una URL absoluta
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
};

const DIAS_SEMANA = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formatHora = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
};

// Obtiene y formatea las jornadas de hoy, ej: "8:00 AM – 6:00 PM, 2:00 PM – 8:00 PM"
const getHorarioHoy = (schedules = []) => {
  const hoy = DIAS_SEMANA[new Date().getDay()];
  const jornadasHoy = schedules
    .filter((h) => h.weekDay === hoy)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  if (jornadasHoy.length === 0) return null;

  return jornadasHoy
    .map((h) => `${formatHora(h.startTime)} – ${formatHora(h.endTime)}`)
    .join(", ");
};

const Hero = ({ tienda }) => {
  const [imgError, setImgError] = useState(false);
  const abierto = estaAbierto(tienda.schedules);
  const photoUrl = getPhotoUrl(tienda.photo);
  const horarioHoy = getHorarioHoy(tienda.schedules);

  useEffect(() => {
    setImgError(false);
  }, [tienda.photo]);

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary-container to-primary">
      {/* Textura decorativa sutil */}
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative max-w-(--spacing-max-width) mx-auto flex flex-col-reverse md:flex-row items-center gap-6 md:gap-8 px-4 md:px-8 py-4 md:py-6">
        {/* Columna izquierda: info */}
        <div className="flex-1 w-full flex flex-col justify-center gap-3 md:w-2/5">
          <Link
            to="/tiendas"
            aria-label="Volver a tiendas"
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-on-primary/15 backdrop-blur-sm px-3 py-2 text-sm font-medium text-on-primary ring-1 ring-on-primary/25 hover:bg-on-primary/25 transition-colors"
          >
            <IoArrowBackSharp className="text-base" />
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-on-primary leading-tight">
                {tienda.name}
              </h1>
              {tienda.status === "Active" && (
                <span
                  className={`badge text-white text-[10px] font-bold uppercase tracking-wider ${
                    abierto ? "badge-success" : "badge-error"
                  }`}
                >
                  {abierto ? "Abierto" : "Cerrado"}
                </span>
              )}
            </div>

            {tienda.storeCategory && (
              <span className="badge badge-outline border-on-primary/40 text-on-primary self-start">
                {tienda.storeCategory.name}
              </span>
            )}

            {tienda.description && (
              <p className="text-on-primary/75 text-sm md:text-base max-w-prose">
                {tienda.description}
              </p>
            )}
          </div>

          {/* Datos de contacto */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {tienda.neighborhood && (
              <div className="flex items-center gap-1.5 text-sm text-on-primary/80">
                <MdLocationCity className="text-on-primary/60 shrink-0" />
                {tienda.neighborhood}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-on-primary/80">
              <FaLocationDot className="text-on-primary/60 shrink-0" />
              {tienda.address}
            </div>
            {tienda.phone && (
              <div className="flex items-center gap-1.5 text-sm text-on-primary/80">
                <FaPhone className="text-on-primary/60 shrink-0" />
                {tienda.phone}
              </div>
            )}
          </div>

          {/* Horario de hoy */}
          {horarioHoy && (
            <div className="flex items-center gap-1.5 text-sm text-on-primary/80">
              <MdAccessTime className="text-on-primary/60 shrink-0" />
              <span>Hoy: {horarioHoy}</span>
            </div>
          )}
        </div>

        {/* Columna derecha: imagen */}
        <div className="w-full md:w-3/6 shrink-0">
          <div className="aspect-16/10 rounded-2xl overflow-hidden ring-4 ring-on-primary/15 shadow-xl bg-on-primary/10">
            {photoUrl && !imgError ? (
              <img
                src={photoUrl}
                alt={tienda.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoStorefrontSharp className="text-7xl text-on-primary/30" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
