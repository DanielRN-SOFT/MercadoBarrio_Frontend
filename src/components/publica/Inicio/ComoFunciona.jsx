import {
  IoSearchSharp,
  IoStorefrontSharp,
  IoStatsChartSharp,
} from "react-icons/io5";

const pasos = [
  {
    icon: <IoSearchSharp className="text-3xl text-primary" />,
    titulo: "Busca tu barrio",
    descripcion: "Encuentra tiendas cerca de ti por categoría o nombre.",
  },
  {
    icon: <IoStorefrontSharp className="text-3xl text-primary" />,
    titulo: "Encuentra la tienda",
    descripcion: "Consulta el perfil, horario y ubicación de cada negocio.",
  },
  {
    icon: <IoStatsChartSharp className="text-3xl text-primary" />,
    titulo: "Consulta el stock",
    descripcion: "Ve los productos disponibles en tiempo real antes de ir.",
  },
];

const ComoFunciona = () => {
  return (
    <section className="pt-10 py-20 px-margin-mobile md:px-margin-desktop">
      <div className="text-center mb-8">
        <span className="badge badge-primary badge-outline mb-4">
          Simple y rápido
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-on-surface">
          ¿Cómo funciona{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-tr from-primary to-primary-container">
            MercadoBarrio?
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pasos.map((paso, i) => (
          <div
            key={i}
            className="card bg-base-100 border border-base-300 p-6 items-center text-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              {paso.icon}
            </div>
            <span className="badge badge-primary badge-outline">
              Paso {i + 1}
            </span>
            <h4 className="font-title-md text-title-md text-on-surface">
              {paso.titulo}
            </h4>
            <p className="text-on-surface/60 font-body-sm text-body-sm">
              {paso.descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ComoFunciona;
