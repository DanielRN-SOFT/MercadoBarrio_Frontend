import { IoArrowBackSharp, IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const BOGOTA_OFFSET_MIN = 5 * 60; // Bogotá = UTC-5, sin horario de verano

// Convierte una fecha completa (con día y hora) de UTC a "hora local de Bogotá"
const getBogotaNow = () => {
  const now = new Date();
  const bogotaTime = new Date(now.getTime() - BOGOTA_OFFSET_MIN * 60 * 1000);

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return {
    weekDay: weekDays[bogotaTime.getUTCDay()],
    minutes: bogotaTime.getUTCHours() * 60 + bogotaTime.getUTCMinutes(),
  };
};

// Convierte solo la hora-del-día (sin fecha real) de un campo Time de la BD a minutos Bogotá
const getBogotaMinutesFromTimeField = (value) => {
  const d = new Date(value);
  const utcMinutesOfDay = d.getUTCHours() * 60 + d.getUTCMinutes();
  return (utcMinutesOfDay - BOGOTA_OFFSET_MIN + 1440) % 1440;
};

const estaAbierto = (schedules = []) => {
  const { weekDay: today, minutes: currentMinutes } = getBogotaNow();

  return schedules
    .filter((s) => s.status === "Active" && s.weekDay === today)
    .some((s) => {
      const startMin = getBogotaMinutesFromTimeField(s.startTime);
      const endMin = getBogotaMinutesFromTimeField(s.endTime);

      // Horario que cruza la medianoche (ej: 20:00 - 02:00)
      if (endMin < startMin) {
        return currentMinutes >= startMin || currentMinutes <= endMin;
      }
      return currentMinutes >= startMin && currentMinutes <= endMin;
    });
};

const Hero = ({ tienda }) => {
  console.log(tienda);
  const abierto = estaAbierto(tienda.schedules);
  return (
    <div className="relative h-56 md:h-72 bg-base-200 overflow-hidden">
      {tienda.photo ? (
        <img
          src={tienda.photo}
          alt={tienda.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IoStorefrontSharp className="text-8xl text-base-300" />
        </div>
      )}

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50" />
      <Link
        to="/tiendas"
        className="absolute top-4 left-4 btn btn-sm btn-primary text-white gap-1"
      >
        <IoArrowBackSharp />
        Volver
      </Link>
      {tienda.status === "Active" && (
        <span
          className={`absolute top-4 right-4 badge font-bold uppercase tracking-wider text-white ${
            abierto ? "badge-success" : "badge-error"
          }`}
        >
          {abierto ? "Abierto" : "Cerrado"}
        </span>
      )}
    </div>
  );
};

export default Hero;
