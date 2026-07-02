import { IoArrowBackSharp, IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { estaAbierto } from "../../../../helpers/horarioTienda";

const Hero = ({ tienda }) => {
  const abierto = estaAbierto(tienda.schedules);

  return (
    <div className="relative h-64 md:h-80 bg-base-200 overflow-hidden">
      {tienda.photo ? (
        <img
          src={tienda.photo}
          alt={tienda.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-base-200 to-base-300">
          <IoStorefrontSharp className="text-7xl md:text-8xl text-base-content/20" />
        </div>
      )}

      {/* Gradiente: más oscuro arriba (controles) y abajo (texto), claro al centro */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/10 to-black/80" />

      {/* Volver */}
      <Link
        to="/tiendas"
        aria-label="Volver a tiendas"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-primary backdrop-blur-md px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-primary/90 transition-colors"
      >
        <IoArrowBackSharp className="text-base" />
        <span className="hidden sm:inline">Volver</span>
      </Link>

      {/* Estado abierto/cerrado */}
      {tienda.status === "Active" && (
        <div className="absolute top-2 right-2">
          <span
            className={`badge text-white text-[10px] font-bold uppercase tracking-wider ${
              abierto ? "badge-success" : "badge-error"
            }`}
          >
            {abierto ? "Abierto" : "Cerrado"}
          </span>
        </div>
      )}

      {/* Nombre de la tienda */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <h1 className="text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-md leading-tight">
          {tienda.name}
        </h1>
        {tienda.category && (
          <p className="text-white/80 text-sm md:text-base mt-1 drop-shadow">
            {tienda.category}
          </p>
        )}
      </div>
    </div>
  );
};

export default Hero;
