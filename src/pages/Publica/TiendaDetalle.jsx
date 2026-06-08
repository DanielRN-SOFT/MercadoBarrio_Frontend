import { useParams } from "react-router-dom";
import { tiendas } from "../../tiendas";
import { FaStar, FaCheckCircle } from "react-icons/fa";

const TiendaDetalle = () => {
  const { id: tiendaId } = useParams();
  const tienda = tiendas.find((tienda) => tienda.id == tiendaId);
  return (
    <main class="pb-20  mx-auto">
      <section className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img
          src={tienda.image}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-end p-4 md:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="badge badge-success text-white gap-1 px-3 py-3">
                <FaCheckCircle />
                Abierto
              </span>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm">
                <FaStar className="text-yellow-400" />
                {tienda.rating}
              </div>
            </div>
            <h1 className="text-white text-3xl md:text-5xl font-bold">
              {tienda.name}
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TiendaDetalle;
