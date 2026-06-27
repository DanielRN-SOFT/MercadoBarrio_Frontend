import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const CardProducto = ({ tienda }) => {
  return (
    <Link
      to={`/inicio/tienda/${tienda.id}`}
      className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="h-32 bg-base-200 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <IoStorefrontSharp className="text-6xl text-base-300" />
        </div>
        {tienda.status === "Active" && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-success text-white text-[10px] font-bold uppercase tracking-wider">
              Abierto
            </span>
          </div>
        )}
      </div>
      <div className="card-body p-4 gap-2">
        <h4 className="card-title text-base">{tienda.name}</h4>
        <div className="flex items-center gap-2 text-base-content/60 text-sm">
          <FaLocationDot className="text-primary shrink-0" />
          <span>{tienda.address}</span>
        </div>
        <div className="flex items-center gap-2 text-base-content/60 text-sm">
          <FaPhone className="text-primary shrink-0" />
          <span>{tienda.phone}</span>
        </div>
        <div className="card-actions justify-end mt-2">
          <span className="btn btn-primary btn-sm">Ver tienda</span>
        </div>
      </div>
    </Link>
  );
};

export default CardProducto;
