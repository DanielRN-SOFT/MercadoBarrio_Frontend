import { IoArrowBackSharp, IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const estaAbierto = (schedules = []) => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = weekDays[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return schedules
    .filter((s) => s.status === "Active" && s.weekDay === today)
    .some((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
      return currentMinutes >= startMin && currentMinutes <= endMin;
    });
};

const Hero = ({ tienda }) => {
  const abierto = estaAbierto(tienda.schedules);

  return (
    <div className="relative h-56 md:h-72 bg-base-200 overflow-hidden">
      {tienda.photo ? (
        <img src={tienda.photo} alt={tienda.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IoStorefrontSharp className="text-8xl text-base-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <Link to="/tiendas" className="absolute top-4 left-4 btn btn-sm btn-primary text-white gap-1">
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
