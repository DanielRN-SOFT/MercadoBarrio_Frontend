import { useParams } from "react-router-dom";
import { tiendas } from "../../tiendas";
import { FaLocationDot, FaPhone, FaClock } from "react-icons/fa6";

import HeroSection from "../../components/TiendaDetalle/HeroSection";
import InfoStat from "../../components/TiendaDetalle/InfoStat";

const TiendaDetalle = () => {
  const { id: tiendaId } = useParams();
  const tienda = tiendas.find((tienda) => tienda.id == tiendaId);
  return (
    <main class="pb-20  mx-auto">
      <HeroSection tienda={tienda} />

      <div className="stats shadow flex flex-col md:grid md:grid-cols-3">
        <InfoStat
          title={"Direccion"}
          icono={<FaLocationDot />}
          mensaje={tienda.address}
        />

        <InfoStat
          title={"Telefono"}
          icono={<FaPhone />}
          mensaje={tienda.phone}
        />

        <InfoStat
          title={"Horario"}
          icono={<FaClock/>}
          mensaje={tienda.schedule}
        />
      </div>
    </main>
  );
};

export default TiendaDetalle;
