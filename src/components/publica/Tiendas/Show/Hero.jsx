import { IoArrowBackSharp, IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { estaAbierto } from "../../../../helpers/horarioTienda";

const BOGOTA_OFFSET_MIN = 5 * 60; // Bogotá = UTC-5, sin horario de verano

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
