import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoStorefrontSharp } from "react-icons/io5";
import { MdLocationCity } from "react-icons/md";
import { Link } from "react-router-dom";

const CardProducto = ({ tienda }) => {
  const imagen = tienda.photo || tienda.logo || null;

  return (
    <Link
      to={`/tiendas/${tienda.id}`}
      className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="h-36 bg-base-200 relative overflow-hidden">
        {imagen ? (
          <img
            src={imagen}
            alt={tienda.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoStorefrontSharp className="text-6xl text-base-300" />
          </div>
        )}
        {tienda.status === "Active" && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-success text-white text-[10px] font-bold uppercase tracking-wider">
              Abierto
            </span>
          </div>
        )}
        {/* Logo encima de la foto */}
        {tienda.logo && tienda.photo && (
          <div className="absolute bottom-2 left-2">
            <div className="w-10 h-10 rounded-lg border-2 border-base-100 overflow-hidden bg-base-100">
              <img
                src={tienda.logo}
                alt={`Logo ${tienda.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
      <div className="card-body p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="card-title text-base">{tienda.name}</h4>
          {tienda.storeCategory && (
            <span className="badge badge-primary badge-outline shrink-0">
              {tienda.storeCategory.name}
            </span>
          )}
        </div>
        {tienda.neighborhood && (
          <div className="flex items-center gap-2 text-base-content/60 text-sm">
            <MdLocationCity className="text-primary shrink-0" />
            <span>{tienda.neighborhood}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-base-content/60 text-sm">
          <FaLocationDot className="text-primary shrink-0" />
          <span>{tienda.address}</span>
        </div>
        {tienda.phone && (
          <div className="flex items-center gap-2 text-base-content/60 text-sm">
            <FaPhone className="text-primary shrink-0" />
            <span>{tienda.phone}</span>
          </div>
        )}
        <div className="card-actions justify-end mt-2">
          <span className="btn btn-primary btn-sm">Ver tienda</span>
        </div>
      </div>
    </Link>
  );
};

export default CardProducto;
