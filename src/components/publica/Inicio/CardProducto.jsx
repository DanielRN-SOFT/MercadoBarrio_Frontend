import { FaLocationDot } from "react-icons/fa6";
import { IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const CardProducto = ({ tienda }) => {
  return (
    <Link to={`/inicio/tienda/${tienda.id}`} className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
      <div className="h-32 bg-surface-container relative">
        <img
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          data-alt="A warm and inviting local neighborhood grocery store interior with organized shelves of fresh produce and artisanal goods. The lighting is soft and natural, creating a community-focused and friendly atmosphere consistent with a modern minimalist aesthetic using a blue and white color palette."
          src={tienda.image}
        />
        <div className="absolute bottom-2 right-2">
          <span className="bg-success text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Abierto
          </span>
        </div>
      </div>
      <div className="p-4 flex gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
          <IoStorefrontSharp className="text-on-primary-container text-2xl" />
        </div>
        <div className="flex-1">
          <h4 className="font-headline-md text-headline-md text-on-surface mb-1">
            {tienda.name}
          </h4>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-4">
            <FaLocationDot className="text-lg text-primary" />
            <span className="">{tienda.address}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex text-tertiary">
              <span
                className="material-symbols-outlined text-[18px]"
                data-icon="star"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                star
              </span>
              <span className="ml-1 font-label-md text-label-md">4.8</span>
            </div>
            <button className="text-primary font-label-md text-label-md hover:bg-primary-fixed px-3 py-1 rounded-lg transition-colors cursor-pointer">
              Ver tienda
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardProducto;
